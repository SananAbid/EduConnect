import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';

const AssignmentsPage = () => {
  const { user } = useAuth();
  const { get, put, del } = useApi();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | upcoming | past
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submissions, setSubmissions] = useState({});

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get('/api/assignments');
      setAssignments(data.assignments || []);
      // For students, also fetch their submissions to show status
      if (user.role === 'student') {
        const sData = await get('/api/submissions');
        const subMap = {};
        (sData.submissions || []).forEach(s => { subMap[s.assignment?._id] = s; });
        setSubmissions(subMap);
      }
    } catch {}
    setLoading(false);
  }, [get, user.role]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleTogglePublish = async (a) => {
    try {
      await put(`/api/assignments/${a._id}`, { isPublished: !a.isPublished });
      setAssignments(prev => prev.map(x => x._id === a._id ? { ...x, isPublished: !x.isPublished } : x));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await del(`/api/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a._id !== id));
    } catch {}
  };

  const now = new Date();
  const filtered = assignments.filter(a => {
    if (filter === 'upcoming') return new Date(a.dueDate) > now;
    if (filter === 'past') return new Date(a.dueDate) <= now;
    return true;
  });

  const getStatus = (a) => {
    const sub = submissions[a._id];
    if (sub) return { label: sub.status === 'graded' ? `Graded: ${sub.grade}/${a.totalMarks}` : 'Submitted', color: sub.status === 'graded' ? 'badge-success' : 'badge-primary' };
    if (new Date(a.dueDate) < now) return { label: 'Missed', color: 'badge-danger' };
    const daysLeft = Math.ceil((new Date(a.dueDate) - now) / 86400000);
    return { label: `${daysLeft}d left`, color: daysLeft <= 1 ? 'badge-danger' : 'badge-warning' };
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 Assignments</h1>
          <p className="page-subtitle">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {['all','upcoming','past'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'upcoming' ? '⏳ Upcoming' : '✓ Past'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><h3>No assignments</h3><p>Nothing here for this filter.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(a => {
            const status = user.role === 'student' ? getStatus(a) : null;
            const isPast = new Date(a.dueDate) < now;
            return (
              <div key={a._id} className={`assignment-row-card ${isPast && user.role !== 'student' ? 'past' : ''}`}>
                <div className="assignment-row-left">
                  <div className="assignment-row-icon">{isPast ? '✅' : '📋'}</div>
                  <div>
                    <div className="assignment-row-title">{a.title}</div>
                    <div className="assignment-row-meta">
                      <span>📚 {a.course?.title}</span>
                      <span>🏆 {a.totalMarks} marks</span>
                      {user.role === 'teacher' && <span>👨‍🏫 {a.teacher?.name}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>{a.description?.substring(0, 100)}...</p>
                  </div>
                </div>
                <div className="assignment-row-right">
                  <div style={{ textAlign: 'right', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {user.role === 'student' && status && <span className={`badge ${status.color}`}>{status.label}</span>}
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <span className={`badge ${a.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {a.isPublished ? 'Published' : 'Draft'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {user.role === 'student' && !submissions[a._id] && new Date(a.dueDate) > now && (
                      <button className="btn btn-primary btn-sm" onClick={() => { setSelectedAssignment(a); setShowSubmit(true); }}>Submit</button>
                    )}
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <>
                        <Link to={`/assignments/${a._id}/submissions`} className="btn btn-secondary btn-sm">Submissions</Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleTogglePublish(a)}>
                          {a.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSubmit && selectedAssignment && (
        <SubmitAssignmentModal
          assignment={selectedAssignment}
          onClose={() => { setShowSubmit(false); setSelectedAssignment(null); fetchAssignments(); }}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
