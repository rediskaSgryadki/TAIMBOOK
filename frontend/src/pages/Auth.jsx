import React, { useState, useEffect } from 'react'; // Импортируем React и хуки useState, useEffect
import { useNavigate } from 'react-router-dom'; // Импортируем хук для навигации между страницами
import axios from 'axios'; // Импортируем библиотеку для HTTP-запросов
import { getToken, redirectToAuth, setAuthData, clearAuthData } from '../utils/authUtils'; // Импортируем утилиты для аутентификации
import PinForm from '../components/account/pin/PinForm'; // Импортируем компонент формы ввода PIN-кода
import Header from '../components/Header'; // Импортируем компонент шапки

const Auth = () => { // Основной компонент аутентификации
  const [isLogin, setIsLogin] = useState(true); // Состояние: режим входа или регистрации
  const [email, setEmail] = useState(''); // Состояние: email пользователя
  const [password, setPassword] = useState(''); // Состояние: пароль пользователя
  const [confirmPassword, setConfirmPassword] = useState(''); // Состояние: подтверждение пароля (для регистрации)
  const [username, setUsername] = useState(''); // Состояние: имя пользователя (для регистрации)
  const [showPassword, setShowPassword] = useState(false); // Состояние: показывать или скрывать пароль
  const [error, setError] = useState(''); // Состояние: сообщение об ошибке
  const [loading, setLoading] = useState(false); // Состояние: индикатор загрузки
  const [showPinForm, setShowPinForm] = useState(false); // Состояние: показывать ли форму ввода PIN-кода
  const navigate = useNavigate(); // Получаем функцию для навигации

  useEffect(() => { // Эффект при монтировании компонента
    const checkTokenAndPinStatus = async () => {
      const token = getToken(); // Получаем токен (теперь только из sessionStorage)

      // Если токен есть, пытаемся проверить его валидность и наличие PIN
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/users/me/', {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Если запрос успешен, просто перенаправляем, не обновляя хранилище здесь
          if (response.data.has_pin) {
            setShowPinForm(true);
          } else {
            navigate('/account/home');
          }
        } catch (err) {
          console.error('Ошибка проверки токена/PIN:', err);
          // Если токен невалиден (ошибка 401) или другие ошибки, очищаем данные
          clearAuthData(); // Очистит sessionStorage и localStorage (для refresh)
          // Остаемся на странице Auth
        }
      }
      // Если токена нет, остаемся на странице Auth для ввода учетных данных
    };
    checkTokenAndPinStatus();
  }, [navigate]);

  const handleToggleMode = () => { // Функция переключения между режимами входа и регистрации
    setIsLogin(!isLogin); // Меняем режим
    setError(''); // Сбрасываем ошибку
    setUsername(''); // Сбрасываем имя пользователя
    setEmail(''); // Сбрасываем email
    setPassword(''); // Сбрасываем пароль
    setConfirmPassword(''); // Сбрасываем подтверждение пароля
  };

  const handleSubmit = async (e) => { // Обработчик отправки формы
    e.preventDefault(); // Отменяем стандартное поведение формы
    setError(''); // Сбрасываем ошибку
    setLoading(true); // Включаем индикатор загрузки

    if (!isLogin) { // Если режим регистрации
      if (password !== confirmPassword) { // Проверяем совпадение паролей
        setError('Пароли не совпадают'); // Устанавливаем ошибку
        setLoading(false); // Отключаем загрузку
        return; // Прерываем выполнение функции
      }
    }

    try {
      const endpoint = isLogin ? 'login' : 'register'; // Выбираем эндпоинт API
      const data = isLogin 
        ? { email, password } // Данные для входа
        : { username, email, password, password2: confirmPassword }; // Данные для регистрации
      
      console.log('Sending auth request to:', `http://localhost:8000/api/users/${endpoint}/`); // Логируем адрес запроса
      const response = await axios.post(`http://localhost:8000/api/users/${endpoint}/`, data, { // Отправляем POST-запрос
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Auth response:', response.data); // Логируем ответ
      
      // Проверяем наличие токена и данных пользователя в ответе
      if ((response.data.access || response.data.token) && response.data.user) {
        // Сохраняем данные аутентификации (теперь всегда в sessionStorage)
        setAuthData(response.data); // Удаляем аргумент rememberMe
        
        const token = response.data.access || response.data.token; // Получаем токен
        console.log('Using token for /me request:', token); // Логируем используемый токен
        
        // Проверяем наличие PIN-кода у пользователя
        const pinResponse = await axios.get('http://localhost:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('PIN response:', pinResponse.data); // Логируем ответ
        if (pinResponse.data.has_pin) { // Если PIN-код есть
          setShowPinForm(true); // Показываем форму PIN-кода
        } else {
          navigate('/account/home'); // Иначе переходим на домашнюю страницу аккаунта
        }
      } else {
        console.error('Missing token data in response:', response.data); // Логируем отсутствие токена
        setError('Ошибка: Данные авторизации отсутствуют или неполные'); // Сообщение об ошибке
      }
    } catch (err) { // Обработка ошибок запроса
      console.error('Auth error:', err); // Логируем ошибку
      if (err.response?.status === 401 && isLogin) { // Если ошибка авторизации при входе
        setError('Неверный email или пароль. Пожалуйста, попробуйте снова.'); // Сообщение об ошибке
        clearAuthData(); // Очищаем данные аутентификации
      } else {
        setError(err.response?.data?.error || 'Произошла ошибка'); // Сообщение для других ошибок
      }
    } finally {
      setLoading(false); // Отключаем индикатор загрузки в любом случае
    }
  };

  const handlePinSuccess = () => { // Функция при успешном вводе PIN-кода
    navigate('/account/home'); // Перенаправляем на домашнюю страницу аккаунта
  };

  if (showPinForm) { // Если нужно показать форму PIN-кода
    return <PinForm onSuccess={handlePinSuccess} />; // Показываем компонент формы PIN-кода
  }

  return (
    <>
    <Header/> {/* Компонент шапки */}
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'} {/* Заголовок формы */}
          </h2>
          <p className="mt-2 text-center text-sm">
            Или{' '}
            <button onClick={handleToggleMode} className="font-medium text-lime-600 hover:text-lime-500 bg-transparent border-none cursor-pointer">
              {isLogin ? 'зарегистрируйтесь' : 'войдите'} {/* Кнопка переключения режима */}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}> {/* Форма авторизации/регистрации */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              <span className="block sm:inline">{error}</span> {/* Сообщение об ошибке */}
            </div>
          )}
          <input type="hidden" name="remember" defaultValue="true" /> {/* Скрытое поле для совместимости */}
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
                {showPassword ? 'Скрыть' : 'Показать'} {/* Кнопка показать/скрыть пароль */}
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'} {/* Текст кнопки */}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Auth; // Экспортируем компонент по умолчанию
