# CrewAI Implementation Report
## SmartStore AI — Multi-Agent E-Commerce System

**Student:** Talat D.  
**Course:** Advanced Web Development  
**Date:** April 2026  
**GitHub:** https://github.com/Talatd/E-Commerce-Website

---

## 1. Introduction

This report documents the integration of **CrewAI**, a multi-agent AI orchestration framework, into the existing SmartStore AI e-commerce platform. CrewAI enables multiple specialized AI agents to collaborate on complex tasks—such as product analysis, marketing content generation, and personalized shopping advice—by coordinating their work in a sequential pipeline.

## 2. System Architecture

The system uses a **hybrid architecture** where the Next.js frontend communicates with a Python-based CrewAI backend via a REST API proxy.

```
┌─────────────────┐     ┌────────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Next.js        │     │  Next.js API        │     │  Flask Server    │     │  Google      │
│   Frontend       │────▶│  Proxy + JWT Auth   │────▶│  (CrewAI)        │────▶│  Gemini API  │
│   (React UI)     │     │  /api/crew          │     │  Port 5000       │     │  (LLM)       │
└─────────────────┘     └────────────────────┘     └──────────────────┘     └─────────────┘
```

**Data flow:**
1. User clicks "Run Agent" on the Crew Dashboard (`/crew`)
2. Frontend sends a POST request with JWT token to `/api/crew`
3. Next.js API route validates the JWT, fetches user-specific products, and forwards to Flask
4. Flask's `crew.py` creates the CrewAI agents, assigns tasks, and invokes `crew.kickoff()`
5. Each agent processes its task using Google Gemini 2.0 Flash as the LLM
6. Results are returned through the chain back to the UI

## 3. Agents

Three specialized agents are defined in `crewai-backend/config/agents.yaml`:

### 3.1 Product Analyst
```yaml
product_analyst:
  role: "Senior Product Analyst"
  goal: "Analyze product catalogs to identify trends, strengths, weaknesses,
         and competitive positioning for e-commerce products."
  backstory: >
    You are a veteran product analyst with 15 years of experience in the
    consumer electronics industry. You have deep knowledge of market trends,
    product specifications, and consumer preferences.
```

### 3.2 Marketing Strategist
```yaml
marketing_strategist:
  role: "Digital Marketing Strategist"
  goal: "Create compelling product descriptions, marketing copy, and
         SEO-optimized content that drives conversions and engages customers."
  backstory: >
    You are an award-winning digital marketing strategist who has helped
    hundreds of e-commerce brands increase their conversion rates.
```

### 3.3 Customer Advisor
```yaml
customer_advisor:
  role: "Personal Shopping Advisor"
  goal: "Provide personalized product recommendations and shopping advice
         based on customer needs, preferences, and budget constraints."
  backstory: >
    You are an expert personal shopping advisor who has helped thousands
    of customers find the perfect products.
```

## 4. Tasks

Tasks are defined in `crewai-backend/config/tasks.yaml`:

| Task | Agent | Description |
|------|-------|-------------|
| `catalog_analysis` | Product Analyst | Analyzes catalog health, price distribution, category coverage, and identifies top/underperforming products |
| `marketing_content` | Marketing Strategist | Generates SEO-optimized titles, meta descriptions, product descriptions, and promotional taglines |
| `shopping_advice` | Customer Advisor | Provides personalized recommendations with pros/cons and value picks based on customer queries |

## 5. Kickoff Code

The main orchestration happens in `crewai-backend/crew.py`:

```python
def kickoff_crew(product_catalog, customer_query="", task_type="all"):
    llm = get_llm()                                    # Initialize Gemini LLM
    agents = create_agents(llm)                        # Create 3 agents from YAML
    all_tasks = create_tasks(agents, product_catalog)  # Create tasks from YAML
    
    # Select tasks based on type
    task_map = {
        "analysis": [catalog_task],
        "marketing": [marketing_task],
        "advice": [advice_task],
        "all": [catalog_task, marketing_task, advice_task],
    }
    
    # Create the Crew and run it
    crew = Crew(
        agents=list(agents),
        tasks=task_map[task_type],
        process=Process.sequential,   # Agents work one after another
        verbose=True,
    )
    
    result = crew.kickoff()           # Start the crew execution
    return result
```

## 6. Configuration Files

### `crewai-backend/config/agents.yaml`
Defines agent roles, goals, backstories, and behavioral parameters (verbose, delegation).

### `crewai-backend/config/tasks.yaml`
Defines task descriptions with `{product_catalog}` and `{customer_query}` template variables, expected outputs, and agent assignments.

### `crewai-backend/requirements.txt`
```
crewai==0.108.0
crewai-tools==0.40.1
flask==3.1.0
flask-cors==5.0.1
google-generativeai==0.8.5
python-dotenv==1.1.0
```

## 7. Integration with Homework 2

This CrewAI implementation is **not** a separate project—it extends the existing SmartStore AI website:

| Homework 2 Feature | CrewAI Extension |
|---------------------|-----------------|
| JWT Authentication | CrewAI API route requires valid JWT token |
| Per-user Data Isolation | Only the authenticated user's products are sent to the crew |
| AI Chatbot (single agent) | Multi-agent system with specialized roles |
| Product Listing Page | New `/crew` dashboard page added to navigation |
| Gemini API Integration | Same API key used for both chatbot and CrewAI agents |

## 8. How to Run

### Step 1: Start the Next.js Frontend
```bash
cd "Advanced Application Term Project"
npm run dev
```

### Step 2: Start the CrewAI Backend
```bash
cd crewai-backend
pip install -r requirements.txt
python app.py
```

### Step 3: Access the Dashboard
1. Open `http://localhost:3000`
2. Login with any demo account
3. Click "AI Crew" in the navigation bar
4. Select an agent and click "Run"

## 9. Project Structure

```
Advanced Application Term Project/
├── src/                          # Next.js Frontend
│   ├── app/
│   │   ├── crew/                 # CrewAI Dashboard Page
│   │   │   ├── page.js
│   │   │   └── crew.module.css
│   │   ├── api/
│   │   │   └── crew/
│   │   │       └── route.js      # API proxy to CrewAI backend
│   │   ├── products/             # Product pages
│   │   └── login/                # Login page
│   ├── lib/
│   │   ├── jwt.js                # JWT utilities
│   │   ├── auth-middleware.js    # API authentication
│   │   └── ai-security.js       # Prompt injection protection
│   └── context/
│       └── AuthContext.js        # Auth state management
│
├── crewai-backend/               # Python CrewAI Backend
│   ├── config/
│   │   ├── agents.yaml           # Agent definitions
│   │   └── tasks.yaml            # Task definitions
│   ├── crew.py                   # Core CrewAI logic
│   ├── app.py                    # Flask API server
│   └── requirements.txt         # Python dependencies
│
├── .env.local                    # Environment variables
├── README.md                     # Project documentation
└── AI_Agent_Planning_Document.md # AI planning documentation
```

## 10. Conclusion

The CrewAI integration transforms SmartStore AI from a single-agent chatbot into a sophisticated multi-agent system. Each agent brings specialized expertise—analysis, marketing, and advisory—creating a comprehensive AI-powered e-commerce platform. The system maintains full backward compatibility with the existing Homework 2 features while adding significant new AI capabilities.
