import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getToken, setAuthData, clearAuthData } from '../utils/authUtils';
import PinForm from '../components/account/pin/PinForm';
import Header from '../components/Header';

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
  <div className="relative mb-3">
    <label htmlFor={id} className="block text-sm font-medium mb-1">
      {placeholder}
    </label>
    <input
      id={id}
      name={name}
      type={showPassword ? 'text' : 'password'}
      autoComplete={autoComplete}
      required
      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm pr-10"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
    <button
      type="button"
      tabIndex={-1}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-lime-500 focus:outline-none"
      style={{ background: 'none', border: 'none' }}
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
    >
      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
    </button>
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

  useEffect(() => {
    const checkTokenAndPinStatus = async () => {
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

      const response = await axios.post(`http://localhost:8000/api/users/${endpoint}/`, data, {
        headers: { 'Content-Type': 'application/json' }
      });

      if ((response.data.access || response.data.token) && response.data.user) {
        setAuthData(response.data);
        const token = response.data.access || response.data.token;
        const pinResponse = await axios.get('http://localhost:8000/api/users/me/', {
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
      <Header />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold">
              {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>
            <p className="mt-2 text-center text-sm">
              Или{' '}
              <button
                onClick={handleToggleMode}
                className="font-medium text-lime-600 hover:text-lime-500 bg-transparent border-none cursor-pointer"
              >
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
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
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
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
