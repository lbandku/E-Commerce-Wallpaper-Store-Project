import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NoAccess from '../pages/NoAccess.jsx';

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuth();
  const loc = useLocation();

  // Not logged in → send to login, preserve where they were going
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // Logged in but missing required role
  if (role && user?.role !== role) {
    return <NoAccess />;
  }

  return children;
}


