import os
from typing import TypedDict, Annotated, List, Union
from langgraph.graph import StateGraph, END
import google.generativeai as genai
from sqlalchemy import create_engine, text

# Define the state of our graph
class AgentState(TypedDict):
    query: str
    user_id: int
    user_role: str
    sql_query: str
    results: List[dict]
    response: str
    next_step: str

# Database setup for the agent
DB_URL = f"mysql+mysqlconnector://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', 'root')}@{os.getenv('DB_HOST', 'localhost')}:3306/{os.getenv('DB_NAME', 'smartstore_db')}"
engine = create_engine(DB_URL)

def sql_agent(state: AgentState):
    """Generates SQL based on prompt."""
    prompt = f"""
    You are a MySQL expert. Our schema has tables: users, products, regional_inventory, orders, order_items, product_reviews.
    Convert this user query into a valid READ-ONLY MySQL query.
    User Query: {state['query']}
    User Role: {state['user_role']}
    ONLY RETURN THE SQL CODE.
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    sql = response.text.replace("```sql", "").replace("```", "").strip()
    return {"sql_query": sql, "next_step": "execute"}

def execution_agent(state: AgentState):
    """Executes the SQL query."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(state['sql_query']))
            rows = [dict(row._mapping) for row in result]
            return {"results": rows, "next_step": "respond"}
    except Exception as e:
        return {"response": f"Database error: {str(e)}", "next_step": "end"}

def response_agent(state: AgentState):
    """Formats the results and masks sensitive data."""
    prompt = f"""
    Explain these results to the user: {state['results']}
    The original query was: {state['query']}
    Role: {state['user_role']}
    IMPORTANT: Mask any emails or full names if found in the data (e.g. j***@example.com).
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return {"response": response.text, "next_step": "end"}

# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("sql_writer", sql_agent)
workflow.add_node("sql_executor", execution_agent)
workflow.add_node("responder", response_agent)

workflow.set_entry_point("sql_writer")

workflow.add_edge("sql_writer", "sql_executor")
workflow.add_edge("sql_executor", "responder")
workflow.add_edge("responder", END)

ai_graph = workflow.compile()
