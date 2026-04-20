import chainlit as cl
import os
import asyncio
import plotly.io as pio
import json
from agents import ai_graph

@cl.on_chat_start
async def start():
    cl.user_session.set("history", [])
    await cl.Message(content="Welcome to **SmartStore AI Analytics**! I can help you query and visualize your e-commerce data using natural language.").send()

@cl.on_message
async def main(message: cl.Message):
    history = cl.user_session.get("history")
    
    # Show a loading/processing message
    msg = cl.Message(content="Processing your request...")
    await msg.send()
    
    initial_state = {
        "query": message.content,
        "history": history,
        "session_id": "chainlit-session",
        "user_id": 1, # Default Admin for Chainlit view
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

    # Run the LangGraph
    final_state = await asyncio.to_thread(ai_graph.invoke, initial_state)
    
    # Update History
    history.append(f"User: {message.content}")
    history.append(f"AI: {final_state.get('response', '')}")
    cl.user_session.set("history", history)

    # Prepare response
    res_text = final_state.get("response", "I encountered an error processing that.")
    sql = final_state.get("sql_query")
    
    if sql:
        res_text += f"\n\n**Generated SQL:**\n```sql\n{sql}\n```"
    
    msg.content = res_text
    await msg.update()

    # Handle Visualization
    viz_code = final_state.get("visualization_code")
    if viz_code:
        try:
            # We expect the code to produce a json string via fig.to_json()
            # We will execute it in a safe context
            local_vars = {"data": final_state.get("results"), "pio": pio, "json": json}
            exec(f"import plotly.graph_objects as go\nimport plotly.express as px\n{viz_code}\nresult_json = fig.to_json()", {}, local_vars)
            
            fig_json = local_vars.get("result_json")
            if fig_json:
                chart = cl.Plotly(name="chart", figure=fig_json, display="inline")
                await cl.Message(content="Here is the visualization:", elements=[chart]).send()
        except Exception as e:
            await cl.Message(content=f"Could not generate chart: {str(e)}").send()

if __name__ == "__main__":
    from chainlit.cli import run_chainlit
    run_chainlit(__file__)
