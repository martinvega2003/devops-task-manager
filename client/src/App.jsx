import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeModeProvider } from './context/themeModeContext.jsx';
import "./theme.css";
import LoginPage from './pages/admin/LoginPage.jsx';

const App = () => (
  <ThemeModeProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </ThemeModeProvider>
);

export default App;


