// App.jsx
import React, { useContext } from 'react';
import { ThemeModeProvider, ThemeModeContext } from './context/themeModeContext.jsx';
import "./theme.css";

const Content = () => {
  const { darkMode, setDarkMode } = useContext(ThemeModeContext);

  return (
    <div className="app-section min-h-screen app-section">
      <div className="container mx-auto px-4">
        <div className="text-center py-16">
          <h1 className="text-heading text-primary font-bold mb-4">
            Welcome to Project Manager
          </h1>
          <h4 className="text-subheading text-surface-black mb-8">
            This is a sample page to test my Tailwind CSS configuration with a custom color palette, typography, and layout.
            <br />
            It also test the Dark & Light mode Context Provider, all in the App.jsx file.
          </h4>
          <button onClick={() => setDarkMode(!darkMode)} className="border-2 border-primary text-white hover:text-primary bg-primary hover:bg-transparent transition duration-300 px-4 py-2 rounded cursor-pointer">
            Toggle {darkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <ThemeModeProvider>
    <Content />
  </ThemeModeProvider>
);

export default App;


