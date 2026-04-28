import os
import json
import sqlparse
import sys
from typing import TypedDict, List, Annotated, Union, Optional
from langgraph.graph import StateGraph, END, START
import google.generativeai as genai
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

GREETINGS = {"hi", "hello", "hey", "merhaba", "selam", "günaydın", "iyi günler", "naber", "nasıl gidiyor"}

class AgentState(TypedDict):
    query: str
    history: List[str]
    session_id: str
    user_id: int
    user_role: str
    session_store_id: Optional[int]
    sql_query: str
    results: List[dict]
    response: str
    next_step: str
    is_in_scope: bool
    iteration_count: int
    visualization_code: str
    error: str

# DB Connection
DB_URL = (
    f"mysql+mysqlconnector://{os.getenv('DB_USER', 'root')}:"
    f"{os.getenv('DB_PASSWORD', 'root')}@"
    f"{os.getenv('DB_HOST', 'localhost')}:3306/"
    f"{os.getenv('DB_NAME', 'smartstore_db')}"
)
engine = create_engine(DB_URL)

SCHEMA_DESCRIPTION = """
VERİTABANI ŞEMASI:
- users (user_id, email, full_name, role)
- stores (id, name, owner_id)
- products (product_id, store_id, name, brand, category, base_price, stock_quantity)
- orders (order_id, user_id, total_amount, subtotal_amount, status, order_date, shipping_address)
- order_items (order_item_id, order_id, product_id, quantity, price_at_purchase)
- shipments (shipment_id, order_id, status, tracking_number)

ROL KURALLARI:
- CONSUMER: Sadece kendi siparişlerini görebilir (orders.user_id = X).
- MANAGER: Kendi mağazasının ürünlerini ve siparişlerini görebilir (products.store_id = Y).
- ADMIN: Tüm verilere erişebilir.
"""

def guardrails_agent(state: AgentState):
    q = state["query"].strip().lower()
    if any(g in q for g in GREETINGS) and len(q) < 15:
        return {**state, "is_in_scope": False, "response": "Merhaba! Ben SmartStore asistanıyım, size nasıl yardımcı olabilirim?", "next_step": "end"}
    return {**state, "is_in_scope": True, "next_step": "sql"}

def sql_agent(state: AgentState):
    role = state.get("user_role", "CONSUMER")
    uid = state.get("user_id", 0)
    sid = state.get("session_store_id")
    
    role_clause = ""
    if role == "CONSUMER":
        role_clause = f"Kısıtlama: Sadece user_id = {uid} olan siparişleri getir."
    elif role == "MANAGER":
        if sid:
            role_clause = f"Kısıtlama: Sadece store_id = {sid} olan ürünleri getir."
        else:
            role_clause = f"Kısıtlama: owner_id = {uid} olan mağazanın verilerini getir."

    prompt = f"""
    Sen bir MySQL uzmanısın. 
    {SCHEMA_DESCRIPTION}
    {role_clause}
    
    Kullanıcı Sorusu: {state['query']}
    
    Kural: Sadece tek bir SELECT sorgusu üret. Markdown (```sql) kullanma. Sadece ham SQL kodu döndür.
    İpucu: Sorguda DISTINCT kullanmayı unutma.
    """
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    try:
        response = model.generate_content(prompt)
        sql = response.text.strip()
        
        # Temizlik
        for tag in ["```sql", "```SQL", "```"]:
            sql = sql.replace(tag, "")
        sql = sql.strip()
        
        pos = sql.upper().find("SELECT")
        if pos != -1:
            sql = sql[pos:].strip()
            
        print(f"DEBUG: Generated SQL: {sql}", file=sys.stderr)
        return {**state, "sql_query": sql, "next_step": "execute", "error": ""}
    except Exception as e:
        print(f"DEBUG: SQL Agent Error: {str(e)}", file=sys.stderr)
        return {**state, "error": f"SQL Üretilemedi: {str(e)}", "next_step": "error"}

def execution_agent(state: AgentState):
    sql = state.get("sql_query", "")
    if not sql or not sql.strip().lower().startswith("select"):
        err_msg = state.get("error") or "Sorgu boş üretildi."
        return {**state, "error": f"Sorgu hatası: {err_msg}", "next_step": "error"}
    
    try:
        with engine.connect() as conn:
            res = conn.execute(text(sql))
            rows = [dict(r._mapping) for r in res]
            return {**state, "results": json.loads(json.dumps(rows, default=str)), "next_step": "analyze", "error": ""}
    except Exception as e:
        return {**state, "error": f"Veritabanı çalıştırma hatası: {str(e)}", "next_step": "error"}

def analyze_agent(state: AgentState):
    rows = state.get("results", [])
    if not rows:
        return {**state, "response": "İstediğiniz kriterlere uygun veri bulunamadı.", "next_step": "end"}
    
    prompt = f"""
    Sen bir mağaza asistanısın. Aşağıdaki verileri kullanıcıya Türkçe olarak samimi bir dille özetle:
    Soru: {state['query']}
    Veriler: {json.dumps(rows[:10])}
    """
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    try:
        response = model.generate_content(prompt)
        return {**state, "response": response.text.strip(), "next_step": "end"}
    except Exception as e:
        return {**state, "response": f"Verilere ulaşıldı ({len(rows)} kayıt), ancak özetleme sırasında bir sorun oluştu.", "next_step": "end"}

def error_agent(state: AgentState):
    return {**state, "response": f"Üzgünüm, bir hata oluştu: {state['error']}", "next_step": "end"}

# Grafik Yapısı
builder = StateGraph(AgentState)
builder.add_node("guardrails", guardrails_agent)
builder.add_node("sql", sql_agent)
builder.add_node("execute", execution_agent)
builder.add_node("analyze", analyze_agent)
builder.add_node("error", error_agent)

builder.add_edge(START, "guardrails")
builder.add_conditional_edges("guardrails", lambda x: "sql" if x["is_in_scope"] else END)
builder.add_conditional_edges("sql", lambda x: "execute" if not x["error"] else "error")
builder.add_conditional_edges("execute", lambda x: "analyze" if not x["error"] else "error")
builder.add_edge("analyze", END)
builder.add_edge("error", END)

ai_graph = builder.compile()
