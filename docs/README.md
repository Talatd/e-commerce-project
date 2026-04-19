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

## Sample accounts (auto-seeded)

On startup, `DbInitializer` syncs these users (creates them if missing):

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@smartstore.com` | `admin123` |
| ADMIN | `buse@akdeniz.edu.tr` | `admin123` |
| MANAGER | `james@techhub.com` | `manager123` |
| MANAGER | `manager@nexus.com` | `manager123` |
| CONSUMER | `elif@akdeniz.edu.tr` | `user123` |

---

## Build and test

```bash
cd backend && mvn clean test
cd frontend && npm run build
```

The production Angular build stays within default budgets because Google Fonts are loaded only from **`index.html`** (`<link>`), not via large `@import` blocks in bundled CSS.

---

## Security (summary)

- Sensitive endpoints (orders listing, analytics, store creation, review moderation, etc.) are **role-gated** with `@PreAuthorize`.
- Order detail and customer profile updates are bound to the **authenticated JWT user** (mitigates IDOR).
- AI chat is proxied through Spring; user context for the AI service is derived on the server.

---

## Before submission / demo

- Do not commit real **API keys** or production **JWT secrets**; keep `.env` out of git (`.gitignore`).
- Share **EXECUTION_GUIDE.md** and this README with reviewers; verify MySQL plus all three processes run together for a live demo.
