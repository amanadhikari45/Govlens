import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { fmtDateTime } from '../utils/formatters';

const CARD    = 'rgba(255,255,255,0.03)';
const BORDER  = 'rgba(255,255,255,0.07)';
const MONO    = 'var(--font-mono, monospace)';
const MUTED   = '#475569';
const SUB     = '#64748b';
const TEXT    = '#e2e8f0';

const SOURCE_META = {
  cache:         { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)',  label: 'CACHED'        },
  ai:            { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', label: 'AI GENERATED'  },
  'rule-based':  { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  label: 'RULE-BASED'    },
};

const DEPARTMENTS = [
  { id: 1, name: 'Public Works'             },
  { id: 2, name: 'Health & Human Services'  },
  { id: 3, name: 'Transportation'           },
  { id: 4, name: 'Parks & Recreation'       },
  { id: 5, name: 'Building & Permits'       },
  { id: 6, name: 'Water & Sanitation'       },
  { id: 7, name: 'Public Safety'            },
  { id: 8, name: 'Information Technology'   },
];

function InsightCard({ insight, onRefresh, canGenerate, refreshing }) {
  const src = SOURCE_META[insight.source] || SOURCE_META['rule-based'];
  const deptName = insight.departmentName
    || DEPARTMENTS.find(d => d.id === insight.departmentId)?.name
    || `Department #${insight.departmentId}`;

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderTop: `3px solid rgba(14,165,233,0.35)`,
      borderRadius: '12px',
      padding: '22px 24px',
      transition: 'border-color 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'}
      onMouseOut={e => e.currentTarget.style.borderColor = BORDER}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8', letterSpacing: '-0.01em' }}>
            {deptName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '9px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
              background: src.bg, border: `1px solid ${src.border}`,
              color: src.color, letterSpacing: '0.12em', fontFamily: MONO,
            }}>
              {src.label}
            </span>
            {insight.generatedAt && (
              <span style={{ fontSize: '10px', color: MUTED, fontFamily: MONO }}>
                {fmtDateTime(insight.generatedAt)}
              </span>
            )}
          </div>
        </div>
        {canGenerate && (
          <button
            onClick={() => onRefresh(insight.departmentId)}
            disabled={refreshing}
            style={{
              background: 'none',
              border: `1px solid ${BORDER}`,
              borderRadius: '6px',
              padding: '5px 11px',
              fontSize: '11px',
              color: refreshing ? MUTED : '#38bdf8',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: MONO,
              letterSpacing: '0.06em',
              transition: 'all 0.15s',
              flexShrink: 0,
              opacity: refreshing ? 0.5 : 1,
            }}
            onMouseOver={e => { if (!refreshing) { e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; e.currentTarget.style.background = 'rgba(56,189,248,0.06)'; }}}
            onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = 'none'; }}
          >
            ↻ Refresh
          </button>
        )}
      </div>

      {/* Insight text */}
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: '#cbd5e1',
        lineHeight: 1.8,
        letterSpacing: '0.01em',
      }}>
        {insight.insight || insight.content}
      </p>
    </div>
  );
}

export default function InsightsTab({ user }) {
  const [insights, setInsights]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [genAllActive, setGenAllActive] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [selDept, setSelDept]         = useState(1);
  const [error, setError]             = useState(null);

  const canGenerate = ['ADMIN', 'MANAGER'].includes(user?.role);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await api.get('/insights/latest');
      setInsights(res.data || []);
    } catch (e) {
      setError('Failed to load insights.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const generateOne = useCallback(async (deptId) => {
    setGenerating(true);
    try {
      const res = await api.post(`/insights/generate?departmentId=${deptId}`);
      const deptName = DEPARTMENTS.find(d => d.id === deptId)?.name;
      setInsights(prev => [
        { ...res.data, departmentName: deptName },
        ...prev.filter(i => i.departmentId !== deptId),
      ]);
    } catch (e) {
      console.error('Generate insight failed:', e);
    } finally {
      setGenerating(false);
    }
  }, []);

  const generateAll = useCallback(async () => {
    setGenAllActive(true);
    setGenProgress(0);
    const results = [];
    for (let i = 0; i < DEPARTMENTS.length; i++) {
      const dept = DEPARTMENTS[i];
      try {
        const res = await api.post(`/insights/generate?departmentId=${dept.id}`);
        results.push({ ...res.data, departmentName: dept.name });
      } catch (e) {
        console.error(`Failed insight for ${dept.name}:`, e);
      }
      setGenProgress(Math.round(((i + 1) / DEPARTMENTS.length) * 100));
    }
    // Merge: new results take priority, keep any existing not replaced
    setInsights(prev => {
      const newMap = {};
      results.forEach(r => { newMap[r.departmentId] = r; });
      const kept = prev.filter(i => !newMap[i.departmentId]);
      return [...results, ...kept];
    });
    setGenAllActive(false);
    setGenProgress(0);
  }, []);

  // Stats
  const stats = [
    { label: 'Total Insights',  value: insights.length },
    { label: 'From Cache',      value: insights.filter(i => i.source === 'cache').length },
    { label: 'AI Generated',    value: insights.filter(i => i.source === 'ai').length },
    { label: 'Rule-Based',      value: insights.filter(i => i.source === 'rule-based').length },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 4px' }}>
            AI-Generated Insights
          </h2>
          <div style={{ fontSize: '12px', color: SUB, fontFamily: MONO }}>
            Cache-first · 6-hour TTL · GPT-4 with rule-based fallback
          </div>
        </div>

        {canGenerate && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selDept}
              onChange={e => setSelDept(Number(e.target.value))}
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '9px 12px', fontSize: '12px', color: TEXT, fontFamily: MONO, outline: 'none', cursor: 'pointer' }}
            >
              {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button
              onClick={() => generateOne(selDept)}
              disabled={generating || genAllActive}
              style={{
                background: (generating || genAllActive) ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)',
                border: `1px solid ${(generating || genAllActive) ? BORDER : 'transparent'}`,
                borderRadius: '7px', padding: '9px 18px',
                fontSize: '13px', fontWeight: 600,
                color: (generating || genAllActive) ? MUTED : '#fff',
                cursor: (generating || genAllActive) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: (generating || genAllActive) ? 0.6 : 1,
              }}
            >
              {generating ? 'Generating...' : '+ Generate'}
            </button>
            <button
              onClick={generateAll}
              disabled={generating || genAllActive}
              style={{
                background: 'none', border: `1px solid ${BORDER}`, borderRadius: '7px',
                padding: '9px 14px', fontSize: '12px', color: genAllActive ? SUB : TEXT,
                cursor: (generating || genAllActive) ? 'not-allowed' : 'pointer',
                fontFamily: MONO, letterSpacing: '0.06em', transition: 'all 0.15s',
                opacity: (generating || genAllActive) ? 0.6 : 1,
              }}
              onMouseOver={e => { if (!generating && !genAllActive) e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; }}
            >
              {genAllActive ? `Generating... ${genProgress}%` : 'Generate All'}
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for generate-all */}
      {genAllActive && (
        <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden', height: '4px' }}>
          <div style={{ height: '100%', width: `${genProgress}%`, background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', transition: 'width 0.4s ease', borderRadius: '4px' }} />
        </div>
      )}

      {/* Stats strip */}
      {insights.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          {stats.map(({ label, value }) => (
            <div key={label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ fontSize: '9px', color: SUB, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: MONO, marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', letterSpacing: '-0.02em' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: SUB, fontFamily: MONO, fontSize: '13px', letterSpacing: '0.1em' }}>
          Loading insights...
        </div>
      ) : insights.length === 0 ? (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '72px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', opacity: 0.15, marginBottom: '16px' }}>◈</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: TEXT, marginBottom: '8px' }}>No insights generated yet</div>
          <div style={{ fontSize: '13px', color: SUB, fontFamily: MONO, maxWidth: '360px', margin: '0 auto' }}>
            {canGenerate
              ? 'Select a department above and click Generate, or use Generate All to create insights for every department at once.'
              : 'Insights will appear here once generated by a Manager or Admin.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
          {insights.map((ins, i) => (
            <InsightCard
              key={`${ins.departmentId}-${i}`}
              insight={ins}
              onRefresh={generateOne}
              canGenerate={canGenerate}
              refreshing={generating || genAllActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
