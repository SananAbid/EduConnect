import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      student: { email: 'student@educonnect.com', password: 'student123' },
      teacher: { email: 'teacher@educonnect.com', password: 'teacher123' },
      admin: { email: 'admin@educonnect.com', password: 'admin123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <span>🎓</span>
          <h1>EduConnect</h1>
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue learning</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">Try a demo account:</p>
          <div className="demo-buttons">
            <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('student')}>👨‍🎓 Student</button>
            <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('teacher')}>👩‍🏫 Teacher</button>
            <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('admin')}>🛡️ Admin</button>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
