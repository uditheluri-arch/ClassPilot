import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import MyClassPage from '../pages/student/MyClassPage';
import ExamsPage from '../pages/student/ExamsPage';
import ResultsPage from '../pages/student/ResultsPage';
import AssignmentsPage from '../pages/student/AssignmentsPage';
import StudyMaterialsPage from '../pages/student/StudyMaterialsPage';

import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import MyClassesPage from '../pages/faculty/MyClassesPage';
import StudentManagementPage from '../pages/faculty/StudentManagementPage';
import ExamsManagementPage from '../pages/faculty/ExamsManagementPage';
import AssignmentsManagementPage from '../pages/faculty/AssignmentsManagementPage';
import FacultyStudyMaterialsPage from '../pages/faculty/StudyMaterialsPage';

import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Root redirect handler
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (role === 'FACULTY') {
    return <Navigate to="/faculty/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

// Public login wrapper: redirects to dashboard if already logged in
const PublicLoginRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
    if (role === 'FACULTY') {
      return <Navigate to="/faculty/dashboard" replace />;
    }
  }

  return <LoginPage />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Authentication */}
      <Route path="/login" element={<PublicLoginRoute />} />

      {/* --- Student Portal (Protected) --- */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/my-class"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MyClassPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/exams"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ExamsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/materials"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudyMaterialsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ResultsPage />
          </ProtectedRoute>
        }
      />

      {/* --- Faculty Portal (Protected) --- */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/classes"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <MyClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/students"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <StudentManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/exams"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <ExamsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/assignments"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <AssignmentsManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/materials"
        element={
          <ProtectedRoute allowedRoles={['FACULTY']}>
            <FacultyStudyMaterialsPage />
          </ProtectedRoute>
        }
      />

      {/* Error & Access Pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
