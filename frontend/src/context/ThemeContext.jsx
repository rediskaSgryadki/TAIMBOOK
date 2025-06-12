import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// --- Removed: Standard pages and multiple theme families ---
// export const STANDARD_THEME_PAGES = [...];
// export const THEME_FAMILIES = [...];

export const ThemeProvider = ({ children }) => {
  // --- Simplified: Only one dark/light state ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check user preference from system or localStorage, default to false (light)
    const savedMode = localStorage.getItem('isDarkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Optional: check system preference if no localStorage value
    // return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false; // Default to light if no preference saved
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // --- Removed: Theme family state and function ---
  // const [themeFamily, setThemeFamily] = useState(() => {...});
  // const handleSetThemeFamily = (newThemeFamily) => {...};
  // const toggleStandardTheme = () => {...};

  // THEME APPLICATION LOGIC
  // ----------------------
  // Apply 'dark' class to html element based on isDarkMode
  useEffect(() => {
    if (isDarkMode) {
          document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme'); // Keep a body class for potential specific styles
      document.body.classList.remove('light-theme');
        } else {
          document.documentElement.classList.remove('dark');
      document.body.classList.add('light-theme'); // Keep a body class for potential specific styles
      document.body.classList.remove('dark-theme');
    }

    // Save preference to localStorage
        localStorage.setItem('isDarkMode', isDarkMode);

    // --- Removed: Complex theme class application logic ---
    // const applyTheme = () => {...};
    // applyTheme();
    // window.addEventListener('popstate', handleRouteChange);
    // return () => { window.removeEventListener('popstate', handleRouteChange); };

  }, [isDarkMode]); // Depend only on isDarkMode

  // --- Simplified: Provide only isDarkMode and toggleDarkMode ---
  return (
    <ThemeContext.Provider value={{ 
      isDarkMode,
      toggleDarkMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

// --- Removed: Exporting standard theme pages and theme families ---
// export default ThemeContext; // Already exported above