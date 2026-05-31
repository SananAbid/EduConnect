import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';

const AssignmentModal = ({ courseId, onClose, onSaved }) => {
  const { post } = useApi();
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', totalMarks: 100, isPublished: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await post('/api/assignments', { ...form, course: courseId });
      onSaved(data.assignment);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">📝 New Assignment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="Assignment title" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Describe the assignment..." required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input name="dueDate" type="datetime-local" className="form-input" value={form.dueDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks *</label>
              <input name="totalMarks" type="number" className="form-input" value={form.totalMarks} onChange={handleChange} min="1" required />
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input name="isPublished" type="checkbox" checked={form.isPublished} onChange={handleChange} id="publish" />
            <label htmlFor="publish" style={{ fontSize: 14, cursor: 'pointer' }}>Publish immediately (visible to students)</label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
