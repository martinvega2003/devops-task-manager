import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeModeProvider } from './context/themeModeContext.jsx';
import "./theme.css";

const App = () => (
  <ThemeModeProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<h2>Login Page</h2>} />
      </Routes>
    </BrowserRouter>
  </ThemeModeProvider>
);

export default App;


