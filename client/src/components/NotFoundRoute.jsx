import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const NotFoundRoute = () => {
  const { token } = useContext(AuthContext); // Check if the user is logged in

  // If the user is not logged in, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, render nothing (stay on the current page)
  return null;
};

export default NotFoundRoute;