import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import SupervisorsPage  from './pages/SupervisorsPage';
import ProjectsPage     from './pages/ProjectsPage';
import ResourcesPage    from './pages/ResourcesPage';
import RequestsPage     from './pages/RequestsPage';
import StudentsPage     from './pages/StudentsPage';
import ProfilePage      from './pages/ProfilePage';
import FeedbackPage     from './pages/FeedbackPage';
import AdminUsersPage   from './pages/AdminUsersPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import NotFoundPage     from './pages/NotFoundPage';

// Layout
import AppLayout from './components/layout/AppLayout';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Public-only route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — all authenticated users */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard"   element={<DashboardPage />} />
        <Route path="profile"     element={<ProfilePage />} />
        <Route path="feedback"    element={<FeedbackPage />} />
        <Route path="requests"    element={<RequestsPage />} />
        <Route path="projects"    element={<ProjectsPage />} />

        {/* Student only */}
        <Route path="supervisors" element={<ProtectedRoute allowedRoles={['student','admin']}><SupervisorsPage /></ProtectedRoute>} />
        <Route path="resources"   element={<ProtectedRoute allowedRoles={['student','admin']}><ResourcesPage /></ProtectedRoute>} />

        {/* Supervisor + Admin */}
        <Route path="students"    element={<ProtectedRoute allowedRoles={['supervisor','admin']}><StudentsPage /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="admin/users"     element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
