import os
import json
import sqlparse
from typing import TypedDict, List, Annotated, Union, Optional
from langgraph.graph import StateGraph, END, START
import google.generativeai as genai
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

GREETINGS = {"hi", "hello", "hey", "merhaba", "selam", "günaydın", "iyi günler"}
MAX_RETRIES = 3

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
DATABASE SCHEMA (MySQL):
- users (user_id INT PK, email, password_hash, full_name, role ENUM('ADMIN','MANAGER','CONSUMER'), enabled, created_at)
- stores (id INT PK, name, owner_name, owner_id FK->users.user_id, total_revenue, order_count, rating, status ENUM('OPEN','CLOSED','PENDING'))
- products (product_id INT PK, store_id FK->stores.id, name, description, brand, category, base_price, image_url, stock_quantity)
- regional_inventory (inventory_id INT PK, product_id FK->products.product_id, region, stock_quantity)
- shipping_info (id INT PK, product_id FK->products.product_id, carrier_name, estimated_days, shipping_cost, shipping_region, is_free_shipping)
- product_specifications (id INT PK, product_id FK->products.product_id, spec_key, spec_value)
- shipments (shipment_id INT PK, order_id FK->orders.order_id, status, carrier, tracking_number UNIQUE, estimated_delivery, delivered_at, created_at)
- integration_logs (id INT PK, username, action, type, detail, created_at)
- password_reset_tokens (id INT PK, user_id FK->users.user_id, token UNIQUE, expires_at, used)
- coupons (coupon_id INT PK, code UNIQUE, percent_off, active, restricted_category, expires_at)
- orders (order_id INT PK, user_id FK->users.user_id, total_amount, subtotal_amount, discount_amount, tax_amount, shipping_amount, coupon_code, shipping_address, status ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED'), order_date)
- order_items (order_item_id INT PK, order_id FK->orders.order_id, product_id FK->products.product_id, quantity, price_at_purchase)
- product_reviews (review_id INT PK, product_id FK->products.product_id, user_id FK->users.user_id, rating, comment, sentiment_score, store_response, created_at)
- categories (category_id INT PK, name, description, parent_id FK->categories.category_id, active)
- customer_profiles (profile_id INT PK, user_id FK->users.user_id, gender, age, city, country, membership_type, total_spend, items_purchased, avg_rating, satisfaction_level)
- order_events (id INT PK, order_id FK->orders.order_id, status, event_date, notes)

BUSINESS RULES (important for correct SQL):
1. Order totals are server-calculated:
   - orders.subtotal_amount = SUM(order_items.quantity * order_items.price_at_purchase)
   - orders.discount_amount is the coupon discount (0 when no coupon)
   - orders.tax_amount is tax on (subtotal - discount)
   - orders.shipping_amount is shipping cost (can be 0)
   - orders.total_amount = (subtotal - discount) + tax + shipping
2. Coupons:
   - coupons.code is case-insensitive in validation, but stored/returned as UPPERCASE
   - coupons.percent_off is 0–100 (percentage discount)
   - coupon is valid when active = true AND (expires_at is NULL OR expires_at > NOW())
   - if coupons.restricted_category is NOT NULL, it only applies to order items where products.category = restricted_category
   - when applied, orders.coupon_code = coupons.code (otherwise NULL)
3. Prefer order financial columns on orders table (subtotal/discount/tax/shipping/total) instead of re-deriving,
   unless the user explicitly asks to recompute from order_items.

RULES:
1. Use snake_case.
2. Join order_items with products/orders to get product names or customer details.
3. For Managers: Always filter by owner_id in stores or related joins.
4. Prefer using explicit joined table filters for access control (don't rely on client-provided IDs).
"""

def guardrails_agent(state: AgentState):
    """Checks if the query is in scope."""
    q = state["query"].strip().lower()
    if any(g in q for g in GREETINGS) and len(q) < 15:
        return {**state, "is_in_scope": False, "response": "Hello! I am your SmartStore AI Assistant. How can I help you with your data today?", "next_step": "end"}

    # Lightweight heuristic (no LLM call) to avoid burning quota.
    keywords = [
        "order", "sipariş", "siparis", "revenue", "ciro", "sales", "gelir",
        "product", "ürün", "urun", "stock", "stok", "customer", "müşteri", "musteri",
        "shipment", "kargo", "shipping", "review", "yorum", "category", "kategori",
        "store", "mağaza", "magaza", "user", "kullanıcı", "kullanici",
    ]
    if not any(k in q for k in keywords):
        return {**state, "is_in_scope": False, "response": "I can only assist with SmartStore e-commerce data analysis questions.", "next_step": "end"}

    return {**state, "is_in_scope": True, "next_step": "sql"}

def sql_agent(state: AgentState):
    """Generates SQL query based on user role."""
    role = state.get("user_role", "CONSUMER")
    uid = state.get("user_id", 0)
    sid = state.get("session_store_id")
    
    role_clause = ""
    if role == "CONSUMER":
        role_clause = f"IMPORTANT: User (ID: {uid}) can only see their OWN data. Filter by orders.user_id = {uid} (or user_id where applicable)."
    elif role == "MANAGER":
        # Prefer server-provided session store id when available; otherwise fall back to owner_id join.
        if sid is not None:
            role_clause = f"IMPORTANT: Manager can only see their STORE data. Always filter by products.store_id = {sid} (or stores.id = {sid})."
        else:
            role_clause = f"IMPORTANT: Manager can only see their STORE data. Join stores and filter by stores.owner_id = {uid}."
    elif role == "ADMIN":
        role_clause = "IMPORTANT: Admin can query platform-wide analytics. Prefer efficient aggregates."

    prompt = f"""
    You are a MySQL expert. 
    {SCHEMA_DESCRIPTION}
    {role_clause}
    
    Current User Query: {state['query']}
    
    Generate a valid read-only SELECT query. Return ONLY raw SQL code without markdown.
    """
    model = genai.GenerativeModel("gemini-flash-latest")
    try:
        sql = model.generate_content(prompt).text.strip()
        sql = sql.replace("```sql", "").replace("```", "").strip()
        return {**state, "sql_query": sql, "next_step": "execute"}
    except Exception as e:
        return {**state, "error": str(e), "next_step": "end"}

def execution_agent(state: AgentState):
    """Executes SQL safely."""
    sql = state.get("sql_query", "")
    if not sql.lower().startswith("select"):
        return {**state, "error": "Only SELECT queries allowed", "next_step": "error"}
    
    try:
        with engine.connect() as conn:
            res = conn.execute(text(sql))
            rows = [dict(r._mapping) for r in res]
            # Convert non-serializable objects to string
            rows = json.loads(json.dumps(rows, default=str))
            return {**state, "results": rows, "next_step": "analyze", "error": ""}
    except Exception as e:
        return {**state, "error": str(e), "next_step": "error"}

def error_agent(state: AgentState):
    """Fixes SQL errors."""
    # Avoid additional LLM calls to save quota; ask user to refine instead.
    return {**state, "next_step": "end", "response": f"I couldn't run the generated SQL due to: {state['error']}. Try rephrasing your question with a time range and metric."}

def analysis_agent(state: AgentState):
    """Explains results in natural language."""
    rows = state.get("results") or []
    q = (state.get("query") or "").lower()

    is_tr = any(x in q for x in ["ç", "ğ", "ı", "ö", "ş", "ü", "sipariş", "urun", "ürün", "mağaza", "musteri", "müşteri"])
    if not rows:
        msg = "Eşleşen veri bulunamadı. Tarih aralığını genişletmeyi deneyin." if is_tr else "No matching data was returned. Try widening the date range."
        return {**state, "response": msg, "next_step": "end"}

    # Deterministic, user-friendly formatting (no LLM call).
    first = rows[0] if isinstance(rows[0], dict) else {}
    keys = list(first.keys())

    def _fmt_number(v):
        try:
            if v is None:
                return None
            # ints/floats as numbers
            if isinstance(v, (int, float)):
                return float(v)
            # strings that look like numbers
            s = str(v).strip().replace(",", "")
            return float(s) if s.replace(".", "", 1).isdigit() else None
        except Exception:
            return None

    def _fmt_currency(v):
        n = _fmt_number(v)
        if n is None:
            return str(v)
        # Keep it simple: $ with 2 decimals (backend is seeded with $ prices)
        return f"${n:,.2f}"

    def _is_money_key(k: str) -> bool:
        k = (k or "").lower()
        return any(x in k for x in ["revenue", "total", "amount", "price", "ciro", "gelir"])

    # Case A: one row, one column => answer directly.
    if len(rows) == 1 and len(keys) == 1:
        k = keys[0]
        v = first.get(k)
        val = _fmt_currency(v) if _is_money_key(k) else str(v)
        if is_tr:
            resp = f"{k.replace('_', ' ').capitalize()}: {val}"
        else:
            resp = f"{k.replace('_', ' ').capitalize()}: {val}"
        return {**state, "response": resp, "next_step": "end"}

    # Case B: small result set => render a compact table-like text.
    max_rows = 8
    show = rows[:max_rows]
    cols = keys[:6] if keys else []

    def _cell(k, v):
        if v is None:
            return "—"
        return _fmt_currency(v) if _is_money_key(k) else str(v)

    lines = []
    if cols:
        header = " | ".join([c.replace("_", " ") for c in cols])
        lines.append(header)
        lines.append("-" * min(len(header), 80))
        for r in show:
            if not isinstance(r, dict):
                continue
            lines.append(" | ".join(_cell(c, r.get(c)) for c in cols))

    if is_tr:
        prefix = f"{len(rows)} satır bulundu."
        resp = prefix + ("\n\n" + "\n".join(lines) if lines else "")
    else:
        prefix = f"Found {len(rows)} rows."
        resp = prefix + ("\n\n" + "\n".join(lines) if lines else "")

    # If we truncated rows, tell the user.
    if len(rows) > max_rows:
        resp += "\n\n" + ("Not: Daha fazla satır var, ilk kısmı gösteriyorum." if is_tr else "Note: More rows exist; showing the first ones.")

    return {**state, "response": resp, "next_step": "end"}

def visualization_agent(state: AgentState):
    """Visualization intentionally disabled for reliability/quota."""
    return {**state, "next_step": "end", "visualization_code": ""}

# Build Graph
builder = StateGraph(AgentState)
builder.add_node("guardrails", guardrails_agent)
builder.add_node("sql", sql_agent)
builder.add_node("execute", execution_agent)
builder.add_node("error", error_agent)
builder.add_node("analyze", analysis_agent)
builder.add_node("visualize", visualization_agent)

builder.add_edge(START, "guardrails")
builder.add_conditional_edges("guardrails", lambda x: "sql" if x["is_in_scope"] else END)
builder.add_edge("sql", "execute")
builder.add_conditional_edges("execute", lambda x: "error" if x["error"] else "analyze")
builder.add_conditional_edges("error", lambda x: "execute" if x["next_step"] == "execute" else END)
builder.add_edge("analyze", END)
ai_graph = builder.compile()
