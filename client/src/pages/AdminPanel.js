import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';

const AdminPanel = () => {
  const { get, put, del } = useApi();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [editUser, setEditUser] = useState(null);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/users?limit=50';
      if (roleFilter) url += `&role=${roleFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const data = await get(url);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [get, roleFilter, search]);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await get('/api/courses?limit=50');
      setCourses(data.courses || []);
    } catch {}
  }, [get]);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [fetchUsers, fetchCourses]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await put(`/api/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showMsg('Role updated successfully');
    } catch (err) { showMsg(err.message, 'error'); }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await put(`/api/users/${userId}`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      showMsg(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { showMsg(err.message, 'error'); }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await put(`/api/courses/${courseId}`, { isActive: false });
      setCourses(prev => prev.filter(c => c._id !== courseId));
      showMsg('Course removed');
    } catch (err) { showMsg(err.message, 'error'); }
  };

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Panel</h1>
          <p className="page-subtitle">Manage users, courses, and system settings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-label">Total Users</div><div className="stat-value">{users.length}</div></div>
        <div className="stat-card"><div className="stat-icon">👨‍🎓</div><div className="stat-label">Students</div><div className="stat-value">{students.length}</div></div>
        <div className="stat-card"><div className="stat-icon">👩‍🏫</div><div className="stat-label">Teachers</div><div className="stat-value">{teachers.length}</div></div>
        <div className="stat-card"><div className="stat-icon">📚</div><div className="stat-label">Courses</div><div className="stat-value">{courses.length}</div></div>
      </div>

      {msg.text && <div className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}>{msg.text}</div>}

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users ({total})</button>
        <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>📚 Courses ({courses.length})</button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="search-bar">
            <input className="search-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ width: 160 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm" style={{ background: u.role === 'admin' ? '#7c3aed' : u.role === 'teacher' ? '#0891b2' : '#4f46e5' }}>
                              {u.name?.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                        <td>
                          <select
                            className="form-select"
                            style={{ width: 110, padding: '4px 8px', fontSize: 13 }}
                            value={u.role}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'courses' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Grade</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600, fontSize: 14, maxWidth: 200 }}>{c.title}</td>
                    <td><span className="badge badge-primary">{c.subject}</span></td>
                    <td style={{ fontSize: 13 }}>{c.teacher?.name}</td>
                    <td style={{ fontSize: 13 }}>{c.enrolledStudents?.length || 0}/{c.maxStudents}</td>
                    <td style={{ fontSize: 13 }}>Grade {c.gradeLevel}</td>
                    <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={`/courses/${c._id}`} className="btn btn-secondary btn-sm">View</a>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCourse(c._id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
