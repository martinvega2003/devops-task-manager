import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const ProtectedRoute = () => {
  const { token } = useContext(AuthContext); // Or use localStorage.getItem('token') if needed

  // If token exists, render nested routes; otherwise, redirect to login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

