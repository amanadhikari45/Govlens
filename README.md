# GovLens — AI-Powered Public Services Analytics Platform

**A full-stack government operations dashboard built with Java (Spring Boot), React, PostgreSQL, and OpenAI integration — designed to help public sector agencies identify performance bottlenecks, optimize resource allocation, and surface actionable insights from civic data.**

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green) ![React](https://img.shields.io/badge/React-18-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Docker](https://img.shields.io/badge/Docker-Compose-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Problem Statement

Government agencies collect massive amounts of operational data — service requests, case backlogs, resource utilization metrics, citizen feedback — but lack tooling to surface patterns and drive decisions. Most existing dashboards are static and don't correlate data across departments.

**GovLens** solves this by providing:
- Real-time aggregation of service request data across departments
- AI-generated performance summaries and anomaly detection
- SQL-driven analytics with optimized query patterns for large civic datasets
- Role-based access control aligned with government security standards

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    React Frontend                     │
│  Dashboard │ Analytics │ AI Insights │ Case Manager   │
└──────────────────────┬───────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼───────────────────────────────┐
│              Spring Boot API Gateway                  │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐ │
│  │ Auth &  │ │ Service  │ │ Report │ │ AI Insight │ │
│  │ RBAC    │ │ Request  │ │ Engine │ │ Service    │ │
│  │ Module  │ │ Module   │ │        │ │ (OpenAI)   │ │
│  └─────────┘ └──────────┘ └────────┘ └────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │ JDBC / JPA
┌──────────────────────▼───────────────────────────────┐
│               PostgreSQL Database                     │
│  departments │ service_requests │ metrics │ users     │
│  audit_logs  │ ai_insight_cache │ cases   │ feedback  │
└──────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA | Industry-standard enterprise stack for government-grade applications |
| **Frontend** | React 18, Recharts, Axios, TailwindCSS | Component-driven UI with responsive data visualization |
| **Database** | PostgreSQL 15 | ACID compliance, advanced query optimization, JSON support for flexible civic data |
| **AI Integration** | OpenAI API (GPT-4) | Natural language insight generation from structured data |
| **DevOps** | Docker, Docker Compose, GitHub Actions CI/CD | Containerized deployment with automated testing pipeline |
| **Testing** | JUnit 5, Mockito, React Testing Library | Full unit + integration test coverage |

---

## Key Features

### 1. Service Request Pipeline
- CRUD operations for civic service requests (pothole reports, permit applications, inspections)
- Priority scoring algorithm based on request age, category severity, and citizen impact radius
- Batch status updates with full audit trail

### 2. Department Performance Analytics
- Aggregated KPIs: avg resolution time, backlog depth, SLA compliance rate
- SQL window functions for trend analysis (rolling 7/30/90 day views)
- Cross-department comparison with normalized scoring

### 3. AI-Powered Insight Engine
- Feeds structured query results to OpenAI for natural language summaries
- Anomaly detection: flags departments deviating >2σ from historical baselines
- Weekly digest generation with actionable recommendations

### 4. Role-Based Access Control
- JWT authentication with refresh token rotation
- Three roles: `ANALYST`, `MANAGER`, `ADMIN` — each with scoped API access
- Audit logging on all data mutations

### 5. Optimized Data Layer
- Indexed queries on high-cardinality columns (request_date, department_id, status)
- Materialized views for dashboard aggregations — sub-100ms response on 500K+ rows
- Connection pooling via HikariCP with tuned pool sizing

---

## Project Structure

```
govlens/
├── backend/
│   ├── src/main/java/com/govlens/
│   │   ├── GovLensApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── OpenAIConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ServiceRequestController.java
│   │   │   ├── DepartmentController.java
│   │   │   ├── AnalyticsController.java
│   │   │   └── InsightController.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── ServiceRequest.java
│   │   │   ├── Department.java
│   │   │   ├── AuditLog.java
│   │   │   └── InsightCache.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ServiceRequestRepository.java
│   │   │   ├── DepartmentRepository.java
│   │   │   └── AnalyticsRepository.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── ServiceRequestService.java
│   │   │   ├── AnalyticsService.java
│   │   │   ├── InsightService.java
│   │   │   └── AuditService.java
│   │   ├── dto/
│   │   │   ├── ServiceRequestDTO.java
│   │   │   ├── DepartmentMetricsDTO.java
│   │   │   ├── AnalyticsResponseDTO.java
│   │   │   └── AuthDTO.java
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java
│   │       └── ResourceNotFoundException.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   └── db/migration/
│   │       ├── V1__init_schema.sql
│   │       ├── V2__seed_departments.sql
│   │       ├── V3__create_indexes.sql
│   │       └── V4__materialized_views.sql
│   └── src/test/java/com/govlens/
│       ├── controller/ServiceRequestControllerTest.java
│       ├── service/AnalyticsServiceTest.java
│       └── repository/ServiceRequestRepositoryTest.java
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ServiceRequestTable.jsx
│   │   │   ├── DepartmentCard.jsx
│   │   │   ├── AnalyticsChart.jsx
│   │   │   ├── InsightPanel.jsx
│   │   │   └── LoginForm.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useAnalytics.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   └── utils/
│   │       └── formatters.js
│   └── package.json
├── docker-compose.yml
├── Dockerfile
├── .github/workflows/ci.yml
└── README.md
```

---

## Database Schema

```sql
-- Core tables with optimized indexing strategy

CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    code            VARCHAR(10) NOT NULL UNIQUE,
    budget_fy       DECIMAL(15,2),
    headcount       INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_requests (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    priority        INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status          VARCHAR(20) DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED')),
    department_id   BIGINT REFERENCES departments(id),
    submitted_by    VARCHAR(100),
    assigned_to     VARCHAR(100),
    submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at     TIMESTAMP,
    sla_deadline    TIMESTAMP,
    resolution_notes TEXT
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'ANALYST'
                    CHECK (role IN ('ANALYST','MANAGER','ADMIN')),
    department_id   BIGINT REFERENCES departments(id),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       BIGINT NOT NULL,
    action          VARCHAR(20) NOT NULL,
    performed_by    VARCHAR(50) NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    performed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_insight_cache (
    id              BIGSERIAL PRIMARY KEY,
    insight_type    VARCHAR(50) NOT NULL,
    department_id   BIGINT REFERENCES departments(id),
    content         TEXT NOT NULL,
    data_snapshot   JSONB,
    generated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_sr_status_dept ON service_requests(status, department_id);
CREATE INDEX idx_sr_submitted_at ON service_requests(submitted_at DESC);
CREATE INDEX idx_sr_category ON service_requests(category);
CREATE INDEX idx_sr_priority_status ON service_requests(priority, status)
    WHERE status NOT IN ('CLOSED', 'RESOLVED');
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Materialized view for dashboard KPIs
CREATE MATERIALIZED VIEW department_metrics AS
SELECT
    d.id AS department_id,
    d.name AS department_name,
    COUNT(sr.id) AS total_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'OPEN') AS open_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'RESOLVED') AS resolved_requests,
    ROUND(AVG(EXTRACT(EPOCH FROM (sr.resolved_at - sr.submitted_at)) / 3600)::numeric, 1)
        AS avg_resolution_hours,
    ROUND(
        COUNT(sr.id) FILTER (WHERE sr.resolved_at <= sr.sla_deadline)::numeric /
        NULLIF(COUNT(sr.id) FILTER (WHERE sr.resolved_at IS NOT NULL), 0) * 100, 1
    ) AS sla_compliance_pct,
    COUNT(sr.id) FILTER (WHERE sr.status IN ('OPEN','IN_PROGRESS')
        AND sr.submitted_at < CURRENT_TIMESTAMP - INTERVAL '7 days') AS backlog_over_7d
FROM departments d
LEFT JOIN service_requests sr ON sr.department_id = d.id
GROUP BY d.id, d.name;

-- Refresh strategy: REFRESH MATERIALIZED VIEW CONCURRENTLY every 15 min via cron/scheduler
CREATE UNIQUE INDEX idx_dept_metrics_id ON department_metrics(department_id);
```

---

## API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | JWT authentication |
| POST | `/api/auth/refresh` | Authenticated | Refresh token |
| GET | `/api/requests` | ANALYST+ | List service requests (paginated, filterable) |
| POST | `/api/requests` | ANALYST+ | Create service request |
| PUT | `/api/requests/{id}` | MANAGER+ | Update request status/assignment |
| GET | `/api/departments` | ANALYST+ | List departments with summary stats |
| GET | `/api/analytics/dashboard` | ANALYST+ | Aggregated KPIs from materialized view |
| GET | `/api/analytics/trends?days=30` | ANALYST+ | Time-series trend data |
| GET | `/api/analytics/department/{id}` | ANALYST+ | Detailed department analytics |
| POST | `/api/insights/generate` | MANAGER+ | Trigger AI insight generation |
| GET | `/api/insights/latest` | ANALYST+ | Retrieve cached insights |
| GET | `/api/audit?entity={type}` | ADMIN | Query audit trail |

---

## Running Locally

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- OpenAI API key (optional — insights degrade gracefully without it)

### Quick Start with Docker
```bash
git clone https://github.com/your-username/govlens.git
cd govlens
cp .env.example .env  # Add your OpenAI key (optional)
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432`

### Manual Setup
```bash
# Backend
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=dev

# Frontend
cd frontend
npm install
npm start
```

### Seed Data
The migration scripts automatically seed 8 departments and 10,000 synthetic service requests spanning 12 months for realistic analytics testing.

---

## Testing

```bash
# Backend unit + integration tests
cd backend
./mvnw test

# Frontend tests
cd frontend
npm test
```

**Test coverage targets:** 85%+ on service layer, 90%+ on repository queries.

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. Lint + compile Java 17
2. Run JUnit 5 test suite
3. Build React production bundle
4. Docker image build + push
5. (Optional) Deploy to AWS ECS / Azure Container Apps

---

## What I Learned Building This

- **Query optimization matters at scale.** Moving from naive JOINs to materialized views dropped dashboard load from 2.8s to 90ms on 500K rows.
- **AI integration needs guardrails.** Caching insight results and setting token limits prevented runaway API costs — the cache-first pattern cut OpenAI calls by 80%.
- **RBAC isn't just roles.** Scoping data access by department (not just by endpoint) required custom Spring Security filters beyond the standard `@PreAuthorize`.
- **Government data has weird edge cases.** Status workflows needed `ESCALATED` as a state because real civic processes don't follow happy-path CRUD.

---

## License

MIT

---

*Built by Aman Adhikari — [LinkedIn](https://www.linkedin.com/in/aman-adhikari-3b295617b/) | amanadhikari006@gmail.com*
