import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeModeProvider } from './context/themeModeContext.jsx';
import { AuthProvider } from './context/authContext.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';

const App = () => {

  return (
    <AuthProvider>
      <ThemeModeProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/home' element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeModeProvider>
    </AuthProvider>
  )
};

export default App;


