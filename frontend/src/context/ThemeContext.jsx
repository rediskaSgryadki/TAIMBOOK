import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

// Standard pages that use system theme
export const STANDARD_THEME_PAGES = [
  '/',  // Home
  '/about',
  '/auth',
  '/privacy-policy',
  '/user-agreement'
];

// Доступные темы
export const THEME_FAMILIES = [
  'light',             // Стандартная 
  'SmokyGarden',       // Дымчатый сад
  'BluePages',         // Синие страницы 
  'MidnightEntries',   // Полуночные записи
  'PastelEntries'      // Пастельные записи
];

export const ThemeProvider = ({ children }) => {
  // STANDARD THEME SYSTEM (for public pages)
  // ---------------------------------------
  // Get initial theme from localStorage or default to 'light'
  const [standardTheme, setStandardTheme] = useState(() => {
    const savedTheme = localStorage.getItem('standard-theme');
    return savedTheme || 'light';
  });

  // Function to toggle standard theme
  const toggleStandardTheme = () => {
    const newTheme = standardTheme === 'light' ? 'dark' : 'light';
    setStandardTheme(newTheme);
    localStorage.setItem('standard-theme', newTheme);
  };
  
  // ACCOUNT THEME SYSTEM (for profile and account pages)
  // ---------------------------------------------------
  // Семейство темы (light, SmokyGarden, BluePages, MidnightEntries, PastelEntries)
  const [themeFamily, setThemeFamily] = useState(() => {
    const savedThemeFamily = localStorage.getItem('themeFamily') || 'light';
    return savedThemeFamily;
  });

  // Темный или светлый вариант выбранной темы
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode');
    return savedDarkMode === 'true';
  });
  
  // Переключение между светлым и темным вариантом
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Изменение семейства темы
  const handleSetThemeFamily = (newThemeFamily) => {
    if (THEME_FAMILIES.includes(newThemeFamily)) {
      setThemeFamily(newThemeFamily);
    }
  };

  // THEME APPLICATION LOGIC
  // ----------------------
  // Apply appropriate theme based on current path
  useEffect(() => {
    const applyTheme = () => {
      const path = window.location.pathname;
      const isStandardPage = STANDARD_THEME_PAGES.includes(path);
      
      if (isStandardPage) {
        // Apply standard theme for public pages
        if (standardTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Remove account theme classes
        document.body.classList.remove(
          'light-theme', 'dark-theme', 
          'SmokyGarden-light-theme', 'SmokyGarden-dark-theme', 
          'BluePages-light-theme', 'BluePages-dark-theme', 
          'MidnightEntries-light-theme', 'MidnightEntries-dark-theme', 
          'PastelEntries-light-theme', 'PastelEntries-dark-theme'
        );
      } else {
        // Apply account theme for profile/account pages
        // Remove standard theme class
        document.documentElement.classList.remove('dark');
        
        // Remove all account theme classes
        document.body.classList.remove(
          'light-theme', 'dark-theme', 
          'SmokyGarden-light-theme', 'SmokyGarden-dark-theme', 
          'BluePages-light-theme', 'BluePages-dark-theme', 
          'MidnightEntries-light-theme', 'MidnightEntries-dark-theme', 
          'PastelEntries-light-theme', 'PastelEntries-dark-theme'
        );
        
        // Add current account theme class
        const themeClass = `${themeFamily}-${isDarkMode ? 'dark' : 'light'}-theme`;
        document.body.classList.add(themeClass);
        
        // Save to localStorage
        localStorage.setItem('themeFamily', themeFamily);
        localStorage.setItem('isDarkMode', isDarkMode);
      }
    };
    
    // Apply theme
    applyTheme();
    
    // Listen for route changes
    const handleRouteChange = () => {
      applyTheme();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [standardTheme, themeFamily, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ 
      // Standard theme props
      standardTheme, 
      toggleStandardTheme,
      // Account theme props
      themeFamily,
      isDarkMode,
      toggleDarkMode,
      setThemeFamily: handleSetThemeFamily
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;