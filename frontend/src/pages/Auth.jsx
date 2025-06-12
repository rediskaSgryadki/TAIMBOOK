import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getToken, setAuthData, clearAuthData } from '../utils/authUtils';
import PinForm from '../components/account/pin/PinForm';
import Header from '../components/Header';

// Переиспользуемый компонент для ввода пароля
const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
  autoComplete = 'current-password',
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
      {placeholder}
    </label>
    <div className="relative flex items-center">
      <input
        id={id}
        name={name}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white pr-10"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-0 flex items-center px-3 text-neutral-500 hover:text-indigo-700 dark:text-neutral-400 dark:hover:text-indigo-300 focus:outline-none"
        style={{ background: 'none', border: 'none' }}
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
      >
        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
      </button>
    </div>
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.135:8000';

  useEffect(() => {
    const checkTokenAndPinStatus = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/users/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.has_pin) {
            setShowPinForm(true);
          } else {
            navigate('/account/home');
          }
        } catch (err) {
          console.error("Token validation failed:", err);
          clearAuthData();
        }
      }
    };
    checkTokenAndPinStatus();
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

    if (!isLogin && password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const data = isLogin
        ? { email, password }
        : { username, email, password, password2: confirmPassword };

      const response = await axios.post(`${API_URL}/api/users/${endpoint}/`, data, {
        headers: { 'Content-Type': 'application/json' }
      });

      if ((response.data.access || response.data.token) && response.data.user) {
        setAuthData(response.data);
        const token = response.data.access || response.data.token;
        const pinResponse = await axios.get(`${API_URL}/api/users/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pinResponse.data.has_pin) {
          setShowPinForm(true);
        } else {
          navigate('/account/home');
        }
      } else {
        setError('Ошибка: Данные авторизации отсутствуют или неполные');
      }
    } catch (err) {
      console.error("Authentication error:", err);
      if (err.response?.status === 400) {
         // Handle specific 400 errors from backend, e.g., duplicate user
         if (err.response.data.email) {
            setError('Пользователь с таким Email уже существует.');
         } else if (err.response.data.username) {
             setError('Пользователь с таким именем пользователя уже существует.');
         } else if (err.response.data.password) {
             setError('Неверный email или пароль.'); // Common login error
         } else {
             setError(err.response.data.detail || 'Ошибка запроса.');
         }
      } else if (err.response?.status === 401 && isLogin) {
        setError('Неверный email или пароль. Пожалуйста, попробуйте снова.');
        clearAuthData();
      } else {
        setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
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
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
              {isLogin ? 'Вход в аккаунт' : 'Создать аккаунт'}
            </h2>
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Или{' '}
              <button
                onClick={handleToggleMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 bg-transparent border-none cursor-pointer p-0"
              >
                {isLogin ? 'зарегистрируйтесь' : 'войдите'}
              </button>
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <input type="hidden" name="remember" defaultValue="true" /> {/* Keep remember hidden input if needed */}
            <div className="space-y-4">
              {!isLogin && (
                <div> {/* Use div for consistent spacing */}
                  <label htmlFor="username" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Имя пользователя
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required={!isLogin}
                    className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div> {/* Use div for consistent spacing */}
                <label htmlFor="email-address" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {/* Пароль */}
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              {/* Подтверждение пароля при регистрации */}
              {!isLogin && (
                <PasswordInput
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторить пароль"
                  showPassword={showConfirmPassword}
                  setShowPassword={setShowConfirmPassword}
                  autoComplete="new-password"
                />
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
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
