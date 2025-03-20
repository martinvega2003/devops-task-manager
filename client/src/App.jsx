import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeModeProvider } from './context/themeModeContext.jsx';
import { AuthProvider } from './context/authContext.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import Navbar from './components/Navbar.jsx';

const App = () => (
  <AuthProvider>
    <ThemeModeProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/login' element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeModeProvider>
  </AuthProvider>
);

export default App;


