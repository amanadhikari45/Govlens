import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import api from '../services/api';
import { fmtNum, fmtHours, fmtDate } from '../utils/formatters';

const CARD = 'rgba(255,255,255,0.03)';
const BORDER = 'rgba(255,255,255,0.07)';
const BORDER_HOVER = 'rgba(14,165,233,0.3)';
const MUTED = '#475569';
const SUB = '#64748b';
const TEXT = '#e2e8f0';
const MONO = 'var(--font-mono, monospace)';

const STATUS_COLORS = {
  OPEN: '#38bdf8', IN_PROGRESS: '#fbbf24',
  RESOLVED: '#34d399', CLOSED: '#64748b', ESCALATED: '#f87171',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1627', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '10px 14px', fontFamily: MONO, fontSize: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      {label && <div style={{ color: SUB, marginBottom: '4px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#38bdf8' }}>{fmtNum(p.value)}</div>
      ))}
    </div>
  );
}

function Skeleton({ height = 20, width = '100%', radius = 4 }) {
  return (
    <div style={{
      height, width, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

function KPICard({ label, value, subtext, accentColor, loading }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: accentColor, borderRadius: '12px 0 0 12px' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${accentColor}10, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ fontSize: '10px', color: SUB, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: MONO, marginBottom: '10px' }}>{label}</div>
      {loading ? (
        <><Skeleton height={32} width={80} radius={6} style={{ marginBottom: 8 }} /><Skeleton height={14} width={120} radius={4} /></>
      ) : (
        <>
          <div style={{ fontSize: '32px', fontWeight: 700, color: accentColor, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
          {subtext && <div style={{ fontSize: '11px', color: MUTED, marginTop: '6px', fontFamily: MONO }}>{subtext}</div>}
        </>
      )}
    </div>
  );
}

function DeptCard({ metrics, onClick }) {
  const [hov, setHov] = useState(false);
  const slaC = metrics.slaCompliancePct >= 90 ? '#10b981' : metrics.slaCompliancePct >= 80 ? '#f59e0b' : '#ef4444';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(14,165,233,0.04)' : CARD,
        border: `1px solid ${hov ? BORDER_HOVER : BORDER}`,
        borderRadius: '12px', padding: '20px',
        cursor: 'pointer',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 8px 32px rgba(14,165,233,0.08)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{metrics.departmentName}</h3>
        {metrics.backlogOver7Days > 0 && (
          <span style={{ fontSize: '10px', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '5px', padding: '2px 7px', fontFamily: MONO }}>
            {metrics.backlogOver7Days} overdue
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        {[
          { l: 'Open', v: fmtNum(metrics.openRequests), c: '#38bdf8' },
          { l: 'Resolved', v: fmtNum(metrics.resolvedRequests), c: '#34d399' },
          { l: 'Total', v: fmtNum(metrics.totalRequests), c: '#94a3b8' },
          { l: 'Avg Resolution', v: fmtHours(metrics.avgResolutionHours), c: '#fbbf24' },
        ].map(({ l, v, c }) => (
          <div key={l}>
            <div style={{ fontSize: '9px', color: SUB, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: MONO, marginBottom: '3px' }}>{l}</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: c, letterSpacing: '-0.02em' }}>{v}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '9px', color: SUB, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: MONO }}>SLA Compliance</span>
          <span style={{ fontSize: '12px', color: slaC, fontFamily: MONO, fontWeight: 600 }}>{metrics.slaCompliancePct}%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(Math.max(metrics.slaCompliancePct, 0), 100)}%`, background: slaC, borderRadius: '2px', transition: 'width 1s ease' }} />
        </div>
      </div>
    </div>
  );
}

function DeptDetail({ deptId, onBack }) {
  const [data, setData] = useState({ trends: [], metrics: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    Promise.all([
      api.get('/analytics/trends', { params: { departmentId: deptId, days: 30 } }),
      api.get(`/analytics/department/${deptId}`, { params: { days: 30 } }),
    ])
      .then(([tr, mr]) => setData({ trends: tr.data, metrics: mr.data }))
      .catch(e => setErr('Failed to load department analytics'))
      .finally(() => setLoading(false));
  }, [deptId]);

  if (loading) return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ marginBottom: '24px' }}><Skeleton height={40} width={300} radius={8} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[1,2,3,4].map(i => <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '22px', height: '100px' }}><Skeleton height={20} width={80} radius={4} style={{ marginBottom: 12 }} /><Skeleton height={32} width={60} radius={6} /></div>)}
      </div>
    </div>
  );

  if (err) return <div style={{ color: '#fca5a5', fontFamily: MONO, padding: '40px', textAlign: 'center' }}>{err}</div>;
  if (!data.metrics) return null;

  const { metrics, trends } = data;
  const statusData = metrics.statusBreakdown
    ? Object.entries(metrics.statusBreakdown).map(([s, c]) => ({ name: s.replace('_', ' '), value: c, fullStatus: s }))
    : [];

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <button onClick={onBack} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '8px 16px', fontSize: '12px', color: SUB, cursor: 'pointer', marginBottom: '24px', fontFamily: MONO, letterSpacing: '0.06em', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}
        onMouseOver={e => { e.currentTarget.style.borderColor = BORDER_HOVER; e.currentTarget.style.color = '#38bdf8'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SUB; }}>
        ← Back to Overview
      </button>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 4px' }}>{metrics.departmentName}</h2>
        <div style={{ fontSize: '12px', color: SUB, fontFamily: MONO }}>30-day performance report · {fmtNum(metrics.totalRequests)} total requests</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        <KPICard label="Total Requests" value={fmtNum(metrics.totalRequests)} accentColor="#38bdf8" />
        <KPICard label="Open" value={fmtNum(metrics.openRequests)} subtext={`${fmtNum(metrics.resolvedRequests)} resolved`} accentColor="#34d399" />
        <KPICard label="Avg Resolution" value={fmtHours(metrics.avgResolutionHours)} accentColor="#fbbf24" />
        <KPICard label="SLA Compliance" value={`${metrics.slaCompliancePct}%`} accentColor={metrics.slaCompliancePct >= 80 ? '#10b981' : '#ef4444'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px' }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '10px', color: SUB, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: MONO, marginBottom: '20px' }}>Daily Request Volume — Last 30 Days</div>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#334155', fontFamily: MONO }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#334155', fontFamily: MONO }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#38bdf8', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: SUB }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.2 }}>◬</div>
              <div style={{ fontFamily: MONO, fontSize: '12px' }}>No trend data available</div>
            </div>
          )}
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '10px', color: SUB, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: MONO, marginBottom: '20px' }}>Status Distribution</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} strokeWidth={2} stroke="rgba(10,15,30,0.8)">
                  {statusData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.fullStatus] || '#64748b'} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtNum(v)} contentStyle={{ background: '#0d1627', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', fontFamily: MONO, fontSize: '12px' }} />
                <Legend formatter={(v) => <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: MONO }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: SUB, fontFamily: MONO, fontSize: '12px' }}>No data</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({ dashboardData, loading, onDrillDown, drillDeptId, onBackToOverview, onRefresh }) {
  if (drillDeptId) {
    return <DeptDetail deptId={drillDeptId} onBack={onBackToOverview} />;
  }

  const data = dashboardData;
  const slaGood = data && data.overallSlaCompliancePct >= 80;

  return (
    <div style={{ animation: 'slideUp 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Overview Dashboard</h1>
          <div style={{ fontSize: '12px', color: SUB, fontFamily: MONO }}>
            {data ? `${fmtNum(data.totalOpenRequests + data.totalResolvedRequests)} total requests tracked` : 'Loading...'}
          </div>
        </div>
        <button onClick={() => onRefresh(30)} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '8px 16px', fontSize: '12px', color: SUB, cursor: 'pointer', fontFamily: MONO, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = BORDER_HOVER; e.currentTarget.style.color = '#38bdf8'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SUB; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '36px' }}>
        <KPICard label="Open Requests" value={loading ? '—' : fmtNum(data?.totalOpenRequests)} subtext="Awaiting resolution" accentColor="#0ea5e9" loading={loading} />
        <KPICard label="Resolved" value={loading ? '—' : fmtNum(data?.totalResolvedRequests)} subtext="Last 30 days" accentColor="#10b981" loading={loading} />
        <KPICard label="Avg Resolution" value={loading ? '—' : fmtHours(data?.overallAvgResolutionHours)} subtext="All departments" accentColor="#f59e0b" loading={loading} />
        <KPICard label="SLA Compliance" value={loading ? '—' : `${data?.overallSlaCompliancePct}%`} subtext={loading ? '' : slaGood ? '✓ Within target' : '⚠ Below 80% target'} accentColor={loading ? '#64748b' : slaGood ? '#10b981' : '#ef4444'} loading={loading} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: SUB, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: MONO }}>
          Department Performance ({data?.departmentMetrics?.length || 0} departments)
        </div>
        <div style={{ fontSize: '11px', color: MUTED, fontFamily: MONO }}>Click any card to view detailed analytics →</div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '20px', height: '180px' }}>
              <Skeleton height={18} width={140} radius={4} style={{ marginBottom: 16 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {[1,2,3,4].map(j => <div key={j}><Skeleton height={10} width={40} radius={3} style={{ marginBottom: 6 }} /><Skeleton height={20} width={50} radius={4} /></div>)}
              </div>
              <Skeleton height={4} width="100%" radius={2} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {data?.departmentMetrics?.map(dept => (
            <DeptCard key={dept.departmentId} metrics={dept} onClick={() => onDrillDown(dept.departmentId)} />
          ))}
        </div>
      )}
    </div>
  );
}
