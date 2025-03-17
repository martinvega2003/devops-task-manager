import React from 'react';
import mainImage from "../../images/login-page-image.jpg"

const LoginPage = () => {
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
            Manage your projects, manage their tasks, manage their workers
          </h2>
          <p className="text-body text-surface-black">
            A tool to manage all the projects you have in one single platform. Define teh daily tasks to accomplish, register your 
            team members and start assigning them their duties.
          </p>
        </div>
      </div>

      {/* Right Side: Login/Register Form */}
      <div className="fixed z-10 right-0 w-1/2 min-h-full flex items-center justify-center bg-white p-8 shadow-2xl">
        <form className="w-full max-w-md">
          <h2 className="text-heading text-primary mb-4">Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-transparent hover:text-primary transition duration-300 border-2 border-primary"
          >
            Login
          </button>
          <p className="mt-4 text-center">
            Don't have an account?{' '}
            <a href="#" className="text-secondary font-bold">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
