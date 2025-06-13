// Утилиты для аутентификации

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Сохраняет данные аутентификации пользователя в sessionStorage.
 * Refresh токен сохраняется в localStorage.
 * @param {Object} data - Содержит access и refresh токены, а также информацию о пользователе
 */
export const setAuthData = (data) => { // Удаляем параметр rememberMe
  const accessToken = data.access || data.token; // Получаем access token из разных полей ответа
  if (accessToken) {
    sessionStorage.setItem('token', accessToken); // Всегда сохраняем access token в sessionStorage
    sessionStorage.setItem('accessToken', accessToken); // Сохраняем под старым ключом для совместимости
  }
  
  if (data.refresh) { 
    localStorage.setItem('refreshToken', data.refresh); // Refresh токен всегда в localStorage
  }
  
  if (data.user) { 
    sessionStorage.setItem('userData', JSON.stringify(data.user)); // Данные пользователя всегда в sessionStorage
  }
};

/**
 * Получить access токен из sessionStorage
 * @returns {string|null} Access токен или null, если не найден
 */
export const getToken = () => { // Проверяем только sessionStorage
  let token = sessionStorage.getItem('token');
  if (!token) { // Проверяем старый ключ для совместимости
    token = sessionStorage.getItem('accessToken');
  }
  console.log('getToken() result:', token ? 'Token found' : 'No token');
  return token; 
};

/**
 * Получить refresh токен из localStorage
 * @returns {string|null} Refresh токен или null, если не найден
 */
export const getRefreshToken = () => { 
  return localStorage.getItem('refreshToken'); // Refresh токен всегда из localStorage
};

/**
 * Получить сохранённые данные пользователя из sessionStorage
 * @returns {Object|null} Объект с данными пользователя или null, если не найден
 */
export const getUserData = () => { // Проверяем только sessionStorage
  const userData = sessionStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Удалить все данные аутентификации из localStorage и sessionStorage
 */
export const clearAuthData = () => { // Очищаем оба хранилища (на всякий случай)
  // Очистить localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('accessToken');

  // Очистить sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('userData');
  sessionStorage.removeItem('accessToken');
};

/**
 * Перенаправить на страницу аутентификации
 * @param {Object} navigate - Функция navigate из React Router (необязательно)
 */
export const redirectToAuth = (navigate = null) => { // Экспортируемая функция для редиректа на страницу аутентификации
  clearAuthData(); // Очищаем все данные аутентификации перед переходом
  if (navigate) { // Если передана функция navigate (используется в React Router)
    navigate('/auth'); // Перенаправляем с помощью navigate
  } else { // Если navigate не передан
    window.location.href = '/auth'; // Перенаправляем через стандартный переход по ссылке
  }
};

/**
 * Проверить, действителен ли токен
 * @returns {boolean} True, если действительный токен существует, иначе false
 */
export const checkTokenValidity = () => { // Экспортируемая функция для проверки валидности токена
  const token = getToken(); // Получаем токен

  if (!token) return false; // Если токена нет - возвращаем false

  try { // Пробуем проверить токен
    const tokenParts = token.split('.'); // Разделяем токен на части (JWT состоит из 3 частей)
    if (tokenParts.length !== 3) return false; // Если частей не 3 - токен некорректен

    const payload = JSON.parse(atob(tokenParts[1])); // Декодируем payload (вторая часть токена)
    const expiryTime = payload.exp * 1000; // Получаем время истечения токена (переводим в миллисекунды)
    return Date.now() < expiryTime; // Проверяем, не истёк ли токен
  } catch (error) { // Если возникла ошибка при разборе токена
    console.error('Ошибка проверки токена:', error); // Логируем ошибку
    return false; // Возвращаем false, так как токен некорректен
  }
};

/**
 * Выполнить запрос с автоматическим обновлением токена при необходимости
 * @param {Function} requestFn - Функция для выполнения запроса
 * @param {Object} navigate - Функция navigate из React Router (необязательно)
 * @returns {Promise} Результат запроса
 */
export const executeRequestWithTokenRefresh = async (requestFn, navigate = null) => { // Экспортируемая асинхронная функция для выполнения запроса с автообновлением токена
  try { // Пробуем выполнить запрос
    console.log('Выполнение запроса с auth токеном:', getToken() ? 'Токен есть' : 'Токен не найден'); // Логируем наличие токена
    return await requestFn(); // Выполняем переданную функцию запроса
  } catch (error) { // Если возникла ошибка
    console.log('Ошибка в executeRequestWithTokenRefresh:', error); // Логируем ошибку

    // Проверяем, является ли ошибка ошибкой авторизации (401)
    const isUnauthorized = (error.response && error.response.status === 401) || 
                          (error.status === 401) ||
                          (error.message && error.message.includes('401'));

    if (isUnauthorized) { // Если ошибка связана с авторизацией
      console.log('Обнаружена ошибка авторизации, попытка обновить токен'); // Логируем попытку обновления токена
      const refreshToken = getRefreshToken(); // Получаем refresh token

      if (!refreshToken) { // Если refresh токена нет
        console.log('Refresh токен не найден, перенаправление на аутентификацию'); // Логируем отсутствие refresh токена
        redirectToAuth(navigate); // Перенаправляем на страницу аутентификации
        throw new Error('Срок действия аутентификации истёк. Пожалуйста, войдите снова.'); // Бросаем ошибку
      }

      try { // Пробуем обновить токен
        console.log('Обновление токена...'); // Логируем начало обновления
        // Отправляем запрос на обновление токена
        const response = await fetch(`${API_BASE_URL}/api/users/token/refresh/`, {
          method: 'POST', // Метод POST
          headers: { 'Content-Type': 'application/json' }, // Заголовок запроса
          body: JSON.stringify({ refresh: refreshToken }) // Тело запроса с refresh токеном
        });

        if (!response.ok) { // Если ответ не OK
          console.log('Не удалось обновить токен'); // Логируем неудачу
          throw new Error('Не удалось обновить токен'); // Бросаем ошибку
        }

        const data = await response.json(); // Получаем данные из ответа
        console.log('Токен успешно обновлён'); // Логируем успех

        // Сохраняем новый access token
        sessionStorage.setItem('token', data.access); // Сохраняем под основным ключом
        sessionStorage.setItem('accessToken', data.access); // Сохраняем под старым ключом для совместимости

        // Повторяем исходный запрос с новым токеном
        console.log('Повтор запроса с новым токеном'); // Логируем повтор
        return await requestFn(); // Выполняем запрос снова
      } catch (refreshError) { // Если не удалось обновить токен
        console.log('Ошибка обновления токена:', refreshError); // Логируем ошибку
        redirectToAuth(navigate); // Перенаправляем на страницу аутентификации
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.'); // Бросаем ошибку
      }
    }

    throw error; // Если ошибка не связана с авторизацией - пробрасываем дальше
  }
};

export { API_BASE_URL };
