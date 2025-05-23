import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken, redirectToAuth, setAuthData, clearAuthData } from '../utils/authUtils';
import PinForm from '../components/account/pin/PinForm';
import Header from '../components/Header';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPinStatus = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.has_pin) {
            setShowPinForm(true);
          } else {
            navigate('/account/home');
          }
        } catch (err) {
          console.error('Ошибка проверки PIN:', err);
          if (err.response?.status === 401) {
            clearAuthData();
            setError('Сессия истекла. Пожалуйста, войдите снова.');
            redirectToAuth(navigate);
          } else {
            setError('Произошла ошибка при проверке сессии. Пожалуйста, войдите снова.');
            redirectToAuth(navigate);
          }
        }
      }
    };
    checkPinStatus();
  }, [navigate]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const data = isLogin 
        ? { email, password } 
        : { username, email, password, confirm_password: confirmPassword };
      
      console.log('Sending auth request to:', `http://localhost:8000/api/users/${endpoint}/`);
      const response = await axios.post(`http://localhost:8000/api/users/${endpoint}/`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth response:', response.data);
      
      // Check both token formats (access/token)
      if ((response.data.access || response.data.token) && response.data.user) {
        // Save auth data
        setAuthData(response.data);
        
        // Get the token for the next request
        const token = response.data.access || response.data.token;
        console.log('Using token for /me request:', token);
        
        // Check user's PIN status
        const pinResponse = await axios.get('http://localhost:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('PIN response:', pinResponse.data);
        if (pinResponse.data.has_pin) {
          setShowPinForm(true);
        } else {
          navigate('/account/home');
        }
      } else {
        console.error('Missing token data in response:', response.data);
        setError('Ошибка: Данные авторизации отсутствуют или неполные');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.response?.status === 401 && isLogin) {
        setError('Неверный email или пароль. Пожалуйста, попробуйте снова.');
        clearAuthData();
      } else {
        setError(err.response?.data?.error || 'Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = () => {
    navigate('/account/home');
  };

  if (showPinForm) {
    return <PinForm onSuccess={handlePinSuccess} />;
  }

  return (
    <>
    <Header/>
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <p className="mt-2 text-center text-sm">
            Или{' '}
            <button onClick={handleToggleMode} className="font-medium text-lime-600 hover:text-lime-500 bg-transparent border-none cursor-pointer">
              {isLogin ? 'зарегистрируйтесь' : 'войдите'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="space-y-4">
            {!isLogin && (
              <div className="mb-3">
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required={!isLogin}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="email-address" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative mb-3">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6 text-gray-400 hover:text-lime-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            {!isLogin && (
              <div className="mb-3">
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Повторить пароль
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required={!isLogin}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
                  placeholder="Повторить пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm">
                Запомнить меня
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Auth;
