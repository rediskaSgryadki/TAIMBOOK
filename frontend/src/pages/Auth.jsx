import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { getToken, setAuthData, clearAuthData } from '../utils/authUtils';
import PinForm from '../components/account/pin/PinForm';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import { Helmet } from 'react-helmet-async';

// Компонент для ввода пароля с возможностью показать/скрыть
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

// Кнопка Яндекс OAuth через официальный виджет
// const YandexAuthButton = ({ onAuthSuccess }) => {
//   const buttonContainerRef = useRef(null);

//   useEffect(() => {
//     if (window.YaAuthSuggest && buttonContainerRef.current) {
//       window.YaAuthSuggest.init(
//         {
//           client_id: "4a79ad9de3c74adfadd5d775c2f9bbd6",
//           response_type: "token",
//           redirect_uri: "https://taimbook.ru/auth"
//         },
//         "https://taimbook.ru",
//         {
//           view: "button",
//           parentId: buttonContainerRef.current.id,
//           buttonSize: 'xxl',
//           buttonView: 'icon',
//           buttonTheme: 'light',
//           buttonBorderRadius: "22",
//           buttonIcon: 'ya',
//         }
//       )
//       .then(({ handler }) => handler())
//       .then(data => {
//         if (data && data.access_token && onAuthSuccess) {
//           onAuthSuccess(data.access_token);
//         }
//       })
//       .catch(error => console.log('Обработка ошибки', error));
//     }
//   }, [onAuthSuccess]);

//   return <div id="yandex-auth-button" ref={buttonContainerRef}></div>;
// };

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
  const { updateUser } = useUser();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Извлечение access_token из URL после редиректа с Яндекса
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    if (accessToken) {
      fetch('https://login.yandex.ru/info?format=json', {
        headers: { Authorization: `OAuth ${accessToken}` }
      })
        .then(res => res.json())
        .then(data => {
          setEmail(data.default_email || '');
          setUsername(data.login || '');
        })
        .catch(() => {
          setError('Не удалось получить данные пользователя из Яндекса');
        });
      // Очищаем hash из URL, чтобы не повторять запрос
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Обработка токена из виджета Яндекса
  const handleYandexAuth = (accessToken) => {
    fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        setEmail(data.default_email || '');
        setUsername(data.login || '');
      })
      .catch(() => {
        setError('Не удалось получить данные пользователя из Яндекса');
      });
  };

  useEffect(() => {
    const checkTokenAndPinStatus = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {
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
  }, [navigate, API_BASE_URL]);

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

      const response = await axios.post(`${API_BASE_URL}/api/users/${endpoint}/`, data, {
        headers: { 'Content-Type': 'application/json' }
      });

      if ((response.data.access || response.data.token) && response.data.user) {
        setAuthData(response.data);
        const token = response.data.access || response.data.token;
        const pinResponse = await axios.get(`${API_BASE_URL}/api/users/me/`, {
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
      let errorMessage = 'Произошла ошибка. Пожалуйста, попробуйте позже.'; // Default error message

      if (err.response) {
        // Для отладки — посмотреть структуру ошибки
        alert("Ошибка от сервера: " + JSON.stringify(err.response.data));

        if (err.response.status === 400) {
          if (err.response.data) {
            if (err.response.data.email) {
              errorMessage = 'На данный адрес электронной почты уже зарегистрирован аккаунт.';
              setError(errorMessage);
              return; // Exit here to prevent other error messages from overwriting
            } else if (err.response.data.username) {
              errorMessage = 'Пользователь с таким именем пользователя уже существует.';
              setError(errorMessage);
              return; // Exit here to prevent other error messages from overwriting
            } else if (err.response.data.password) {
              if (Array.isArray(err.response.data.password) && err.response.data.password.some(msg => msg.includes('слишком легкий') || msg.includes('too common') || msg.includes('too short'))) {
                errorMessage = 'Пароль слишком легкий. Пожалуйста, выберите более сложный пароль.';
              } else {
                errorMessage = 'Неверный email или пароль.';
              }
            } else if (err.response.data.detail) {
                errorMessage = err.response.data.detail; // Handle top-level 'detail' errors
            } else if (Array.isArray(err.response.data.non_field_errors) && err.response.data.non_field_errors.length > 0) {
                errorMessage = err.response.data.non_field_errors.join(' '); // Handle non_field_errors array
            } else if (typeof err.response.data === 'object' && err.response.data !== null) {
                // If it's an object but not covered by specific keys, try to stringify its values
                const objectErrorMessages = Object.values(err.response.data).map(value => {
                    if (Array.isArray(value)) {
                        return value.join(' ');
                    } else if (typeof value === 'string') {
                        return value;
                    }
                    return '';
                }).filter(Boolean);

                if (objectErrorMessages.length > 0) {
                    errorMessage = objectErrorMessages.join(' ');
                } else {
                    errorMessage = 'Ошибка запроса.';
                }
            } else if (typeof err.response.data === 'string') {
                errorMessage = err.response.data; // If the data is just a string, use it
            } else {
                errorMessage = 'Ошибка запроса.';
            }
          } else {
            errorMessage = 'Ошибка запроса.'; // No data in 400 response
          }
        } else if (err.response.status === 401 && isLogin) {
          errorMessage = 'Неверный email или пароль. Пожалуйста, попробуйте снова.';
          clearAuthData();
        } else {
          // Other HTTP errors with response
          errorMessage = err.response.data?.detail || err.response.statusText || 'Произошла ошибка. Пожалуйста, попробуйте позже.';
        }
      } else if (err.message) {
        // Network errors or other non-HTTP errors
        errorMessage = err.message;
      }
      setError(String(errorMessage)); // Ensure errorMessage is always a string
    } finally {
      setLoading(false);
    }
  };

  const handlePinSuccess = () => {
    setShowPinForm(false);
    updateUser();
    navigate('/account/home');
  };

  if (showPinForm) {
    return <PinForm onSuccess={handlePinSuccess} updateUser={updateUser} isSettingPin={false} />;
  }

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'ТАЙМБУК - вход' : 'ТАЙМБУК - регистрация'}</title>
      </Helmet>
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
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="space-y-4">
              {!isLogin && (
                <div>
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
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
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
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              {!isLogin && (
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Подтвердите пароль"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Auth;
