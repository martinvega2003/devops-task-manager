import React, { useContext } from 'react';
import { FaRocket } from 'react-icons/fa'; // Example Icon as Company Logo
import { AuthContext } from '../context/authContext.jsx'; 
import { ThemeModeContext } from '../context/themeModeContext.jsx';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const { darkMode, setDarkMode } = useContext(ThemeModeContext);

  return (
    <nav className="fixed top-0 w-full h-16 flex items-center justify-between px-4 py-2 shadow-md bg-white dark:bg-gray-800">
      {/* Left side: Logo */}
      <div className="flex items-center">
        <FaRocket className="text-primary text-3xl" />
        <span className="ml-2 text-xl font-bold text-primary">CompanyName</span>
      </div>
      
      {/* Right side: Buttons */}
      <div className="flex items-center space-x-4">
        {token && (
          <button 
            onClick={logout} 
            className="px-3 py-1 border border-primary rounded text-white bg-primary hover:bg-transparent hover:text-primary transition duration-300"
          >
            Logout
          </button>
        )}
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="px-3 py-1 border border-secondary rounded text-white bg-secondary hover:bg-transparent hover:text-secondary transition duration-300"
        >
          {darkMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
