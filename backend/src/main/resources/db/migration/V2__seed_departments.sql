-- V2__seed_departments.sql
INSERT INTO departments (name, code, budget_fy, headcount) VALUES
    ('Public Works', 'PW', 12500000.00, 145),
    ('Health & Human Services', 'HHS', 28000000.00, 312),
    ('Transportation', 'DOT', 18750000.00, 228),
    ('Parks & Recreation', 'PR', 4200000.00, 87),
    ('Building & Permits', 'BP', 6100000.00, 94),
    ('Water & Sanitation', 'WS', 9800000.00, 176),
    ('Public Safety', 'PS', 32000000.00, 410),
    ('Information Technology', 'IT', 7500000.00, 65);

-- Valid BCrypt hash for "admin123"
INSERT INTO users (username, password_hash, role) VALUES
    ('admin',    '$2a$12$3q2ztW1NJ.KtxxUkTWiTw.7/Rabm51UmmjJT5Pf8v21/vDnYU9ALm', 'ADMIN'),
    ('manager1', '$2a$12$3q2ztW1NJ.KtxxUkTWiTw.7/Rabm51UmmjJT5Pf8v21/vDnYU9ALm', 'MANAGER'),
    ('analyst1', '$2a$12$3q2ztW1NJ.KtxxUkTWiTw.7/Rabm51UmmjJT5Pf8v21/vDnYU9ALm', 'ANALYST');
