import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

const SubmitAssignmentModal = ({ assignment, onClose }) => {
  const { post } = useApi();
  const [form, setForm] = useState({ content: '', attachmentUrl: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await post('/api/submissions', { assignment: assignment._id, ...form });
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="modal-overlay">
      <div className="modal" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={{ marginBottom: 8 }}>Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your assignment has been submitted successfully.</p>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">📤 Submit Assignment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 18 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{assignment.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Due: {new Date(assignment.dueDate).toLocaleString()} • {assignment.totalMarks} marks</div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {new Date() > new Date(assignment.dueDate) && (
          <div className="alert alert-error">⚠️ This assignment is past due. Your submission will be marked as late.</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Answer / Response *</label>
            <textarea name="content" className="form-textarea" style={{ minHeight: 140 }} value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Type your answer here..." required />
          </div>
          <div className="form-group">
            <label className="form-label">Attachment URL (optional)</label>
            <input className="form-input" value={form.attachmentUrl}
              onChange={e => setForm({ ...form, attachmentUrl: e.target.value })}
              placeholder="https://drive.google.com/your-file..." />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Assignment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitAssignmentModal;
