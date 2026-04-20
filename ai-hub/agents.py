import os
import json
import sqlparse
from typing import TypedDict, List, Annotated, Union
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
- products (product_id INT PK, name, description, brand, category, base_price, image_url, stock_quantity)
- regional_inventory (inventory_id INT PK, product_id FK->products.product_id, region, stock_quantity)
- orders (order_id INT PK, user_id FK->users.user_id, total_amount, shipping_address, status ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED'), order_date)
- order_items (order_item_id INT PK, order_id FK->orders.order_id, product_id FK->products.product_id, quantity, price_at_purchase)
- product_reviews (review_id INT PK, product_id FK->products.product_id, user_id FK->users.user_id, rating, comment, sentiment_score, store_response, created_at)
- categories (category_id INT PK, name, description, parent_id FK->categories.category_id, active)
- customer_profiles (profile_id INT PK, user_id FK->users.user_id, gender, age, city, country, membership_type, total_spend, items_purchased, avg_rating, satisfaction_level)

RULES:
1. Use snake_case.
2. Join order_items with products/orders to get product names or customer details.
3. For Managers: Always filter by owner_id in stores or related joins.
"""

def guardrails_agent(state: AgentState):
    """Checks if the query is in scope."""
    q = state["query"].strip().lower()
    if any(g in q for g in GREETINGS) and len(q) < 15:
        return {**state, "is_in_scope": False, "response": "Hello! I am your SmartStore AI Assistant. How can I help you with your data today?", "next_step": "end"}
    
    prompt = f"Is the following query related to e-commerce data (sales, products, users, reviews, etc)? Query: '{state['query']}'. Answer with ONLY 'YES' or 'NO'."
    model = genai.GenerativeModel("gemini-flash-latest")
    resp = model.generate_content(prompt).text.strip().upper()
    
    if "NO" in resp:
        return {**state, "is_in_scope": False, "response": "I can only assist with e-commerce data analysis queries.", "next_step": "end"}
    return {**state, "is_in_scope": True, "next_step": "sql"}

def sql_agent(state: AgentState):
    """Generates SQL query based on user role."""
    role = state.get("user_role", "CONSUMER")
    uid = state.get("user_id", 0)
    
    role_clause = ""
    if role == "CONSUMER":
        role_clause = f"IMPORTANT: User (ID: {uid}) can only see their OWN data. Filter by user_id = {uid}."
    elif role == "MANAGER":
        role_clause = f"IMPORTANT: Manager (ID: {uid}) can only see their STORE data. Join stores and filter by stores.owner_id = {uid}."

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
    if state.get("iteration_count", 0) >= MAX_RETRIES:
        return {**state, "next_step": "end", "response": f"Error: {state['error']}"}
    
    prompt = f"The SQL '{state['sql_query']}' failed with error: {state['error']}. Fix it for MySQL based on this schema: {SCHEMA_DESCRIPTION}. Return ONLY SQL."
    model = genai.GenerativeModel("gemini-flash-latest")
    fixed_sql = model.generate_content(prompt).text.strip().replace("```sql", "").replace("```", "").strip()
    return {**state, "sql_query": fixed_sql, "iteration_count": state.get("iteration_count", 0) + 1, "next_step": "execute"}

def analysis_agent(state: AgentState):
    """Explains results in natural language."""
    data_str = json.dumps(state["results"][:10], indent=2)
    prompt = f"Analyze these results for the user query '{state['query']}':\n{data_str}\nProvide a professional and concise summary."
    model = genai.GenerativeModel("gemini-flash-latest")
    resp = model.generate_content(prompt).text
    return {**state, "response": resp, "next_step": "visualize"}

def visualization_agent(state: AgentState):
    """Creates charts if needed."""
    if not state["results"] or len(state["results"]) < 2:
        return {**state, "next_step": "end"}
        
    prompt = f"Generate Plotly Python code to visualize this data for the query '{state['query']}': {state['results'][:5]}. Variable 'data' is the full result list. Return ONLY code producing 'fig.to_json()'."
    model = genai.GenerativeModel("gemini-flash-latest")
    code = model.generate_content(prompt).text.strip().replace("```python", "").replace("```", "").strip()
    return {**state, "visualization_code": code, "next_step": "end"}

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
builder.add_edge("analyze", "visualize")
builder.add_edge("visualize", END)

ai_graph = builder.compile()
