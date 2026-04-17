import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { fmtDate, fmtNum } from '../utils/formatters';

const CARD = 'rgba(255,255,255,0.03)';
const BORDER = 'rgba(255,255,255,0.07)';
const MONO = 'var(--font-mono, monospace)';
const MUTED = '#475569';
const SUB = '#64748b';
const TEXT = '#e2e8f0';

const STATUS_STYLE = {
  OPEN:        { bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.3)',  color: '#38bdf8'  },
  IN_PROGRESS: { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24'  },
  RESOLVED:    { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  color: '#34d399'  },
  CLOSED:      { bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.2)', color: '#94a3b8'  },
  ESCALATED:   { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', color: '#f87171'  },
};
const P_COLOR = { 1:'#f87171',2:'#fb923c',3:'#fbbf24',4:'#a3e635',5:'#94a3b8' };
const P_LABEL = { 1:'P1 · Critical',2:'P2 · High',3:'P3 · Medium',4:'P4 · Low',5:'P5 · Minimal' };
const STATUSES = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','ESCALATED'];
const CATEGORIES = ['INFRASTRUCTURE','PERMITS','UTILITIES','MAINTENANCE','INSPECTION','TRAFFIC','COMPLAINT','SAFETY'];

function SelectInput({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={onChange} style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
      borderRadius: '7px', padding: '8px 12px', fontSize: '12px',
      color: TEXT, fontFamily: MONO, outline: 'none', cursor: 'pointer',
      ...style,
    }}>
      {children}
    </select>
  );
}

function StatusUpdateModal({ request, onClose, onUpdated }) {
  const [status, setStatus] = useState(request.status);
  const [assignedTo, setAssignedTo] = useState(request.assignedTo || '');
  const [notes, setNotes] = useState(request.resolutionNotes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${BORDER}`, borderRadius: '7px',
    padding: '10px 14px', fontSize: '13px', color: TEXT,
    fontFamily: 'var(--font-display,sans-serif)', outline: 'none',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ status });
      if (assignedTo.trim()) params.append('assignedTo', assignedTo.trim());
      if (notes.trim()) params.append('resolutionNotes', notes.trim());
      await api.put(`/requests/${request.id}/status?${params}`);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#0d1627', border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: TEXT, margin: 0 }}>Update Request Status</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '22px', cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}>×</button>
        </div>
        <div style={{ fontSize: '12px', color: SUB, fontFamily: MONO, marginBottom: '24px' }}>#{request.id} · {request.title}</div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '7px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#fca5a5' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'New Status', el: (
              <SelectInput value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </SelectInput>
            )},
            { label: 'Assign To (optional)', el: <input style={inputStyle} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Staff member name" /> },
            { label: 'Resolution Notes (optional)', el: <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe resolution or next steps..." /> },
          ].map(({ label, el }) => (
            <div key={label} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: SUB, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '7px', fontFamily: MONO }}>{label}</label>
              {el}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '11px', fontSize: '13px', color: MUTED, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: '7px', padding: '11px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateRequestModal({ depts, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'MAINTENANCE', priority: 3, departmentId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${BORDER}`, borderRadius: '7px',
    padding: '10px 14px', fontSize: '13px', color: TEXT,
    fontFamily: 'var(--font-display,sans-serif)', outline: 'none',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.departmentId) { setError('Title and department are required.'); return; }
    setLoading(true);
    try {
      await api.post('/requests', { ...form, departmentId: Number(form.departmentId), priority: Number(form.priority) });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#0d1627', border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '32px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: TEXT, margin: 0 }}>New Service Request</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: MUTED, fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '7px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: '#fca5a5' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Title *', el: <input style={inputStyle} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Brief description of the issue" maxLength={255} /> },
            { label: 'Description', el: <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Detailed description..." /> },
            { label: 'Department *', el: (
              <SelectInput value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})} style={{ width: '100%' }}>
                <option value="">Select department</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </SelectInput>
            )},
            { label: 'Category', el: (
              <SelectInput value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </SelectInput>
            )},
            { label: 'Priority', el: (
              <SelectInput value={form.priority} onChange={e => setForm({...form, priority: Number(e.target.value)})} style={{ width: '100%' }}>
                {[1,2,3,4,5].map(p => <option key={p} value={p}>{P_LABEL[p]}</option>)}
              </SelectInput>
            )},
          ].map(({ label, el }) => (
            <div key={label} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: SUB, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '7px', fontFamily: MONO }}>{label}</label>
              {el}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'none', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '12px', fontSize: '13px', color: MUTED, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: '7px', padding: '12px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequestsTab({ user }) {
  const [reqs, setReqs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editReq, setEditReq] = useState(null);

  const canManage = ['ADMIN', 'MANAGER'].includes(user?.role);

  useEffect(() => {
    api.get('/departments').then(r => setDepts(r.data)).catch(console.error);
  }, []);

  const fetchReqs = useCallback(async () => {
    setLoading(true);
    try {
      const p = { page, size: 20, sort: 'submittedAt,desc' };
      if (statusFilter) p.status = statusFilter;
      if (deptFilter) p.departmentId = deptFilter;
      const r = await api.get('/requests', { params: p });
      setReqs(r.data.content || []);
      setTotalPages(r.data.totalPages || 0);
      setTotalElements(r.data.totalElements || 0);
    } catch (e) { console.error('Fetch error:', e); }
    finally { setLoading(false); }
  }, [page, statusFilter, deptFilter]);

  useEffect(() => { fetchReqs(); }, [fetchReqs]);

  const TH = ({ children, align = 'left' }) => (
    <th style={{ padding: '10px 16px', textAlign: align, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: SUB, fontFamily: MONO, fontWeight: 500, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.3)' }}>
      {children}
    </th>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Service Requests</h2>
          <div style={{ fontSize: '12px', color: SUB, fontFamily: MONO }}>{fmtNum(totalElements)} total records</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SelectInput value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </SelectInput>
          <SelectInput value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(0); }}>
            <option value="">All Departments</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </SelectInput>
          {canManage && (
            <button onClick={() => setShowCreate(true)} style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.15s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              + New Request
            </button>
          )}
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                <TH>ID</TH><TH>Title</TH><TH>Department</TH>
                <TH>Priority</TH><TH>Status</TH><TH>Score</TH><TH>Submitted</TH>
                {canManage && <TH align="center">Actions</TH>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={canManage ? 8 : 7} style={{ padding: '56px', textAlign: 'center', color: SUB, fontFamily: MONO, fontSize: '12px', letterSpacing: '0.1em' }}>
                  Loading requests...
                </td></tr>
              ) : reqs.length === 0 ? (
                <tr><td colSpan={canManage ? 8 : 7} style={{ padding: '56px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', opacity: 0.2, marginBottom: '12px' }}>◬</div>
                  <div style={{ color: SUB, fontFamily: MONO, fontSize: '12px' }}>No requests found</div>
                </td></tr>
              ) : reqs.map(r => {
                const ss = STATUS_STYLE[r.status] || STATUS_STYLE.OPEN;
                return (
                  <tr key={r.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: 'background 0.1s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(14,165,233,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '11px', color: MUTED }}>#{r.id}</td>
                    <td style={{ padding: '13px 16px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                      {r.category && <div style={{ fontSize: '10px', color: SUB, marginTop: '2px', fontFamily: MONO, letterSpacing: '0.05em' }}>{r.category}</div>}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: '12px', color: SUB, whiteSpace: 'nowrap' }}>{r.departmentName || '—'}</td>
                    <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '11px', color: P_COLOR[r.priority] || SUB, fontWeight: 600 }}>{P_LABEL[r.priority] || `P${r.priority}`}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: MONO, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, fontWeight: 600 }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '12px', color: SUB }}>{r.priorityScore?.toFixed(1) ?? '—'}</td>
                    <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: '11px', color: MUTED, whiteSpace: 'nowrap' }}>{fmtDate(r.submittedAt)}</td>
                    {canManage && (
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <button onClick={() => setEditReq(r)} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '5px', padding: '4px 10px', fontSize: '11px', color: '#38bdf8', cursor: 'pointer', fontFamily: MONO, letterSpacing: '0.06em', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; e.target.style.background = 'rgba(56,189,248,0.08)'; }}
                          onMouseOut={e => { e.target.style.borderColor = BORDER; e.target.style.background = 'none'; }}>
                          Update
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        {[['← Previous', page === 0, () => setPage(p => Math.max(0, p - 1))],
          ['Next →', page >= totalPages - 1, () => setPage(p => p + 1)]].map(([label, dis, action]) => (
          <button key={label} onClick={action} disabled={dis} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '8px 18px', fontSize: '12px', color: dis ? MUTED : '#38bdf8', cursor: dis ? 'not-allowed' : 'pointer', fontFamily: MONO, letterSpacing: '0.06em', opacity: dis ? 0.4 : 1, transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
        <span style={{ fontSize: '11px', color: SUB, fontFamily: MONO }}>Page {page + 1} of {Math.max(1, totalPages)}</span>
      </div>

      {showCreate && <CreateRequestModal depts={depts} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchReqs(); }} />}
      {editReq && <StatusUpdateModal request={editReq} onClose={() => setEditReq(null)} onUpdated={() => { setEditReq(null); fetchReqs(); }} />}
    </div>
  );
}
