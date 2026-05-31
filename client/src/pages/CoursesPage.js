import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import CourseModal from '../components/CourseModal';
import './Dashboard.css';

const SUBJECTS = ['Mathematics','Science','English','History','Computer Science','Art','Music','Physical Education','Other'];

const CoursesPage = () => {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [msg, setMsg] = useState('');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/courses?limit=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (subject) url += `&subject=${encodeURIComponent(subject)}`;
      if (activeTab === 'mine') {
        if (user.role === 'student') url += '&enrolled=true';
        else url += '&mine=true';
      }
      const data = await get(url);
      setCourses(data.courses || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [get, search, subject, activeTab, user.role]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    if (user.role === 'student') {
      get('/api/enrollments').then(d => {
        setEnrolledIds(new Set((d.enrollments || []).map(e => e.course?._id)));
      }).catch(() => {});
    }
  }, [user.role, get]);

  const handleEnroll = async (courseId) => {
    try {
      await post('/api/enrollments', { courseId });
      setEnrolledIds(prev => new Set([...prev, courseId]));
      setMsg('Enrolled successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await del(`/api/courses/${courseId}`);
      fetchCourses();
    } catch {}
  };

  const handleSave = async (formData, isEdit) => {
    try {
      if (isEdit) {
        await put(`/api/courses/${editCourse._id}`, formData);
      } else {
        await post('/api/courses', formData);
      }
      setShowModal(false);
      setEditCourse(null);
      fetchCourses();
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Courses</h1>
          <p className="page-subtitle">{total} courses available</p>
        </div>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>+ New Course</button>
        )}
      </div>

      {msg && <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {user.role !== 'admin' && (
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Courses</button>
          <button className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
            {user.role === 'student' ? '📚 My Enrolled' : '🏫 My Courses'}
          </button>
        </div>
      )}

      <div className="search-bar">
        <input className="search-input" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 180 }} value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
      ) : courses.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📚</div><h3>No courses found</h3><p>Try adjusting your filters</p></div>
      ) : (
        <div className="card-grid">
          {courses.map(c => (
            <div key={c._id} className="course-card">
              <div className="course-header" style={{ background: subjectColor(c.subject) }}>
                <span className="course-subject-icon">{subjectIcon(c.subject)}</span>
                <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{c.subject}</span>
              </div>
              <div className="course-body">
                <h3 className="course-title">{c.title}</h3>
                <p className="course-desc">{c.description?.substring(0, 80)}...</p>
                <div className="course-meta">
                  <span>👨‍🏫 {c.teacher?.name || 'N/A'}</span>
                  <span>👥 {c.enrolledStudents?.length || 0}/{c.maxStudents}</span>
                  <span>📊 Grade {c.gradeLevel}</span>
                </div>
              </div>
              <div className="course-actions">
                <Link to={`/courses/${c._id}`} className="btn btn-secondary btn-sm">View</Link>
                {user.role === 'student' && !enrolledIds.has(c._id) && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(c._id)}>Enroll</button>
                )}
                {user.role === 'student' && enrolledIds.has(c._id) && (
                  <span className="badge badge-success">✓ Enrolled</span>
                )}
                {(user.role === 'teacher' && c.teacher?._id === user._id) || user.role === 'admin' ? (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditCourse(c); setShowModal(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CourseModal course={editCourse} onSave={handleSave} onClose={() => { setShowModal(false); setEditCourse(null); }} />}
    </div>
  );
};

const subjectColor = (s) => {
  const map = { Mathematics:'linear-gradient(135deg,#4f46e5,#818cf8)', Science:'linear-gradient(135deg,#0891b2,#22d3ee)', English:'linear-gradient(135deg,#059669,#34d399)', History:'linear-gradient(135deg,#d97706,#fbbf24)', 'Computer Science':'linear-gradient(135deg,#7c3aed,#a78bfa)', Art:'linear-gradient(135deg,#db2777,#f472b6)', Music:'linear-gradient(135deg,#dc2626,#f87171)' };
  return map[s] || 'linear-gradient(135deg,#64748b,#94a3b8)';
};
const subjectIcon = (s) => ({ Mathematics:'➗', Science:'🔬', English:'📖', History:'🏛️', 'Computer Science':'💻', Art:'🎨', Music:'🎵', 'Physical Education':'⚽' }[s] || '📚');

export default CoursesPage;
