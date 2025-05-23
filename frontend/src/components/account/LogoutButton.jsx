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
      className="transition"
    >
      Выйти
    </button>
  );
};

export default LogoutButton; 