import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AssignmentsPage from './pages/AssignmentsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><CoursesPage /></PrivateRoute>} />
        <Route path="/courses/:id" element={<PrivateRoute><CourseDetailPage /></PrivateRoute>} />
        <Route path="/assignments" element={<PrivateRoute><AssignmentsPage /></PrivateRoute>} />
        <Route path="/assignments/:id/submissions" element={<PrivateRoute roles={['teacher','admin']}><SubmissionsPage /></PrivateRoute>} />
        <Route path="/announcements" element={<PrivateRoute><AnnouncementsPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPanel /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
