# SmartStore — Execution Guide

Three components work together: **Spring Boot API**, **AI Hub (FastAPI)**, and **Angular SPA**.

## 1. Prerequisites

- **Java 21** and **Maven**
- **Node.js 20+** (global Angular CLI is optional; you can use `npx ng`)
- **Python 3.10+**
- **MySQL 8** (`localhost:3306`)

---

## 2. Database

1. Create the database in MySQL, or rely on `createDatabaseIfNotExist=true` in the JDBC URL in `application.properties`.
2. For a clean schema from SQL, run `backend/database/schema.sql`.
3. Edit `backend/src/main/resources/application.properties` for your credentials (`DB_USERNAME`, `DB_PASSWORD`, or `spring.datasource.*`).

---

## 3. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

- API: **http://localhost:8080**
- Swagger: **http://localhost:8080/swagger-ui.html**

On first startup, `DbInitializer` may seed sample products, stores, and users.

**AI proxy URL:** `smartstore.ai.url` (default `http://localhost:8000`). If AI Hub is down, chat endpoints may return a graceful error.

---

## 4. AI Hub (FastAPI)

Folder name: **`ai-hub`** (repository root).

```bash
cd ai-hub
pip install -r requirements.txt
```

Example `.env`:

```env
GEMINI_API_KEY=your_google_ai_studio_key
DB_USER=root
DB_PASSWORD=root
DB_HOST=localhost
DB_NAME=smartstore_db
```

Run:

```bash
python main.py
```

Service: **http://localhost:8000** — health: `GET /health`

---

## 5. Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

App: **http://localhost:4200**

- Development API base: `src/environments/environment.ts` → `apiBaseUrl`
- Production build: `npm run build` uses `environment.prod.ts` (Angular `fileReplacements`)

---

## 6. Sample logins

See the **Sample accounts** table in [README.md](./README.md).

---

## 7. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Chat / AI not responding | AI Hub not running, missing `GEMINI_API_KEY`, or wrong `smartstore.ai.url` |
| 401 / forced logout | Access token expired and refresh failed — sign in again |
| CORS errors | Allowed origins in backend `SecurityConfig` (e.g. `http://localhost:4200`) |
