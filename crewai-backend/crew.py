"""
SmartStore AI - CrewAI Multi-Agent System
==========================================
This module defines the AI crew with three specialized agents
that work together to analyze products, generate marketing content,
and provide personalized shopping advice.
"""

import yaml
import os
from crewai import Agent, Task, Crew, Process
from crewai import LLM


def load_config(filename):
    """Load YAML configuration file."""
    config_path = os.path.join(os.path.dirname(__file__), "config", filename)
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# ──────────────────────────────────────────────
#  LLM Configuration (Google Gemini)
# ──────────────────────────────────────────────
def get_llm():
    """Create and return the Gemini LLM instance for CrewAI."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    return LLM(
        model="gemini/gemini-2.0-flash",
        api_key=api_key,
    )


# ──────────────────────────────────────────────
#  Agent Definitions
# ──────────────────────────────────────────────
def create_agents(llm):
    """Create all crew agents from the YAML config."""
    cfg = load_config("agents.yaml")

    product_analyst = Agent(
        role=cfg["product_analyst"]["role"],
        goal=cfg["product_analyst"]["goal"],
        backstory=cfg["product_analyst"]["backstory"],
        verbose=cfg["product_analyst"]["verbose"],
        allow_delegation=cfg["product_analyst"]["allow_delegation"],
        llm=llm,
    )

    marketing_strategist = Agent(
        role=cfg["marketing_strategist"]["role"],
        goal=cfg["marketing_strategist"]["goal"],
        backstory=cfg["marketing_strategist"]["backstory"],
        verbose=cfg["marketing_strategist"]["verbose"],
        allow_delegation=cfg["marketing_strategist"]["allow_delegation"],
        llm=llm,
    )

    customer_advisor = Agent(
        role=cfg["customer_advisor"]["role"],
        goal=cfg["customer_advisor"]["goal"],
        backstory=cfg["customer_advisor"]["backstory"],
        verbose=cfg["customer_advisor"]["verbose"],
        allow_delegation=cfg["customer_advisor"]["allow_delegation"],
        llm=llm,
    )

    return product_analyst, marketing_strategist, customer_advisor


# ──────────────────────────────────────────────
#  Task Definitions
# ──────────────────────────────────────────────
def create_tasks(agents, product_catalog, customer_query=""):
    """Create all crew tasks from the YAML config."""
    cfg = load_config("tasks.yaml")
    product_analyst, marketing_strategist, customer_advisor = agents

    catalog_analysis_task = Task(
        description=cfg["catalog_analysis"]["description"].format(
            product_catalog=product_catalog
        ),
        expected_output=cfg["catalog_analysis"]["expected_output"],
        agent=product_analyst,
    )

    marketing_content_task = Task(
        description=cfg["marketing_content"]["description"].format(
            product_catalog=product_catalog
        ),
        expected_output=cfg["marketing_content"]["expected_output"],
        agent=marketing_strategist,
    )

    shopping_advice_task = Task(
        description=cfg["shopping_advice"]["description"].format(
            product_catalog=product_catalog,
            customer_query=customer_query or "What are the best products in this store?",
        ),
        expected_output=cfg["shopping_advice"]["expected_output"],
        agent=customer_advisor,
    )

    return catalog_analysis_task, marketing_content_task, shopping_advice_task


# ──────────────────────────────────────────────
#  Crew Kickoff
# ──────────────────────────────────────────────
def kickoff_crew(product_catalog, customer_query="", task_type="all"):
    """
    Main entry point: create the crew and kick it off.

    Args:
        product_catalog: JSON string of the product catalog
        customer_query:  Optional customer question for the advisor
        task_type:       'all', 'analysis', 'marketing', or 'advice'

    Returns:
        dict with results from each agent
    """
    llm = get_llm()
    agents = create_agents(llm)
    all_tasks = create_tasks(agents, product_catalog, customer_query)
    catalog_task, marketing_task, advice_task = all_tasks

    # Select which tasks to run based on task_type
    task_map = {
        "analysis": [catalog_task],
        "marketing": [marketing_task],
        "advice": [advice_task],
        "all": [catalog_task, marketing_task, advice_task],
    }
    selected_tasks = task_map.get(task_type, [catalog_task])

    # Create and run the crew
    crew = Crew(
        agents=list(agents),
        tasks=selected_tasks,
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()

    return {
        "status": "success",
        "task_type": task_type,
        "result": str(result),
        "tasks_output": [
            {
                "task": task.description[:100] + "...",
                "agent": task.agent.role,
                "output": str(task.output) if task.output else "No output",
            }
            for task in selected_tasks
        ],
    }


# ──────────────────────────────────────────────
#  Standalone test
# ──────────────────────────────────────────────
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

    sample_catalog = """
    [
      {"name": "Wireless Headphones", "price": 299.99, "rating": 4.7, "category": "Audio"},
      {"name": "Ultra-Slim Laptop", "price": 1299.99, "rating": 4.8, "category": "Computers"},
      {"name": "Smart Watch X3", "price": 199.99, "rating": 4.5, "category": "Wearables"}
    ]
    """
    print("Starting CrewAI kickoff...")
    results = kickoff_crew(sample_catalog, "I need a good gift under $300", "advice")
    print("\n" + "=" * 60)
    print("RESULTS:")
    print(results["result"])
