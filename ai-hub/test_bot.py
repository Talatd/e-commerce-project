import os
from dotenv import load_dotenv
from agents import ai_graph
import json

load_dotenv()

def test():
    state = {
        "query": "En pahalı ürün hangisi?",
        "history": [],
        "session_id": "test",
        "user_id": 1,
        "user_role": "ADMIN",
        "sql_query": "",
        "results": [],
        "response": "",
        "next_step": "",
        "is_in_scope": True,
        "iteration_count": 0,
        "visualization_code": "",
        "error": ""
    }
    
    try:
        print("Running AI Graph test...")
        result = ai_graph.invoke(state)
        print("RESULT RESPONSE:", result.get("response"))
        print("RESULT SQL:", result.get("sql_query"))
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
