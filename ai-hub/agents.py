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
Tables:
- users (userId, email, passwordHash, fullName, role [ADMIN/MANAGER/CONSUMER], enabled, createdAt)
- products (productId, name, description, brand, category, basePrice, imageUrl, stockQuantity, createdAt, updatedAt)
- orders (orderId, user_id, totalAmount, shippingAddress, status [PENDING/PROCESSING/SHIPPED/DELIVERED/CANCELLED], orderDate)
- order_items (orderItemId, order_id, product_id, quantity, priceAtPurchase)
- product_reviews (reviewId, product_id, user_id, rating, comment, sentimentScore, createdAt)
- regional_inventory (inventoryId, product_id, region, stockQuantity)
- stores (id, name, ownerName, totalRevenue, orderCount, rating, status)
- shipments (shipmentId, order_id, warehouseBlock, modeOfShipment, carrier, trackingNumber, status, shippedAt, deliveredAt, estimatedDelivery)
- categories (categoryId, name, description, parent_id, displayOrder, active)
- customer_profiles (profileId, user_id, gender, age, city, country, membershipType, totalSpend, itemsPurchased, avgRating, satisfactionLevel)
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
    resp = model.generate_content(prompt)
    answer = resp.text.strip().lower()

    if "no" in answer:
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
        role_constraint = "This is a store manager. They can see their store's products, orders, and customers but not other stores."

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
    response = model.generate_content(prompt)
    sql = response.text.replace("```sql", "").replace("```", "").strip()
    return {"sql_query": sql, "next_step": "execute"}


def execution_agent(state: AgentState):
    """Executes SQL safely against the database."""
    if not state.get("sql_query"):
        return {"next_step": "respond", "error": "No SQL query generated"}
    try:
        with engine.connect() as conn:
            result = conn.execute(text(state["sql_query"]))
            rows = [dict(row._mapping) for row in result]
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
    response = model.generate_content(prompt)
    fixed_sql = response.text.replace("```sql", "").replace("```", "").strip()
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
    response = model.generate_content(prompt)
    return {"response": response.text, "next_step": "visualize"}


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
    response = model.generate_content(prompt)
    code = response.text.strip()

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
