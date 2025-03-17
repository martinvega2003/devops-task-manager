import React, { useState } from 'react';
import axios from 'axios';
import mainImage from "../../images/login-page-image.jpg";

const LoginPage = () => {
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
        console.log('Successfully logged:', response.data);
      } else {
        const endpoint = "http://localhost:5001/api/auth/register"
        const response = await axios.post(endpoint, {
          name: formData.username,
          email: formData.email,
          password: formData.password,
        });
        console.log('Successfully registered:', response.data);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      // Handle error (e.g., display error message)
    }
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Left Side */}
      <div className="w-1/2 flex flex-col-reverse">
        {/* Upper half: Image placeholder */}
        <div className="h-1/2">
          <img
            src={mainImage || "https://via.placeholder.com/800x600"}
            alt="Project Management Team Drawing"
            className="w-full h-auto"
          />
        </div>
        {/* Lower half: Text content */}
        <div className="h-1/2 flex flex-col items-start justify-center p-8">
          <h1 className="text-heading text-primary font-bold mb-2">
            Project Manager
          </h1>
          <h2 className="text-subheading text-surface-black mb-2">
            Manage your projects, manage their tasks, manage your team.
          </h2>
          <p className="text-body text-surface-black">
            A tool to manage all the projects you have in one single platform. Define daily tasks, register your team members, and start assigning their duties.
          </p>
        </div>
      </div>

      {/* Right Side: Login/Register Form */}
      <div className="fixed z-10 right-0 w-1/2 min-h-full flex items-center justify-center bg-white p-8 border-l-2 border-primary">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <h2 className="text-heading text-primary mb-4">
            {isLogin ? 'Login' : 'Register'}
          </h2>
          {/* Conditionally render username field in register mode */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="email">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          {/* Conditionally render confirm password field in register mode */}
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
          )}
          <button
            type="submit"
            onClick={e => handleSubmit}
            className="w-full bg-primary text-white py-2 rounded hover:bg-transparent hover:text-primary transition duration-300 border-2 border-primary"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
          <p className="mt-4 text-center">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-secondary font-bold underline"
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
                  className="text-secondary font-bold underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

