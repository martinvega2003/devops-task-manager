import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const NonAdminRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect (you can choose an appropriate route)
  if (user.role === 'Admin') {
    return <Navigate to="/home/my-team" replace />;
  }
  
  // If the user is admin, render the nested routes
  return <Outlet />;
};

export default NonAdminRoute;
