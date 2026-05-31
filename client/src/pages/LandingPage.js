import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand">🎓 EduConnect</div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🚀 Modern Learning Platform</span>
          <h1>Where Students, Teachers &amp; Knowledge Connect</h1>
          <p>EduConnect brings classrooms to life — manage courses, assignments, grades, and announcements all in one collaborative platform.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Start Learning Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card1">📚 12 Active Courses</div>
          <div className="floating-card card2">✅ Assignment Submitted</div>
          <div className="floating-card card3">🏆 Grade: A (95%)</div>
          <div className="hero-circle">
            <span>🎓</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Everything You Need to Succeed</h2>
        <div className="features-grid">
          {[
            { icon: '📚', title: 'Course Management', desc: 'Teachers create and manage courses with ease. Students enroll and track progress.' },
            { icon: '📝', title: 'Assignment Tracking', desc: 'Post assignments with due dates, submit work, and receive graded feedback.' },
            { icon: '📢', title: 'Live Announcements', desc: 'Admins and teachers broadcast important updates to students instantly.' },
            { icon: '📊', title: 'Grade Monitoring', desc: 'Track submission status, view grades, and monitor academic performance.' },
            { icon: '🔐', title: 'Role-Based Access', desc: 'Separate dashboards for Students, Teachers, and Admins with proper permissions.' },
            { icon: '⚡', title: 'Real-Time SPA', desc: 'Fast single-page experience with no page reloads, built with React + Node.' },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="roles-section">
        <h2>Built for Every Role</h2>
        <div className="roles-grid">
          <div className="role-card student">
            <div className="role-icon">👨‍🎓</div>
            <h3>Students</h3>
            <ul>
              <li>Browse and enroll in courses</li>
              <li>Submit assignments</li>
              <li>Track grades and feedback</li>
              <li>View announcements</li>
            </ul>
          </div>
          <div className="role-card teacher">
            <div className="role-icon">👩‍🏫</div>
            <h3>Teachers</h3>
            <ul>
              <li>Create and manage courses</li>
              <li>Post and grade assignments</li>
              <li>Publish announcements</li>
              <li>Monitor student submissions</li>
            </ul>
          </div>
          <div className="role-card admin">
            <div className="role-icon">🛡️</div>
            <h3>Admins</h3>
            <ul>
              <li>Manage all users and roles</li>
              <li>Oversee all courses</li>
              <li>System-wide announcements</li>
              <li>Full platform visibility</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Connect?</h2>
        <p>Join thousands of educators and students already using EduConnect.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Your Account</Link>
      </section>

      <footer className="landing-footer">
        <div>🎓 EduConnect &copy; 2026 — MERN Stack Educational Platform</div>
      </footer>
    </div>
  );
};

export default LandingPage;
