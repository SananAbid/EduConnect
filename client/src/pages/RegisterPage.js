import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand"><span>🎓</span><h1>EduConnect</h1></div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join EduConnect to start your learning journey</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" type="text" className="form-input" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="student">👨‍🎓 Student</option>
              <option value="teacher">👩‍🏫 Teacher</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input name="confirmPassword" type="password" className="form-input" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
