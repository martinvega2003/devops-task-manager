import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeModeProvider } from './context/themeModeContext.jsx';
import { AuthProvider } from './context/authContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';

//React-tostify:
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminRoute from './components/AdminRoute.jsx';
import MyTeamSection from './pages/admin/MyTeamSection.jsx';
import NonAdminRoute from './components/NonAdminRoute.jsx';
import MyProjectsSection from './pages/admin/MyProjectsSection.jsx';
import ProjectSection from './pages/admin/ProjectSection.jsx';

const App = () => {

  return (
    <AuthProvider>
      <ThemeModeProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/home' element={<AdminRoute />}>
              <Route path="/home/my-team" element={<MyTeamSection />} />
              <Route path="/home/my-projects" element={<MyProjectsSection />} />
              <Route path="/home/my-projects/:project_id" element={<ProjectSection />} />
            </Route>
            <Route path='/user' element={<NonAdminRoute />}>
              <Route path="/user/home" element={<HomePage />} />
            </Route>
          </Routes>
          <Sidebar />
          <Navbar />
        </BrowserRouter>
      </ThemeModeProvider>
    </AuthProvider>
  )
};

export default App;


