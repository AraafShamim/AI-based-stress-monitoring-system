# SIH26094 - Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- Groq API Key (for STT service)
- Google Gemini API Key (for LLM chatbot)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/AraafShamim/AI-based-stress-monitoring-system.git
cd AI-based-stress-monitoring-system
```

2. **Create .env file**
```bash
cp .env.example .env
```

3. **Update .env with your API keys**
```bash
# Edit .env and add your keys
GROQ_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

4. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- AI Service (FastAPI on port 8000)
- Backend (Spring Boot on port 8080)

### Verify Services

```bash
# Check all containers are running
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f postgres
```

### Access Endpoints

- **Backend API**: http://localhost:8080
- **Swagger API Docs**: http://localhost:8080/swagger-ui.html
- **AI Service Health**: http://localhost:8000/health
- **Database**: postgres://localhost:5432/sih26094_db

### Stop Services

```bash
docker-compose down
```

## Manual Deployment (Without Docker)

### Prerequisites
- Java 21+
- Python 3.14+
- PostgreSQL 16+
- Maven 3.9+

### Backend Setup

```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/sih26094_db
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export AI_SERVICE_URL=http://localhost:8000

mvn spring-boot:run
```

### AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### Database Setup

```bash
psql -U postgres -d postgres
CREATE DATABASE sih26094_db;

psql -U postgres -d sih26094_db -f database/schema.sql
psql -U postgres -d sih26094_db -f database/views.sql
psql -U postgres -d sih26094_db -f database/seed.sql
```

## Architecture

The system consists of three main components:

### 1. Backend (Spring Boot)
- REST APIs for check-in ingestion, alerts, dashboards
- JWT authentication with RBAC
- Async scoring worker
- DPDP Act 2023 audit logging
- Database ORM with JPA/Hibernate

### 2. AI Service (FastAPI)
- NLP sentiment analysis
- Dynamic Distress Score (DDS) computation
- Escalation prediction
- Speech-to-text transcription
- Explainable AI (trigger words extraction)

### 3. Database (PostgreSQL)
- Relational schema with JSONB for AI signals
- Immutable audit_log table
- Views for dashboard aggregations
- Triggers for automatic risk_tier sync

## API Contract

### Check-in Ingestion
```
POST /api/v1/checkins
Content-Type: application/json

{
  "victimId": "uuid",
  "channel": "chat|ivrs|sms|web",
  "rawText": "I am not sleeping well",
  "metadata": {},
  "responseLatencySec": 30
}
```

### Alert Worklist
```
GET /api/v1/alerts?status=OPEN
Authorization: Bearer <jwt_token>
```

### Victim Trend History
```
GET /api/v1/victims/{victimId}/trend
Authorization: Bearer <jwt_token>
```

### Audit Logs
All victim data access is immutably logged in the `audit_log` table with:
- Actor (user who accessed)
- Action (READ, WRITE, ALERT_ACK, CONSENT_CHANGE)
- Entity type and ID
- Timestamp
- Context details

## Testing

### Run Backend Tests
```bash
cd backend
mvn test
```

### Smoke Test the API
```bash
# Check health
curl http://localhost:8080/actuator/health

# Check AI service
curl http://localhost:8000/health

# List alerts (requires JWT token)
curl -H "Authorization: Bearer <your_token>" http://localhost:8080/api/v1/alerts
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check DB credentials in .env
- Check network connectivity: `docker network ls`

### AI Service Not Responding
- Check API keys are set: `echo $GROQ_API_KEY`
- View logs: `docker logs sih26094_ai_service`
- Test health: `curl http://localhost:8000/health`

### Backend Won't Start
- Check Java version: `java -version`
- Verify DB is ready: `docker logs sih26094_postgres`
- View spring logs: `docker logs sih26094_backend`

## DPDP Act 2023 Compliance

All data access is logged in the immutable `audit_log` table:
- Every READ of a victim's case
- Every WRITE to scores or alerts  
- Every CONSENT_CHANGE event
- Every ALERT_ACK acknowledgement

Access logs can be queried:
```sql
SELECT * FROM audit_log WHERE entity_type = 'victims' AND entity_id = '<victim_uuid>';
```

This ensures regulatory compliance and supports the mandatory audit trail requirement.
