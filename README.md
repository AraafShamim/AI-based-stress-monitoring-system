# SIH26094 - Dynamic Mental Health Monitoring System

## 1. Project Overview
AI-Powered Dynamic Mental Health Monitoring and Distress Prediction System for Victims of Atrocities. This repository fulfills the Ministry of Social Justice and Empowerment (MoSJE) problem statement SIH26094 by building a resilient, privacy-by-design, multi-channel mental health tracking system for victims of atrocities.

## 2. Architecture
The architecture involves separate deployable services communicating cleanly via APIs, with Redis enabling asynchronous ML processing without blocking check-in flows:
- **Frontend Layer:** Static Web application (HTML/Vanilla JS) communicating exclusively with Backend APIs.
- **Backend Layer:** Spring Boot 3 + PostgreSQL handling RBAC, routing, SMS OTP authentication, consent management, WebSockets, scheduling, and alerting.
- **Queue/Cache Layer:** Redis for processing robust ML text/audio extraction jobs.
- **ML Intelligence Layer:** FastAPI microservice handling LLMs, Whisper large-v3 for Speech-To-Text (multilingual distress checkings), and Gemini for explainability and clinical summaries.

## 3. Directory Structure
- `src/` - Frontend Vanilla Web interface (Dashboards, Client portals).
- `backend/` - Spring Boot Java microservice.
- `ai-service/` - FastAPI Python intelligence layer.
- `database/` - Fully compliant PostgreSQL DB schemas and synthetic seed data.

## 4. Sub-services Detail

#### 4a. Frontend (Static Web)
Preserves original design, ensures complete functionality of Check-Ins directly via API Gateway `/api/v1/checkins`, and manages real WebSocket dashboard metrics securely decoupled from AI. 

#### 4b. Backend (Spring Boot)
Provides complete API contract compliance based on MoSJE PRD. Prevents 500 crashes and gracefully degrades ML failure via retrying queues over Redis. Emits WS metrics over STOMP for live counselor monitoring.

#### 4c. AI Service (Python FastAPI)
Responsible strictly for scoring inference. Enforces multi-model classification via standard API thresholds producing `0-100` scores. Does NOT diagnose clinically. Exposes insights using explainable prompts via Flash 1.5. Uses robust `try..except` fallbacks heavily to prevent complete shutdown.

## 5. Local Setup
Requirements: Docker, Docker Compose, Git.
> Note: AI endpoints will operate on fallback texts if `.env` keys (Groq/Gemini) are missing.
```bash
git clone https://github.com/AraafShamim/AI-based-stress-monitoring-system.git
cd AI-based-stress-monitoring-system
docker-compose up -d
```
All components boot, including PostgreSQL and Redis. The backend boots on `:8080`, AI on `:8000`. You can launch frontend locally using `http-server` or `live-server` in the root repository.

## 6. End-to-End Testing (Local)
1. **Consent & Auth:** Login to the dashboard, authenticate with mocked OTP.
2. **Check-In Flow:** Fire an emotional state request on the frontend.
3. **Queue Mechanism:** Backend immediately pushes to `checkin_scoring_queue` on Redis.
4. **Scoring Worker:** AI proxy calls endpoint to compute DDS Score (0-100) and triggers risk validation (Low->Critical).
5. **Alerts Broadcast:** High risk prompts WebSocket delivery, automatically pushing an alert to the Counsellor dashboard. Counselor acknowledges alert.

## 7. Synthetic Data & Disclaimers
1. Due to DPDP guidelines, no real patient info is used. Use `database/seed_synthetic.sql` for 100k+ rows of varied risk tier generation.
2. System is an intelligent risk **monitoring** alert trigger—not a clinical psychology substitute.
3. The AI does not autonomously contact families or law enforcement; all critical conditions are verified by Counselors in the loop.
