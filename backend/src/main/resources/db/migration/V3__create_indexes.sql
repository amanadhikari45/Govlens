-- V3__create_indexes.sql
-- Performance indexes for dashboard queries on 10K+ rows

CREATE INDEX IF NOT EXISTS idx_sr_status_dept ON service_requests(status, department_id);
CREATE INDEX IF NOT EXISTS idx_sr_submitted_at ON service_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_sr_category ON service_requests(category);
CREATE INDEX IF NOT EXISTS idx_sr_priority_active ON service_requests(priority, status)
    WHERE status NOT IN ('CLOSED', 'RESOLVED');
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_insight_cache_valid ON ai_insight_cache(insight_type, department_id, expires_at);
