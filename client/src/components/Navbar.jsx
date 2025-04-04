import React, { useContext } from 'react';
import { FaRocket } from 'react-icons/fa'; // Example Icon as Company Logo
import { AuthContext } from '../context/authContext.jsx'; 
import { ThemeModeContext } from '../context/themeModeContext.jsx';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const { darkMode, setDarkMode } = useContext(ThemeModeContext);

  return (
    <nav className="fixed z-99 top-0 left-0 right-0 w-screen h-16 flex items-center justify-between px-4 py-2 shadow-md bg-white dark:bg-gray-800">
      {/* Left side: Logo */}
      <div className="flex items-center text-primary dark:text-secondary-dark">
        <FaRocket className="text-3xl" />
        <span className="ml-2 text-xl font-bold hidden sm:block">CompanyName</span>
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
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
