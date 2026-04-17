-- V4__materialized_views.sql
-- Materialized view for fast dashboard aggregation on large datasets

CREATE MATERIALIZED VIEW IF NOT EXISTS department_metrics AS
SELECT
    d.id                                                         AS department_id,
    d.name                                                       AS department_name,
    COUNT(sr.id)                                                 AS total_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'OPEN')               AS open_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'IN_PROGRESS')        AS in_progress_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'RESOLVED')           AS resolved_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'CLOSED')             AS closed_requests,
    COUNT(sr.id) FILTER (WHERE sr.status = 'ESCALATED')          AS escalated_requests,
    ROUND(
        COALESCE(AVG(
            EXTRACT(EPOCH FROM (sr.resolved_at - sr.submitted_at)) / 3600
        ) FILTER (WHERE sr.resolved_at IS NOT NULL), 0)::numeric, 1
    )                                                            AS avg_resolution_hours,
    ROUND(
        COALESCE(
            COUNT(sr.id) FILTER (
                WHERE sr.resolved_at IS NOT NULL
                  AND sr.sla_deadline IS NOT NULL
                  AND sr.resolved_at <= sr.sla_deadline
            )::numeric /
            NULLIF(COUNT(sr.id) FILTER (
                WHERE sr.resolved_at IS NOT NULL
                  AND sr.sla_deadline IS NOT NULL
            ), 0) * 100,
        100)::numeric, 1
    )                                                            AS sla_compliance_pct,
    COUNT(sr.id) FILTER (
        WHERE sr.status IN ('OPEN','IN_PROGRESS')
          AND sr.submitted_at < NOW() - INTERVAL '7 days'
    )                                                            AS backlog_over_7d
FROM departments d
LEFT JOIN service_requests sr ON sr.department_id = d.id
GROUP BY d.id, d.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dept_metrics_id ON department_metrics(department_id);

-- Seed 10,000 realistic service requests for analytics demo
-- FIX: sla_deadline is always AFTER submitted_at
DO $$
DECLARE
    v_submitted TIMESTAMP;
    v_priority  INT;
    v_sla_hours INT;
    v_status    TEXT;
    v_resolved  TIMESTAMP;
BEGIN
    FOR g IN 1..10000 LOOP
        v_submitted := NOW() - (random() * 365 || ' days')::interval;
        v_priority  := 1 + (g % 5);
        v_sla_hours := CASE v_priority
                         WHEN 1 THEN 4
                         WHEN 2 THEN 12
                         WHEN 3 THEN 48
                         WHEN 4 THEN 120
                         ELSE 240
                       END;
        v_status    := (ARRAY['OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED'])[1 + (g % 5)];
        v_resolved  := CASE
                         WHEN v_status IN ('RESOLVED','CLOSED')
                         THEN v_submitted + (random() * v_sla_hours * 1.5 || ' hours')::interval
                         ELSE NULL
                       END;

        INSERT INTO service_requests
            (title, description, category, priority, status, department_id,
             submitted_by, submitted_at, resolved_at, sla_deadline)
        VALUES (
            'SR-' || LPAD(g::text, 5, '0') || ' ' ||
                (ARRAY['Pothole repair','Permit application','Water main break',
                       'Park maintenance','Building inspection','Traffic signal',
                       'Noise complaint','Street lighting'])[1 + (g % 8)],
            'Synthetic test record for analytics validation.',
            (ARRAY['INFRASTRUCTURE','PERMITS','UTILITIES','MAINTENANCE',
                   'INSPECTION','TRAFFIC','COMPLAINT','SAFETY'])[1 + (g % 8)],
            v_priority,
            v_status,
            1 + (g % 8),
            'system_seed',
            v_submitted,
            v_resolved,
            v_submitted + (v_sla_hours || ' hours')::interval
        );
    END LOOP;
END $$;

REFRESH MATERIALIZED VIEW department_metrics;
