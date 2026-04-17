import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0f1e; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(14,165,233,0.3); }
    50%       { box-shadow: 0 0 40px rgba(14,165,233,0.6), 0 0 80px rgba(14,165,233,0.2); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes scan {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  .login-page {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.06) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 40%),
                #0a0f1e;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .login-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(14,165,233,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(14,165,233,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .login-scan {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to bottom, transparent, rgba(14,165,233,0.04) 50%, transparent);
    height: 120px; width: 100%;
    animation: scan 12s ease-in-out infinite;
  }

  .login-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 440px;
    margin: 24px;
    animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .brand-area {
    text-align: center;
    margin-bottom: 32px;
  }

  .brand-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    animation: glow 3s ease-in-out infinite;
  }

  .brand-name {
    font-size: 30px;
    font-weight: 700;
    color: #f0f9ff;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 6px;
  }

  .brand-tagline {
    font-size: 12px;
    color: #38bdf8;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-family: var(--font-mono, monospace);
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 11px;
    color: #34d399;
    font-family: var(--font-mono, monospace);
    letter-spacing: 0.1em;
    margin-top: 12px;
  }

  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s ease-in-out infinite;
  }

  .form-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 36px;
    backdrop-filter: blur(20px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .form-title {
    font-size: 20px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 4px;
  }

  .form-subtitle {
    font-size: 13px;
    color: #475569;
    margin-bottom: 28px;
    font-family: var(--font-mono, monospace);
  }

  .field { margin-bottom: 18px; }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: var(--font-mono, monospace);
  }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 13px 16px;
    font-size: 14px;
    color: #e2e8f0;
    font-family: var(--font-display, sans-serif);
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .field-input:focus {
    border-color: rgba(14,165,233,0.5);
    background: rgba(14,165,233,0.04);
    box-shadow: 0 0 0 3px rgba(14,165,233,0.08);
  }

  .field-input::placeholder { color: #1e293b; }

  .submit-btn {
    width: 100%;
    background: linear-gradient(135deg, #0ea5e9, #0284c7);
    border: none;
    border-radius: 8px;
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #fff;
    cursor: pointer;
    margin-top: 8px;
    font-family: var(--font-display, sans-serif);
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(14,165,233,0.35);
  }

  .submit-btn:active:not(:disabled) { transform: translateY(0); }

  .submit-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  .error-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #fca5a5;
    line-height: 1.5;
  }

  .demo-box {
    margin-top: 24px;
    background: rgba(14,165,233,0.04);
    border: 1px solid rgba(14,165,233,0.1);
    border-radius: 10px;
    padding: 16px;
  }

  .demo-title {
    font-size: 10px;
    color: #334155;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: var(--font-mono, monospace);
    margin-bottom: 10px;
  }

  .demo-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s;
  }

  .demo-row:last-child { border-bottom: none; }
  .demo-row:hover { background: rgba(14,165,233,0.05); padding-left: 4px; }

  .demo-user { font-size: 13px; color: #94a3b8; font-family: var(--font-mono, monospace); }
  .demo-pass { font-size: 12px; color: #334155; font-family: var(--font-mono, monospace); }
  .demo-role {
    font-size: 9px;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(14,165,233,0.1);
    border: 1px solid rgba(14,165,233,0.2);
    color: #38bdf8;
    letter-spacing: 0.08em;
    font-family: var(--font-mono, monospace);
  }
`;

const DEMO_USERS = [
  { username: 'admin',    password: 'admin123', role: 'ADMIN' },
  { username: 'manager1', password: 'admin123', role: 'MANAGER' },
  { username: 'analyst1', password: 'admin123', role: 'ANALYST' },
];

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    await login(username.trim(), password);
  };

  const fillDemo = (u, p) => { setUsername(u); setPassword(p); };

  return (
    <div className="login-page">
      <style>{css}</style>
      <div className="login-grid" />
      <div className="login-scan" />

      <div className="login-card">
        <div className="brand-area">
          <div className="brand-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="brand-name">GovLens</div>
          <div className="brand-tagline">Public Services Analytics</div>
          <div className="status-pill">
            <div className="status-dot" />
            All Systems Operational
          </div>
        </div>

        <div className="form-card">
          <div className="form-title">Welcome back</div>
          <div className="form-subtitle">Sign in to access your dashboard</div>

          {error && (
            <div className="error-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Username</label>
              <input
                className="field-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <button
              className="submit-btn"
              type="submit"
              disabled={loading || !username.trim() || !password}
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="demo-box">
            <div className="demo-title">Demo Accounts — Click to fill</div>
            {DEMO_USERS.map(u => (
              <div key={u.username} className="demo-row" onClick={() => fillDemo(u.username, u.password)}>
                <span className="demo-user">{u.username}</span>
                <span className="demo-pass">{u.password}</span>
                <span className="demo-role">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
