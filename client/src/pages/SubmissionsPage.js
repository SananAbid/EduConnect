import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

const SubmissionsPage = () => {
  const { id: assignmentId } = useParams();
  const { get, put } = useApi();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null); // { subId, grade, feedback }
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [aData, sData] = await Promise.all([
          get(`/api/assignments/${assignmentId}`),
          get(`/api/submissions?assignmentId=${assignmentId}`)
        ]);
        setAssignment(aData.assignment);
        setSubmissions(sData.submissions || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [assignmentId, get]);

  const handleGrade = async () => {
    if (!grading) return;
    try {
      const data = await put(`/api/submissions/${grading.subId}/grade`, {
        grade: Number(grading.grade),
        feedback: grading.feedback
      });
      setSubmissions(prev => prev.map(s => s._id === grading.subId ? data.submission : s));
      setMsg('Graded successfully!');
      setGrading(null);
    } catch (err) { setMsg(err.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  const graded = submissions.filter(s => s.status === 'graded').length;
  const avgGrade = graded > 0
    ? (submissions.filter(s => s.status === 'graded').reduce((acc, s) => acc + s.grade, 0) / graded).toFixed(1)
    : '—';

  return (
    <div className="page">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>

      {assignment && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow)' }}>
          <h1 className="page-title" style={{ marginBottom: 6 }}>📋 {assignment.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 14 }}>{assignment.description}</p>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-muted)' }}>
            <span>🏆 Total Marks: <strong style={{ color: 'var(--text)' }}>{assignment.totalMarks}</strong></span>
            <span>📅 Due: <strong style={{ color: 'var(--text)' }}>{new Date(assignment.dueDate).toLocaleString()}</strong></span>
            <span>📤 Submissions: <strong style={{ color: 'var(--text)' }}>{submissions.length}</strong></span>
            <span>✅ Graded: <strong style={{ color: 'var(--text)' }}>{graded}</strong></span>
            <span>📊 Avg: <strong style={{ color: 'var(--text)' }}>{avgGrade}</strong></span>
          </div>
        </div>
      )}

      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {submissions.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📭</div><h3>No submissions yet</h3><p>Students haven't submitted this assignment yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {submissions.map(s => (
            <div key={s._id} className="submission-card">
              <div className="submission-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar avatar-sm">{s.student?.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.student?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.student?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`badge ${s.status === 'graded' ? 'badge-success' : s.status === 'late' ? 'badge-danger' : 'badge-primary'}`}>
                    {s.status === 'graded' ? `✓ ${s.grade}/${assignment?.totalMarks}` : s.status === 'late' ? 'Late' : 'Submitted'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(s.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="submission-content">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)' }}>SUBMISSION</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.content}</p>
                {s.attachmentUrl && (
                  <a href={s.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>📎 View Attachment</a>
                )}
              </div>
              {s.status === 'graded' && s.feedback && (
                <div style={{ padding: '12px 16px', background: '#f0fdf4', borderTop: '1px solid var(--border)', borderRadius: '0 0 var(--radius) var(--radius)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>FEEDBACK</div>
                  <p style={{ fontSize: 14 }}>{s.feedback}</p>
                </div>
              )}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {grading?.subId === s._id ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                    <input type="number" className="form-input" style={{ width: 90 }} placeholder={`/ ${assignment?.totalMarks}`}
                      min="0" max={assignment?.totalMarks} value={grading.grade}
                      onChange={e => setGrading({ ...grading, grade: e.target.value })} />
                    <input className="form-input" style={{ flex: 1, minWidth: 150 }} placeholder="Feedback (optional)"
                      value={grading.feedback} onChange={e => setGrading({ ...grading, feedback: e.target.value })} />
                    <button className="btn btn-success btn-sm" onClick={handleGrade}>Save Grade</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setGrading(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => setGrading({ subId: s._id, grade: s.grade || '', feedback: s.feedback || '' })}>
                    {s.status === 'graded' ? '✏️ Edit Grade' : '🏆 Grade'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
