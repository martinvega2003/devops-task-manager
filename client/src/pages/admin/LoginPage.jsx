import React, { useState, useContext } from 'react';
import axios from 'axios';
import mainImage from "../../images/login-page-image.png";
import { AuthContext } from '../../context/authContext';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  // Login context
  const { login } = useContext(AuthContext)

  // State to control whether we're in login mode or register mode
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // Only used for registration
    username: '',
    confirmPassword: '',
  });

  const navigate = useNavigate() // navigate function to redirect the user

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      if (isLogin) {
        const endpoint = "http://localhost:5001/api/auth/login"
        const response = await axios.post(endpoint, {
          email: formData.email,
          password: formData.password,
        });

        // Save token in localStorage
        login(response.data.token, response.data.user)
        console.log('Successfully logged:', response.data);
        navigate('/home')
      } else {
        const endpoint = "http://localhost:5001/api/auth/register"
        const response = await axios.post(endpoint, {
          name: formData.username,
          email: formData.email,
          password: formData.password,
        });

        // Save token in localStorage
        login(response.data.token, response.data.user)
        console.log('Successfully registered:', response.data);
        navigate('/home')
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      // Handle error (e.g., display error message)
    }
  };

  return (
    <div className="login-section bg-background dark:bg-background-dark h-fit py-8 px-4 sm:px-8 flex flex-col items-center justify-center">
      {/* Upper half: Text content */}
      <div className="py-2 sm:py-6 px-4 sm:px-12 flex flex-col items-start justify-center mb-8 sm:mb-20">
        <h1 className="text-heading text-primary dark:text-secondary-dark font-bold mb-2">
          Project Manager
        </h1>
        <p className="text-body text-surface-black dark:text-surface-white">
          A tool to manage all the projects you have in one single platform. Create a new project, setup an starting date and a deadline, define daily tasks, register your team members, and start assigning their duties.
        </p>
      </div>

      <div className="py-2 sm:py-6 px-4 sm:px-12 flex flex-col md:flex-row items-center h-fit rounded-4xl shadow-2xl">
        {/* Left Side */}
        <div className="w-full md:w-1/2">
          {/* Upper half: Image placeholder */}
          <div className="h-full">
            <img
              src={mainImage || "https://via.placeholder.com/800x600"}
              alt="Project Management Team Drawing"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Right Side: Login/Register Form */}
        <div className="w-full md:w-1/2 h-fit justify-center p-4 sm:p-8 border-t-2 md:border-t-0 md:border-l-2 border-primary dark:border-secondary-dark">
          <form className="w-full max-w-md">
            <h2 className="text-subheading text-primary dark:text-secondary-dark mb-4">
              {isLogin ? 'Login' : 'Register'}
            </h2>
            {/* Conditionally render username field in register mode */}
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-surface-black dark:text-surface-white placeholder:text-gray-800 dark:placeholder:text-gray-300 mb-1" htmlFor="email">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-surface-black dark:text-surface-white placeholder:text-gray-800 dark:placeholder:text-gray-300 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-surface-black dark:text-surface-white placeholder:text-gray-800 dark:placeholder:text-gray-300 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>
            {/* Conditionally render confirm password field in register mode */}
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-surface-black dark:text-surface-white mb-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  required
                />
              </div>
            )}
            <Button link="/home" onClick={handleSubmit}>
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <p className="text-caption text-surface-black dark:text-surface-white mt-4 text-center">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-secondary dark:text-primary-dark font-bold underline cursor-pointer"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-secondary dark:text-primary-dark font-bold underline cursor-pointer"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


