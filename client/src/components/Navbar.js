import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['student', 'teacher', 'admin'] },
    { path: '/courses', label: 'Courses', icon: '📚', roles: ['student', 'teacher', 'admin'] },
    { path: '/assignments', label: 'Assignments', icon: '📝', roles: ['student', 'teacher', 'admin'] },
    { path: '/announcements', label: 'Notices', icon: '📢', roles: ['student', 'teacher', 'admin'] },
    { path: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
  ].filter(l => l.roles.includes(user?.role));

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">EduConnect</span>
        </Link>

        <ul className="navbar-links">
          {navLinks.map(link => (
            <li key={link.path}>
              <Link to={link.path} className={`nav-link ${isActive(link.path) ? 'active' : ''}`}>
                <span>{link.icon}</span> {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="avatar avatar-sm" style={{ background: user?.role === 'teacher' ? '#0891b2' : user?.role === 'admin' ? '#7c3aed' : '#4f46e5' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user?.name}</span>
            <span className="dropdown-arrow">▾</span>
            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div style={{ fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
                <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>👤 My Profile</Link>
                <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
              </div>
            )}
          </div>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className="mobile-link" onClick={() => setMenuOpen(false)}>
              {link.icon} {link.label}
            </Link>
          ))}
          <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
          <button className="mobile-link logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
