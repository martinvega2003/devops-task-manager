import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const NotFoundRoute = () => {
  const { token, user } = useContext(AuthContext); // Get the token and user info from AuthContext

  // If the user is not logged in, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Determine the valid route based on the user's role
  const validRoute = user?.role === 'admin' ? '/home/my-team' : '/user/home';

  // Display the 404 page for logged-in users
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background dark:bg-background-dark">
      <h1 className="text-4xl font-bold text-primary dark:text-secondary-dark mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        The page you are looking for does not exist.
      </p>
      <a
        href={validRoute}
        className="text-primary dark:text-secondary-dark underline hover:text-primary-dark"
      >
        Go back to a valid page
      </a>
    </div>
  );
};

export default NotFoundRoute;