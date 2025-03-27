import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext'
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaProjectDiagram, FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const {user} = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Define widths for open and closed states
  const openWidth = 200;
  const closedWidth = 60;

  // Update body padding-left based on sidebar width
  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      document.body.style.paddingLeft = 0;
      return;
    }
    document.body.style.paddingLeft = isOpen ? `${openWidth}px` : `${closedWidth}px`;
  }, [isOpen, user]);

  // Define menu items with their target paths
  const menuItems = [
    { key: 'my-team', label: 'My Team', icon: <FaUsers size={24} />, path: '/home/my-team' },
    { key: 'my-projects', label: 'My Projects', icon: <FaProjectDiagram size={24} />, path: '/home/my-projects' },
  ];

  return (
    <div
      className={`fixed z-40 top-16 left-0 h-full bg-white dark:bg-gray-800 dark:text-surface-white transition-all duration-300 ${
        isOpen ? 'w-[200px]' : 'w-[60px]'
      } ${!user || user.role !== 'Admin' ? 'hidden' : ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Toggle button: always visible */}
        <div className="flex justify-end p-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="dark:text-surface-white focus:outline-none cursor-pointer"
          >
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
        {/* Menu items */}
        <div className="flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center w-full px-4 py-3 transition-colors duration-200 focus:outline-none ${
                location.pathname === item.path ? 'text-primary dark:text-primary-dark' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && <span className='whitespace-nowrap overflow-hidden'>{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
