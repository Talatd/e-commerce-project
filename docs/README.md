# SmartStore — Intelligent E-Commerce Platform

Monorepo with an **Angular** storefront/admin UI, a **Spring Boot** REST API, **MySQL**, and a **FastAPI** **AI Hub** (Gemini + Text2SQL via LangGraph). Authentication uses **JWT**; the SPA can **refresh** access tokens using a refresh token.

For step-by-step setup, see **[EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md)**.

---

## Repository layout

| Path | Description |
|------|-------------|
| `frontend/` | Angular app (`ng serve` → http://localhost:4200) |
| `backend/` | Spring Boot API (`mvn spring-boot:run` → http://localhost:8080) |
| `ai-hub/` | FastAPI + LangGraph chatbot service (http://localhost:8000) |
| `backend/database/schema.sql` | MySQL baseline schema (optional fresh install) |

Swagger UI: http://localhost:8080/swagger-ui.html

---

## Prerequisites

- **JDK 21** + **Maven**
- **Node.js 20+** + **npm**
- **Python 3.10+** (AI Hub)
- **MySQL 8** (default: `localhost:3306`, database `smartstore_db`)

---

## Quick start

1. **MySQL** — Run `backend/database/schema.sql`, or rely on `spring.jpa.hibernate.ddl-auto=update` on first boot.
2. **`backend/src/main/resources/application.properties`** — Set DB URL / username / password; in production set `smartstore.jwt.secret` (Base64, sufficient length) via environment variables.
3. **`ai-hub/.env`** — Example:
   ```env
   GEMINI_API_KEY=your_key
   DB_USER=root
   DB_PASSWORD=root
   DB_HOST=localhost
   DB_NAME=smartstore_db
   ```
4. **Backend:** `cd backend && mvn spring-boot:run`
5. **AI Hub:** `cd ai-hub && pip install -r requirements.txt && python main.py`
6. **Frontend:** `cd frontend && npm install && ng serve`

Ensure `smartstore.ai.url=http://localhost:8000` in `application.properties` so the backend can proxy chat requests to AI Hub.

---

## Frontend environments

- **Development:** `frontend/src/environments/environment.ts` → `apiBaseUrl` (default `http://localhost:8080`).
- **Production build:** `ng build` uses `environment.prod.ts` (Angular `fileReplacements`). If the API shares the **same origin** as the SPA, use `apiBaseUrl: ''` so requests go to `/api/v1/...`. If the API is on another host, set `apiBaseUrl` to the full backend origin (no trailing slash).

---

## Enriched AI Data Layers

The platform features a deeply enriched database designed for high-fidelity AI analysis and **Text-to-SQL** capabilities. The data is organized into five key layers:

1. **Semantic Product Layer**: Products are enriched with technical specifications (`refresh_rate`, `switch_type`, etc.) and multi-dimensional tags (e.g., `Stealth`, `Minimalist`, `Ergonomic`).
2. **Customer Persona Layer**: Realistic demographic and behavioral data for personas like:
   - **The Shadow Coder**: Focuses on performance, stealth, and mechanical keyboards.
   - **The Organic Creator**: Focuses on aesthetics, walnut finishes, and content creation.
   - **The Global Nomad**: Focuses on portability, EDC, and technical productivity.
3. **Financial & Sales Layer**: Includes `supplier_price` for real-time **profit margin analysis**, coupon usage tracking with category-based restrictions, and `RETURNED` order statuses for return-rate analysis.
4. **Logistics & Operations Layer**: Consistent `OrderEvent` timelines (Creation -> Processing -> Shipping -> Delivery) and **Regional Inventory** (Europe, Asia, Global) for supply chain performance tracking.
5. **UX & Sentiment Layer**: 
   - **Sentiment Score**: A cross-checked metric (0.0 - 1.0) aligned with star ratings.
   - **Store Responses**: Intelligent responses from store managers based on sentiment and rating.

---

## Sample accounts (auto-seeded)

On startup, `DbInitializer` syncs these users (creates them if missing):

| Role | Email | Password | Persona |
|------|-------|----------|---------|
| ADMIN | `admin@smartstore.com` | `admin123` | Nexus Admin |
| MANAGER | `james@techhub.com` | `manager123` | TechHub Manager |
| CONSUMER | `daniel@shadow.io` | `user123` | The Shadow Coder |
| CONSUMER | `sophia@organic.io` | `user123` | The Organic Creator |
| CONSUMER | `elif@akdeniz.edu.tr` | `user123` | Local Discovery |

---

## Build and test

```bash
cd backend && mvn clean test
cd frontend && npm run build
```

---

## AI Capability Highlights

With the enriched data, the **AI Hub** can handle complex business intelligence queries:
- *"Show me the profit margin distribution for the Shadow Coder persona products."*
- *"What is the average delivery delay in the Europe region for high-sentiment orders?"*
- *"Which products have the highest return rate despite having positive store responses?"*

---

## Security (summary)

- Sensitive endpoints are **role-gated** with `@PreAuthorize`.
- Order detail and customer profile updates are bound to the **authenticated JWT user**.
- AI chat is proxied through Spring; user context for the AI service is derived on the server.

---

## Before submission / demo

- Do not commit real **API keys** or production **JWT secrets**; keep `.env` out of git.
- Share **EXECUTION_GUIDE.md** and this README with reviewers.
- Verify MySQL plus all three processes run together for a live demo.
