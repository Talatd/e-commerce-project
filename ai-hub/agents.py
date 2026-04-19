import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
import google.generativeai as genai
from sqlalchemy import create_engine, text
import json

GREETINGS = {"hi", "hello", "hey", "good morning", "good evening", "good afternoon", "merhaba", "selam"}
MAX_RETRIES = 2

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

DB_URL = (
    f"mysql+mysqlconnector://{os.getenv('DB_USER', 'root')}:"
    f"{os.getenv('DB_PASSWORD', 'root')}@"
    f"{os.getenv('DB_HOST', 'localhost')}:3306/"
    f"{os.getenv('DB_NAME', 'smartstore_db')}"
)
engine = create_engine(DB_URL)

SCHEMA_DESCRIPTION = """
Tables (MySQL, all column names use snake_case):
- users (user_id INT PK, email VARCHAR, password_hash VARCHAR, full_name VARCHAR, role ENUM('ADMIN','MANAGER','CONSUMER'), enabled BOOLEAN, created_at TIMESTAMP)
- products (product_id INT PK, name VARCHAR, description TEXT, brand VARCHAR, category VARCHAR, base_price DECIMAL(10,2), image_url VARCHAR, stock_quantity INT, created_at TIMESTAMP, updated_at TIMESTAMP)
- regional_inventory (inventory_id INT PK, product_id INT FK→products, region VARCHAR, stock_quantity INT)
- orders (order_id INT PK, user_id INT FK→users, total_amount DECIMAL(10,2), shipping_address TEXT, status ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED'), order_date TIMESTAMP)
- order_items (order_item_id INT PK, order_id INT FK→orders, product_id INT FK→products, quantity INT, price_at_purchase DECIMAL(10,2))
- product_reviews (review_id INT PK, product_id INT FK→products, user_id INT FK→users, rating TINYINT 1-5, comment TEXT, sentiment_score DECIMAL(3,2), store_response VARCHAR(1000), responded_at TIMESTAMP, created_at TIMESTAMP)
- stores (id INT PK, name VARCHAR, owner_name VARCHAR, owner_id INT FK→users, total_revenue DECIMAL(12,2), order_count INT, rating DECIMAL(3,2), status ENUM('OPEN','CLOSED','PENDING'), created_at TIMESTAMP)
- shipments (shipment_id INT PK, order_id INT FK→orders, warehouse_block VARCHAR, mode_of_shipment VARCHAR, carrier VARCHAR, tracking_number VARCHAR, status ENUM('PREPARING','SHIPPED','IN_TRANSIT','DELIVERED','RETURNED'), shipped_at TIMESTAMP, delivered_at TIMESTAMP, estimated_delivery TIMESTAMP, customer_care_calls INT, customer_rating TINYINT, cost_of_product DECIMAL(10,2), prior_purchases INT, product_importance ENUM('LOW','MEDIUM','HIGH'), discount_offered DECIMAL(5,2), on_time_delivery BOOLEAN)
- categories (category_id INT PK, name VARCHAR, description TEXT, image_url VARCHAR, parent_id INT FK→categories NULL, display_order INT, active BOOLEAN)
- customer_profiles (profile_id INT PK, user_id INT FK→users UNIQUE, gender VARCHAR, age INT, city VARCHAR, country VARCHAR, membership_type ENUM('BASIC','SILVER','GOLD','PLATINUM'), total_spend DECIMAL(12,2), items_purchased INT, avg_rating DECIMAL(3,2), discount_applied BOOLEAN, satisfaction_level ENUM('UNSATISFIED','NEUTRAL','SATISFIED','VERY_SATISFIED'))
- integration_logs (id INT PK, username VARCHAR, action VARCHAR, type VARCHAR, detail TEXT, created_at TIMESTAMP)

IMPORTANT: Always use snake_case column names in SQL queries. Example: user_id NOT userId, base_price NOT basePrice, order_date NOT orderDate.
Note: orders table has NO store_id column. To find orders related to a store, you cannot directly join orders to stores.
"""


def guardrails_agent(state: AgentState):
    """Checks if the query is in scope for e-commerce analytics."""
    query_lower = state["query"].strip().lower()

    if query_lower in GREETINGS or any(query_lower.startswith(g) for g in GREETINGS):
        return {
            "is_in_scope": False,
            "response": "Hello! 👋 I'm your SmartStore AI assistant. Ask me anything about products, orders, sales, or customers and I'll query the database for you!",
            "next_step": "end",
        }

    prompt = f"""
    You are a guardrails classifier for an e-commerce analytics chatbot.
    The user asked: "{state['query']}"
    
    Determine if this question is related to e-commerce (products, orders, customers, sales, inventory, reviews, shipping, analytics).
    Answer with ONLY "yes" or "no".
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    try:
        resp = model.generate_content(prompt)
        answer = resp.text.strip().lower()
    except Exception:
        return {"is_in_scope": True, "next_step": "generate_sql"}

    if answer.startswith("no") or answer == "no":
        return {
            "is_in_scope": False,
            "response": "I'm specialized in e-commerce analytics. I can help with product data, orders, customers, sales, reviews, and inventory. Please ask a related question!",
            "next_step": "end",
        }

    return {"is_in_scope": True, "next_step": "generate_sql"}


def sql_agent(state: AgentState):
    """Generates SQL from natural language with role-based constraints."""
    history_context = "\n".join(state.get("history", []))

    role_constraint = ""
    if state["user_role"] == "CONSUMER":
        role_constraint = f"IMPORTANT: This user (user_id={state['user_id']}) can ONLY see their own orders, reviews, and profile. Always filter by user_id={state['user_id']}."
    elif state["user_role"] == "MANAGER":
        role_constraint = (
            f"IMPORTANT: This is a store manager (user_id={state['user_id']}). "
            f"They can ONLY see data related to their own store. "
            f"Always JOIN with stores table and filter by stores.owner_id={state['user_id']} "
            f"or filter orders/products belonging to their store. "
            f"They cannot see other stores' data, other users' personal data, or platform-wide aggregates."
        )

    prompt = f"""
    You are a MySQL expert for an e-commerce platform.
    {SCHEMA_DESCRIPTION}
    
    Chat History: {history_context}
    Current User Query: {state['query']}
    User Role: {state['user_role']}
    {role_constraint}
    
    Generate a valid READ-ONLY MySQL query. Use JOINs when needed. Limit results to 50 rows max.
    ONLY RETURN THE RAW SQL CODE, no markdown formatting.
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    try:
        response = model.generate_content(prompt)
        sql = response.text.replace("```sql", "").replace("```", "").strip()
    except Exception as e:
        return {"sql_query": "", "error": f"AI model error: {str(e)}", "next_step": "end"}
    return {"sql_query": sql, "next_step": "execute"}


def _is_read_only_select(sql: str) -> bool:
    """Reject anything that is not a single SELECT (defense in depth for LLM-generated SQL)."""
    s = (sql or "").strip()
    if not s:
        return False
    parts = [p.strip() for p in s.split(";") if p.strip()]
    if len(parts) != 1:
        return False
    first = parts[0].lower()
    if not (first.startswith("select") or first.startswith("with")):
        return False
    # Block UNION-based multi-query tricks in a single statement
    if " union " in f" {first} ":
        return False
    banned = (" insert ", " update ", " delete ", " drop ", " alter ", " truncate ", " grant ", " revoke ")
    padded = f" {first} "
    return not any(b in padded for b in banned)


MAX_SQL_RESULT_ROWS = 100
SQL_MAX_EXECUTION_MS = 10_000


def execution_agent(state: AgentState):
    """Executes SQL safely against the database."""
    if not state.get("sql_query"):
        return {
            "next_step": "respond",
            "error": "",
            "response": state.get("response") or "I wasn't able to generate a query for that. Could you rephrase?",
            "results": [],
        }
    raw_sql = state["sql_query"].strip()
    if not _is_read_only_select(raw_sql):
        return {
            "error": "Only a single read-only SELECT query is allowed.",
            "results": [],
            "next_step": "error_handler",
        }
    try:
        with engine.connect() as conn:
            conn.execute(text(f"SET SESSION MAX_EXECUTION_TIME={SQL_MAX_EXECUTION_MS}"))
            result = conn.execute(text(raw_sql))
            rows = []
            for i, row in enumerate(result):
                if i >= MAX_SQL_RESULT_ROWS:
                    return {
                        "error": f"Result exceeded {MAX_SQL_RESULT_ROWS} rows; refine the query with filters or LIMIT.",
                        "results": [],
                        "next_step": "error_handler",
                    }
                rows.append(dict(row._mapping))
            serializable = []
            for row in rows:
                clean = {}
                for k, v in row.items():
                    try:
                        json.dumps(v)
                        clean[k] = v
                    except (TypeError, ValueError):
                        clean[k] = str(v)
                serializable.append(clean)
            return {"results": serializable, "next_step": "respond", "error": ""}
    except Exception as e:
        return {
            "error": str(e),
            "results": [],
            "next_step": "error_handler",
        }


def error_agent(state: AgentState):
    """Attempts to fix SQL errors and retry."""
    count = state.get("iteration_count", 0)
    if count >= MAX_RETRIES:
        return {
            "response": f"I tried to query the database but encountered an error: {state.get('error', 'Unknown')}. Please rephrase your question.",
            "next_step": "end",
            "iteration_count": count,
        }

    prompt = f"""
    The following SQL query caused an error:
    SQL: {state['sql_query']}
    Error: {state['error']}
    
    {SCHEMA_DESCRIPTION}
    
    Fix the SQL query. ONLY RETURN THE RAW SQL CODE.
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    try:
        response = model.generate_content(prompt)
        fixed_sql = response.text.replace("```sql", "").replace("```", "").strip()
    except Exception as e:
        return {"sql_query": "", "error": f"AI model error: {str(e)}", "next_step": "end", "response": "Sorry, I could not process your request right now."}
    return {
        "sql_query": fixed_sql,
        "next_step": "execute",
        "iteration_count": count + 1,
    }


def response_agent(state: AgentState):
    """Explains query results in natural language."""
    history_context = "\n".join(state.get("history", []))
    results_preview = str(state.get("results", []))[:3000]

    prompt = f"""
    You are an analytics assistant. Explain these database results in a clear, professional way.
    
    Results: {results_preview}
    Original question: {state['query']}
    Chat History: {history_context}
    User Role: {state['user_role']}
    
    Rules:
    - Mask any emails or passwords if found (show only first 3 chars + ***)
    - Use bullet points for clarity when there are multiple items
    - Include key numbers and statistics
    - Be concise but informative
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    try:
        response = model.generate_content(prompt)
        answer = response.text
    except Exception as e:
        answer = f"I retrieved the data but encountered an error generating the analysis: {str(e)}"
    return {"response": answer, "next_step": "visualize"}


def visualization_agent(state: AgentState):
    """Decides if a chart would be helpful and generates Plotly code."""
    results = state.get("results", [])
    if not results or len(results) < 2:
        return {"visualization_code": "", "next_step": "end"}

    prompt = f"""
    Given these query results (first 10 rows): {str(results[:10])}
    Original question: {state['query']}
    
    Would a chart be helpful? If yes, generate Python Plotly code that creates a chart from `data` variable (list of dicts).
    The code should produce a JSON string via `fig.to_json()`.
    If no chart is needed, respond with exactly "NO_CHART".
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    try:
        response = model.generate_content(prompt)
        code = response.text.strip()
    except Exception:
        return {"visualization_code": "", "next_step": "end"}

    if "NO_CHART" in code:
        return {"visualization_code": "", "next_step": "end"}

    clean_code = code.replace("```python", "").replace("```", "").strip()
    return {"visualization_code": clean_code, "next_step": "end"}


# Router functions
def route_after_guardrails(state: AgentState):
    if state.get("is_in_scope"):
        return "sql_writer"
    return END


def route_after_execution(state: AgentState):
    if state.get("error"):
        return "error_handler"
    return "responder"


def route_after_error(state: AgentState):
    if state.get("next_step") == "execute":
        return "sql_executor"
    return END


# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("guardrails", guardrails_agent)
workflow.add_node("sql_writer", sql_agent)
workflow.add_node("sql_executor", execution_agent)
workflow.add_node("error_handler", error_agent)
workflow.add_node("responder", response_agent)
workflow.add_node("visualizer", visualization_agent)

workflow.set_entry_point("guardrails")

workflow.add_conditional_edges("guardrails", route_after_guardrails, {"sql_writer": "sql_writer", END: END})
workflow.add_edge("sql_writer", "sql_executor")
workflow.add_conditional_edges("sql_executor", route_after_execution, {"error_handler": "error_handler", "responder": "responder"})
workflow.add_conditional_edges("error_handler", route_after_error, {"sql_executor": "sql_executor", END: END})
workflow.add_edge("responder", "visualizer")
workflow.add_edge("visualizer", END)

ai_graph = workflow.compile()
