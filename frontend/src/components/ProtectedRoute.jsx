import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    // Not authorized for this role
    return <Navigate to="/" replace />;
  }

  return children;
}
