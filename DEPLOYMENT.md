# Render Deployment Guide - MannSetu (sih26094)

The architecture is composed of 5 components designed perfectly for deployment on Render.

## 1. Managed PostgreSQL
1. Create New -> **PostgreSQL**.
2. Name: `sih26094-db`
3. Hit Create. Once live, get the **Internal Database URL** (e.g. `postgres://...`).
4. (Optional) Run `database/schema.sql`, `database/V2__migration_sms_otp.sql`, and `database/seed_synthetic.sql` via a SQL client connecting to the External URL.

## 2. Managed Redis
1. Create New -> **Redis**.
2. Name: `sih26094-redis`
3. Hit Create. Once live, get the **Internal Redis URL**. Note down the host and port (e.g. `red-xxxxx:6379`).

## 3. AI / ML Service (FastAPI)
1. Create New -> **Web Service**.
2. Connect this repository.
3. **Environment:** `Docker`
4. **Root Directory:** `ai-service`
5. **Build Command:** (Handled by Docker)
6. **Start Command:** (Handled by Docker)
7. **Environment Variables:**
   - `PORT`: `8000` (Render explicitly maps it)
   - `GEMINI_API_KEY`: `<your_key>`
   - `GROQ_API_KEY`: `<your_key>`
8. Copy the deployed service URL (e.g. `https://sih-ai-service.onrender.com`).

## 4. Backend Service (Spring Boot)
1. Create New -> **Web Service**.
2. Connect this repository.
3. **Environment:** `Docker`
4. **Root Directory:** `backend`
5. **Build Command:** (Handled by Docker)
6. **Start Command:** (Handled by Docker)
7. **Environment Variables:**
   - `DB_URL`: `jdbc:<Your PostgreSQL Internal URL>`
   - `DB_USERNAME`: `<postgres-user>`
   - `DB_PASSWORD`: `<postgres-password>`
   - `SPRING_DATA_REDIS_HOST`: `<Your Redis Internal Host>`
   - `SPRING_DATA_REDIS_PORT`: `6379`
   - `AI_SERVICE_URL`: `<https://sih-ai-service.onrender.com>` (From Step 3)
   - `JWT_SECRET`: `StrongSecureLongRandomSecret`
   - `FRONTEND_URL`: `<https://sih-frontend.onrender.com>`
   - `PORT`: `8080`
8. **Health Check Path:** `/actuator/health`
9. Copy the deployed service URL (e.g. `https://sih-backend.onrender.com`).

## 5. Frontend Service (Vanilla HTML Static)
1. Create New -> **Static Site**.
2. Connect this repository.
3. **Root Directory:** (Leave empty, root of repo)
4. **Build Command:** `./build_frontend.sh`
5. **Publish Directory:** `.`
6. **Environment Variables:**
   - `VITE_API_URL`: `<https://sih-backend.onrender.com>/api/v1`
   - `VITE_AI_SERVICE_URL`: `<https://sih-ai-service.onrender.com>/ai/v1` (Not used directly by client anymore, but provided for fallback)

Once all are up, the system is fully end-to-end operational.
