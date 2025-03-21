import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Initialize token and user values from LS (If there are)
  const [token, setToken] = useState(() => localStorage.getItem('token') || null); // Set token as null if there is none in the LS
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Save or remove the token on localStorage when it changes
  useEffect(() => { 
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Save or remove user on localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (token, user) => {
    setToken(token); 
    setUser(user)
  };

  const logout = () => {
    setToken(null);
    setUser(null)
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
