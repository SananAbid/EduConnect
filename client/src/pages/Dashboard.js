import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

const Dashboard = () => {
  const { user } = useAuth();
  const { get } = useApi();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'student') {
          const [c, a, n] = await Promise.all([
            get('/api/courses?enrolled=true&limit=4'),
            get('/api/assignments'),
            get('/api/announcements')
          ]);
          setCourses(c.courses || []);
          setAssignments((a.assignments || []).slice(0, 5));
          setAnnouncements((n.announcements || []).slice(0, 3));
        } else if (user.role === 'teacher') {
          const [c, a, n] = await Promise.all([
            get('/api/courses?mine=true&limit=4'),
            get('/api/assignments'),
            get('/api/announcements')
          ]);
          setCourses(c.courses || []);
          setAssignments((a.assignments || []).slice(0, 5));
          setAnnouncements((n.announcements || []).slice(0, 3));
        } else {
          const [c, u, n] = await Promise.all([
            get('/api/courses?limit=4'),
            get('/api/users'),
            get('/api/announcements')
          ]);
          setCourses(c.courses || []);
          setUsers(u.users || []);
          setAnnouncements((n.announcements || []).slice(0, 3));
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, [user.role, get]);

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  const greetTime = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const upcoming = assignments.filter(a => new Date(a.dueDate) > new Date());

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">{greetTime()}, {user.name.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle" style={{ textTransform: 'capitalize' }}>{user.role} Dashboard</p>
        </div>
        {user.role === 'teacher' && <Link to="/courses" className="btn btn-primary">+ New Course</Link>}
        {user.role === 'admin' && <Link to="/admin" className="btn btn-primary">⚙️ Admin Panel</Link>}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {user.role === 'student' && <>
          <div className="stat-card"><div className="stat-icon">📚</div><div className="stat-label">Enrolled Courses</div><div className="stat-value">{courses.length}</div></div>
          <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-label">Assignments</div><div className="stat-value">{assignments.length}</div></div>
          <div className="stat-card"><div className="stat-icon">⏰</div><div className="stat-label">Upcoming Due</div><div className="stat-value">{upcoming.length}</div></div>
          <div className="stat-card"><div className="stat-icon">📢</div><div className="stat-label">Announcements</div><div className="stat-value">{announcements.length}</div></div>
        </>}
        {user.role === 'teacher' && <>
          <div className="stat-card"><div className="stat-icon">🏫</div><div className="stat-label">My Courses</div><div className="stat-value">{courses.length}</div></div>
          <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-label">Assignments</div><div className="stat-value">{assignments.length}</div></div>
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-label">Total Students</div><div className="stat-value">{courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0)}</div></div>
          <div className="stat-card"><div className="stat-icon">📢</div><div className="stat-label">Announcements</div><div className="stat-value">{announcements.length}</div></div>
        </>}
        {user.role === 'admin' && <>
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-label">Total Users</div><div className="stat-value">{users.length}</div></div>
          <div className="stat-card"><div className="stat-icon">📚</div><div className="stat-label">Total Courses</div><div className="stat-value">{courses.length}</div></div>
          <div className="stat-card"><div className="stat-icon">👨‍🎓</div><div className="stat-label">Students</div><div className="stat-value">{users.filter(u => u.role === 'student').length}</div></div>
          <div className="stat-card"><div className="stat-icon">👩‍🏫</div><div className="stat-label">Teachers</div><div className="stat-value">{users.filter(u => u.role === 'teacher').length}</div></div>
        </>}
      </div>

      <div className="dashboard-grid">
        {/* Courses */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">{user.role === 'student' ? '📚 My Courses' : user.role === 'teacher' ? '🏫 My Courses' : '📚 Recent Courses'}</h2>
            <Link to="/courses" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {courses.length === 0
            ? <div className="empty-state"><div className="empty-icon">📚</div><h3>No courses yet</h3><p>{user.role === 'student' ? 'Explore and enroll in courses' : 'Create your first course'}</p></div>
            : <div className="mini-course-list">
                {courses.map(c => (
                  <Link to={`/courses/${c._id}`} key={c._id} className="mini-course-card">
                    <div className="mini-course-thumb">{c.subject?.charAt(0) || '📚'}</div>
                    <div>
                      <div className="mini-course-title">{c.title}</div>
                      <div className="mini-course-meta">{c.subject} • {c.teacher?.name || 'N/A'}</div>
                    </div>
                    <span className="badge badge-primary" style={{ marginLeft: 'auto', flexShrink: 0 }}>{c.enrolledStudents?.length || 0} students</span>
                  </Link>
                ))}
              </div>
          }
        </div>

        {/* Right column */}
        <div>
          {/* Upcoming Assignments (student/teacher) */}
          {user.role !== 'admin' && (
            <div className="dashboard-section" style={{ marginBottom: 20 }}>
              <div className="section-header">
                <h2 className="section-title">📝 {user.role === 'teacher' ? 'Recent Assignments' : 'Upcoming Assignments'}</h2>
                <Link to="/assignments" className="btn btn-secondary btn-sm">View All</Link>
              </div>
              {upcoming.length === 0
                ? <div className="empty-state" style={{ padding: '30px' }}><div className="empty-icon">✅</div><h3>All caught up!</h3></div>
                : upcoming.map(a => (
                    <div key={a._id} className="assignment-item">
                      <div>
                        <div className="assignment-title">{a.title}</div>
                        <div className="assignment-meta">{a.course?.title}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="due-date">Due: {new Date(a.dueDate).toLocaleDateString()}</div>
                        <span className={`badge ${new Date(a.dueDate) - new Date() < 86400000 ? 'badge-danger' : 'badge-warning'}`}>
                          {Math.ceil((new Date(a.dueDate) - new Date()) / 86400000)}d left
                        </span>
                      </div>
                    </div>
                  ))
              }
            </div>
          )}

          {/* Announcements */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">📢 Announcements</h2>
              <Link to="/announcements" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {announcements.length === 0
              ? <div className="empty-state" style={{ padding: '30px' }}><div className="empty-icon">📢</div><h3>No announcements</h3></div>
              : announcements.map(a => (
                  <div key={a._id} className="announcement-item">
                    <div className="announcement-title">{a.title}</div>
                    <div className="announcement-meta">{a.author?.name} • {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
