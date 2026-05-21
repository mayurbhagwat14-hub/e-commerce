import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect to home if path requires admin role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
