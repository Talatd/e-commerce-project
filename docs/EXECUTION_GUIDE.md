# 🏁 SmartStore AI: Execution Guide

This guide explains how to run the three integrated components of the reconstructed project.

## 1. Prerequisites
- **Java 21** & **Maven**
- **Python 3.13+**
- **Node.js 20+** & **Angular CLI**
- **MySQL 8.0** running on port 3306

---

## 2. Backend (Spring Boot)
1. **Initialize DB**: Run the script located at `backend/database/schema.sql` in your MySQL instance.
2. **Configuration**: Update `backend/src/main/resources/application.properties` with your MySQL credentials.
3. **Run**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *The API will be available at http://localhost:8080. Swagger docs: http://localhost:8080/swagger-ui.html*

---

## 3. AI Service (Python/FastAPI)
1. **Setup Environment**:
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```
2. **ENV Keys**: Create a `.env` file with:
   - `GEMINI_API_KEY=your_key`
   - `DB_USER=root`, `DB_PASSWORD=root`, `DB_NAME=smartstore_db`
3. **Run**:
   ```bash
   python main.py
   ```
   *The AI Hub will be available at http://localhost:8000.*

---

## 4. Frontend (Angular)
1. **Setup**:
   ```bash
   cd frontend
   npm install
   ```
2. **Run**:
   ```bash
   ng serve
   ```
   *Open your browser at http://localhost:4200.*

---

## 📊 Data Ingestion (Admin Only)
Once all services are running, you can ingest the real-world datasets using the provided **Sample CSV files** via the Admin endpoints:
- Use `POST /api/v1/admin/ingest/products-ds4` with `backend/data_samples/ds4_products.csv`
- Use `POST /api/v1/admin/ingest/inventory-ds5` with `backend/data_samples/ds5_inventory.csv`
- Use `POST /api/v1/admin/ingest/reviews-ds6` with `backend/data_samples/ds6_reviews.csv`
