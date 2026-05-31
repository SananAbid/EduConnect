import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

const PRIORITIES = { high: { label: 'High', badge: 'badge-danger', icon: '🔴' }, medium: { label: 'Medium', badge: 'badge-warning', icon: '🟡' }, low: { label: 'Low', badge: 'badge-muted', icon: '🟢' } };

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const { get, post, del } = useApi();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetRole: 'all', priority: 'medium' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/api/announcements');
      setAnnouncements(data.announcements || []);
    } catch {}
    setLoading(false);
  }, [get]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await post('/api/announcements', form);
      setForm({ title: '', content: '', targetRole: 'all', priority: 'medium' });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this announcement?')) return;
    try {
      await del(`/api/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch {}
  };

  const canCreate = user.role === 'teacher' || user.role === 'admin';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📢 Announcements</h1>
          <p className="page-subtitle">{announcements.length} active announcements</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Announcement'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ marginBottom: 18, fontSize: 16, fontWeight: 700 }}>📣 Post New Announcement</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" required />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-textarea" style={{ minHeight: 100 }} value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your announcement..." required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select className="form-select" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                  <option value="all">Everyone</option>
                  <option value="student">Students only</option>
                  <option value="teacher">Teachers only</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Posting...' : 'Post Announcement'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
      ) : announcements.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📢</div><h3>No announcements</h3><p>Nothing posted yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(a => {
            const p = PRIORITIES[a.priority] || PRIORITIES.medium;
            return (
              <div key={a._id} className="announcement-card" style={{ borderLeft: `4px solid ${a.priority === 'high' ? 'var(--danger)' : a.priority === 'medium' ? 'var(--warning)' : 'var(--border)'}` }}>
                <div className="announcement-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.title}</h3>
                    <span className={`badge ${p.badge}`}>{p.label}</span>
                    {a.targetRole !== 'all' && <span className="badge badge-muted">→ {a.targetRole}s</span>}
                    {a.course && <span className="badge badge-primary">📚 {a.course.title}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {(user.role === 'admin' || (user.role === 'teacher' && a.author?._id === user._id)) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Remove</button>
                    )}
                  </div>
                </div>
                <div style={{ padding: '12px 18px' }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{a.content}</p>
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar avatar-sm" style={{ background: a.author?.role === 'admin' ? '#7c3aed' : '#0891b2', fontSize: 12 }}>
                    {a.author?.name?.charAt(0)}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Posted by <strong>{a.author?.name}</strong>
                    <span style={{ textTransform: 'capitalize' }}> ({a.author?.role})</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
