import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthData } from '../../utils/authUtils';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Очищаем данные авторизации
    clearAuthData();
    
    // Перенаправляем на страницу входа
    navigate('/auth');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full py-2 px-10 text-neutral-900 dark:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800 transition-colors text-left"
    >
      Выйти
    </button>
  );
};

export default LogoutButton; 