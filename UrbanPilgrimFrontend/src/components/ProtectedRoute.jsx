// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useSelector(state => state.auth);

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Token:', !!token);
  console.log('ProtectedRoute - Required Role:', requiredRole);
  console.log('ProtectedRoute - User Roles:', user?.roles);

  if (!token || !user) {
    console.log('ProtectedRoute - No token or user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && (!user.roles || !user.roles.includes(requiredRole.toUpperCase()))) {
    console.log('ProtectedRoute - Role mismatch, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute;