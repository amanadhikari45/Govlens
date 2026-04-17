import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import OverviewTab from './OverviewTab';
import RequestsTab from './RequestsTab';
import InsightsTab from './InsightsTab';

const css = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #0a0f1e; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #0a0f1e; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #0ea5e9; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

const TABS = [
  { id: 'overview',  label: 'Overview',    icon: '▦' },
  { id: 'requests',  label: 'Requests',    icon: '≡' },
  { id: 'insights',  label: 'AI Insights', icon: '◉' },
];

const ROLE_COLORS = { ADMIN: '#f59e0b', MANAGER: '#10b981', ANALYST: '#38bdf8' };

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { dashboardData, loading, error, refresh } = useAnalytics(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDeptId, setDrillDeptId] = useState(null);

  const handleDrillDown = useCallback((deptId) => {
    setDrillDeptId(deptId);
    setActiveTab('dept');
  }, []);

  const handleBackToOverview = useCallback(() => {
    setDrillDeptId(null);
    setActiveTab('overview');
  }, []);

  const switchTab = (id) => {
    setActiveTab(id);
    setDrillDeptId(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'var(--font-display, system-ui, sans-serif)' }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(10,15,30,0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(14,165,233,0.35)',
            flexShrink: 0,
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f0f9ff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              GovLens
            </div>
            <div style={{ fontSize: '10px', color: '#334155', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
              Analytics Platform
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px', padding: '6px 12px',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: ROLE_COLORS[user?.role] || '#38bdf8', boxShadow: `0 0 6px ${ROLE_COLORS[user?.role] || '#38bdf8'}` }} />
            <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>{user?.username}</span>
            <span style={{
              fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
              background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
              color: '#38bdf8', letterSpacing: '0.1em', fontFamily: 'var(--font-mono, monospace)',
            }}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '7px', padding: '7px 14px',
              fontSize: '12px', color: '#f87171', cursor: 'pointer',
              fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.06em',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.target.style.background = 'rgba(239,68,68,0.08)'; e.target.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseOut={e => { e.target.style.background = 'none'; e.target.style.borderColor = 'rgba(239,68,68,0.2)'; }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Nav ── */}
      <nav style={{
        background: 'rgba(10,15,30,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '0 28px',
        display: 'flex', alignItems: 'center', gap: '2px',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            style={{
              background: 'none', border: 'none',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '7px',
              fontSize: '13px', fontWeight: 500,
              color: activeTab === t.id ? '#38bdf8' : '#475569',
              borderBottom: `2px solid ${activeTab === t.id ? '#0ea5e9' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-display, sans-serif)',
              letterSpacing: '0.01em',
            }}
            onMouseOver={e => { if (activeTab !== t.id) e.currentTarget.style.color = '#64748b'; }}
            onMouseOut={e => { if (activeTab !== t.id) e.currentTarget.style.color = '#475569'; }}
          >
            <span style={{ fontSize: '11px', opacity: 0.7 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
        {activeTab === 'dept' && (
          <button
            onClick={handleBackToOverview}
            style={{
              background: 'none', border: 'none',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '7px',
              fontSize: '13px', fontWeight: 500,
              color: '#38bdf8',
              borderBottom: '2px solid #0ea5e9',
              cursor: 'pointer',
              fontFamily: 'var(--font-display, sans-serif)',
            }}
          >
            ← Department Detail
          </button>
        )}
      </nav>

      {/* ── Content ── */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 28px', animation: 'fadeIn 0.25s ease' }}>
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px', padding: '12px 16px',
            marginBottom: '24px', fontSize: '13px', color: '#fca5a5',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={() => refresh()} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '5px', padding: '3px 10px', fontSize: '11px', color: '#fca5a5', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'dept') && (
          <OverviewTab
            dashboardData={dashboardData}
            loading={loading}
            onDrillDown={handleDrillDown}
            drillDeptId={activeTab === 'dept' ? drillDeptId : null}
            onBackToOverview={handleBackToOverview}
            onRefresh={refresh}
          />
        )}
        {activeTab === 'requests' && <RequestsTab user={user} />}
        {activeTab === 'insights' && <InsightsTab user={user} />}
      </main>
    </div>
  );
}
