import React, { useState } from 'react';

const SUBJECTS = ['Mathematics','Science','English','History','Computer Science','Art','Music','Physical Education','Other'];

const CourseModal = ({ course, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    subject: course?.subject || 'Mathematics',
    gradeLevel: course?.gradeLevel || '9',
    schedule: course?.schedule || '',
    maxStudents: course?.maxStudents || 30,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await onSave(form, !!course);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{course ? 'Edit Course' : 'Create New Course'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title *</label>
            <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="e.g. Introduction to Algebra" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} placeholder="Describe what students will learn..." required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select name="subject" className="form-select" value={form.subject} onChange={handleChange}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Grade Level *</label>
              <select name="gradeLevel" className="form-select" value={form.gradeLevel} onChange={handleChange}>
                {['6','7','8','9','10','11','12','Undergraduate','Graduate'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Schedule</label>
              <input name="schedule" className="form-input" value={form.schedule} onChange={handleChange} placeholder="e.g. Mon/Wed 10am" />
            </div>
            <div className="form-group">
              <label className="form-label">Max Students</label>
              <input name="maxStudents" type="number" className="form-input" value={form.maxStudents} onChange={handleChange} min="1" max="200" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
