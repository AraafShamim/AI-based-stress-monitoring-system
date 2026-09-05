# SIH26094 Backend Implementation Plan

## 1. Repository Inspection Findings
- **Branch**: Currently on `database`.
- **Database state**: 
  - `database/schema.sql` contains the definitive PostgreSQL schema: `users`, `victims`, `consent`, `checkins`, `scores`, `alerts`, `audit_log`. 
  - Uses UUID keys, Enums (`risk_tier`, `user_role`, `consent_status`, `alert_status`, `channel_type`, `sentiment_type`), JSONB, and trigger functions for timestamp and `risk_tier` sync.
  - `database/views.sql` contains analytical views which simplify reporting APIs.
- **Backend state**:
  - The repo has a `backend/src/main/resources/` with just `.sql` files. No actual Java code, no `pom.xml` / `build.gradle`, no Spring Boot application. It's completely empty code-wise.
- **AI/ML Layer**:
  - Exists on another branch (`ai-intelligence-layer`); exposes an API contract. The backend will integrate via REST `POST /ai/v1/score` using a mock for local testing.

## 2. API Contract Roadmap
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | JWT generation with RBAC |
| POST | `/api/v1/consent` | Grant/withdraw consent (append-only) |
| POST | `/api/v1/checkins` | Victim check-in ingestion (pushes to Redis queue) |
| GET | `/api/v1/victims/{id}/trend` | Longitudinal DDS & risk data |
| GET | `/api/v1/alerts?status=open` | Role-aware prioritized worklist |
| POST | `/api/v1/alerts/{id}/ack` | Acknowledge alert, record outcome |
| GET | `/api/v1/dashboard/summary` | KPI aggregates (by role) |
| POST | `/ai/v1/score` | External API called by async worker |

## 3. Technology Stack & Packages
- **Java**: Java 21
- **Framework**: Spring Boot 3.3.x
- **Build**: Maven
- **Core Dependencies**: Spring Web, Spring Data JPA, Spring Security, JWT, PostgreSQL, Spring Data Redis, Validation, Swagger UI (Springdoc).
- **Package Structure**: `com.sih.stressmonitoring`
  - `.config` (Security, Redis, OpenAPI, CORS)
  - `.controller` (REST APIs)
  - `.dto` (Requests, Responses)
  - `.entity` (JPA mappings to exact DB schema)
  - `.repository` (Spring Data interfaces)
  - `.service` (Business logic)
  - `.security` (JWT filter, User details)
  - `.exception` (Global handler)
  - `.queue` (Redis publisher/listener)
  - `.ai` (AI client & mock configuration)
  - `.audit` (Audit logging utility)

## 4. Implementation Constraints & Risks
- **No DDL Auto**: `spring.jpa.hibernate.ddl-auto=none`. The SQL file is the source of truth. We will use Hibernate solely to map to existing tables.
- **JSONB Mapping**: Must use Hypersistence Utilities or native PostgreSQL dialect JSON types for the `metadata`, `emotion_signals`, `contributing_factors`, and `details` columns.
- **Enums**: Must be mapped correctly using native Postgres Enums or JPA `@Enumerated(EnumType.STRING)` depending on DB setup (we'll map via custom Hibernate types to match PostgreSQL custom Enums like `user_role`).
- **Async Execution**: `POST /api/v1/checkins` MUST NOT block waiting for the AI response. It saves the check-in and throws a payload onto Redis. A Redis listener acts as a worker, calls the AI mock, saves the `Score`, which triggers DB updates, and evaluates for `Alerts`.
- **Database Triggers**: The DB automatically updates `victims.current_risk_tier` when a `score` is inserted. In JPA, this means reloading the `Victim` entity after a score is persisted if it's evaluated in the same transaction.

## 5. Phases of Execution
1. Initialize Spring Boot project layout (`pom.xml`, resources, main class).
2. Configure application properties and Docker Compose for local infra.
3. Map JPA Entities (handling JSONB and Enums meticulously).
4. Implement Security (JWT + RBAC + Login).
5. Implement APIs for check-ins, consent, and audit.
6. Implement internal AI Mock and Redis worker for async scoring.
7. Implement Alerts and Dashboard APIs.
8. Add comprehensive tests to verify the flow.
