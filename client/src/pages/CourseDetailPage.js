import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import AssignmentModal from '../components/AssignmentModal';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { get, post, del } = useApi();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cData, aData] = await Promise.all([
          get(`/api/courses/${id}`),
          get(`/api/assignments?courseId=${id}`)
        ]);
        setCourse(cData.course);
        setAssignments(aData.assignments || []);
        if (user.role === 'student') {
          const eData = await get(`/api/enrollments/check/${id}`);
          setIsEnrolled(eData.isEnrolled);
        }
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, [id, user.role, get]);

  const handleEnroll = async () => {
    try {
      await post('/api/enrollments', { courseId: id });
      setIsEnrolled(true);
      setMsg('Enrolled successfully!');
    } catch (err) { setMsg(err.message); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Drop this course?')) return;
    try {
      await del(`/api/enrollments/${id}`);
      setIsEnrolled(false);
      setMsg('Dropped course');
    } catch (err) { setMsg(err.message); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;
  if (!course) return <div className="page"><div className="alert alert-error">Course not found</div></div>;

  const isOwner = user.role === 'admin' || (user.role === 'teacher' && course.teacher?._id === user._id);

  return (
    <div className="page">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>

      {msg && <div className={`alert ${msg.includes('success') || msg.includes('Enrolled') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {/* Hero */}
      <div className="course-detail-hero">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: 10 }}>{course.subject}</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>{course.description}</p>
          <div className="course-detail-meta">
            <span>👨‍🏫 {course.teacher?.name}</span>
            <span>📊 Grade {course.gradeLevel}</span>
            <span>👥 {course.enrolledStudents?.length || 0}/{course.maxStudents} students</span>
            {course.schedule && <span>📅 {course.schedule}</span>}
          </div>
        </div>
        <div className="course-detail-actions">
          {user.role === 'student' && !isEnrolled && (
            <button className="btn btn-primary" onClick={handleEnroll}>Enroll in Course</button>
          )}
          {user.role === 'student' && isEnrolled && (
            <>
              <span className="badge badge-success" style={{ fontSize: 13, padding: '6px 14px' }}>✓ Enrolled</span>
              <button className="btn btn-danger btn-sm" onClick={handleUnenroll}>Drop Course</button>
            </>
          )}
        </div>
      </div>

      <div className="course-detail-grid">
        {/* Assignments */}
        <div>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <h2 className="section-title">📝 Assignments ({assignments.length})</h2>
            {isOwner && <button className="btn btn-primary btn-sm" onClick={() => setShowAssignmentModal(true)}>+ Add</button>}
          </div>
          {assignments.length === 0
            ? <div className="empty-state"><div className="empty-icon">📝</div><h3>No assignments yet</h3></div>
            : assignments.map(a => (
                <div key={a._id} className="assignment-card">
                  <div className="assignment-card-left">
                    <div className="assignment-card-title">{a.title}</div>
                    <div className="assignment-card-desc">{a.description?.substring(0, 80)}...</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className={`badge ${new Date(a.dueDate) < new Date() ? 'badge-danger' : 'badge-warning'}`}>
                        Due: {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                      <span className="badge badge-muted">🏆 {a.totalMarks} marks</span>
                      {!a.isPublished && <span className="badge badge-warning">Draft</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    {user.role === 'student' && isEnrolled && (
                      <button className="btn btn-primary btn-sm" onClick={() => { setSelectedAssignment(a); setShowSubmitModal(true); }}>Submit</button>
                    )}
                    {isOwner && (
                      <a href={`/assignments/${a._id}/submissions`} className="btn btn-secondary btn-sm">View Submissions</a>
                    )}
                  </div>
                </div>
              ))
          }
        </div>

        {/* Students Roster */}
        {(isOwner) && (
          <div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>👥 Enrolled Students ({course.enrolledStudents?.length || 0})</h2>
            <div className="card">
              {course.enrolledStudents?.length === 0
                ? <div className="empty-state" style={{ padding: 30 }}><div className="empty-icon">👥</div><h3>No students yet</h3></div>
                : course.enrolledStudents?.map(s => (
                    <div key={s._id} className="student-row">
                      <div className="avatar avatar-sm" style={{ background: '#4f46e5' }}>{s.name?.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        )}
      </div>

      {showAssignmentModal && (
        <AssignmentModal courseId={id} onClose={() => setShowAssignmentModal(false)} onSaved={(a) => { setAssignments(prev => [...prev, a]); setShowAssignmentModal(false); }} />
      )}
      {showSubmitModal && selectedAssignment && (
        <SubmitAssignmentModal assignment={selectedAssignment} onClose={() => { setShowSubmitModal(false); setSelectedAssignment(null); }} />
      )}
    </div>
  );
};

export default CourseDetailPage;
