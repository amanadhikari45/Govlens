-- V1__init_schema.sql
-- GovLens core schema — PostgreSQL 15+

CREATE TABLE departments (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    code            VARCHAR(10) NOT NULL UNIQUE,
    budget_fy       DECIMAL(15,2),
    headcount       INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'ANALYST' CHECK (role IN ('ANALYST','MANAGER','ADMIN')),
    department_id   BIGINT REFERENCES departments(id),
    active          BOOLEAN DEFAULT TRUE,
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
