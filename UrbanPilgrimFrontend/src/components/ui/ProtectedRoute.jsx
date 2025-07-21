import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in, which is a nicer user experience than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If the user is logged in but does not have the required role,
    // redirect them to the home page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 