// Утилиты для аутентификации

/**
 * Сохраняет данные аутентификации пользователя в localStorage
 * @param {Object} data - Содержит access и refresh токены, а также информацию о пользователе
 */
export const setAuthData = (data) => { // Экспортируемая функция для сохранения данных аутентификации
  if (data.access) { // Если есть поле access (access token)
    localStorage.setItem('token', data.access); // Сохраняем access token под ключом 'token'
    localStorage.setItem('accessToken', data.access); // Сохраняем access token под старым ключом для совместимости
  } else if (data.token) { // Если есть поле token (например, так возвращает backend)
    localStorage.setItem('token', data.token); // Сохраняем token под ключом 'token'
    localStorage.setItem('accessToken', data.token); // Сохраняем token под старым ключом для совместимости
  }
  
  if (data.refresh) { // Если есть поле refresh (refresh token)
    localStorage.setItem('refreshToken', data.refresh); // Сохраняем refresh token
  }
  
  if (data.user) { // Если есть информация о пользователе
    localStorage.setItem('userData', JSON.stringify(data.user)); // Сохраняем данные пользователя в виде строки JSON
  }
};

/**
 * Получить access токен из localStorage
 * @returns {string|null} Access токен или null, если не найден
 */
export const getToken = () => { // Экспортируемая функция для получения access token
  let token = localStorage.getItem('token'); // Пытаемся получить токен по основному ключу
  if (!token) { // Если не найден
    token = localStorage.getItem('accessToken'); // Пробуем получить по старому ключу
  }
  return token; // Возвращаем токен или null
};

/**
 * Получить refresh токен из localStorage
 * @returns {string|null} Refresh токен или null, если не найден
 */
export const getRefreshToken = () => { // Экспортируемая функция для получения refresh token
  return localStorage.getItem('refreshToken'); // Возвращаем refresh token или null
};

/**
 * Получить сохранённые данные пользователя из localStorage
 * @returns {Object|null} Объект с данными пользователя или null, если не найден
 */
export const getUserData = () => { // Экспортируемая функция для получения данных пользователя
  const userData = localStorage.getItem('userData'); // Получаем строку с данными пользователя
  return userData ? JSON.parse(userData) : null; // Если есть строка - парсим JSON, иначе возвращаем null
};

/**
 * Удалить все данные аутентификации из localStorage и sessionStorage
 */
export const clearAuthData = () => { // Экспортируемая функция для очистки данных аутентификации
  // Очистить localStorage
  localStorage.removeItem('token'); // Удаляем access token
  localStorage.removeItem('refreshToken'); // Удаляем refresh token
  localStorage.removeItem('userData'); // Удаляем данные пользователя
  localStorage.removeItem('accessToken'); // Удаляем старый ключ access token для совместимости

  // Очистить sessionStorage
  sessionStorage.removeItem('token'); // Удаляем access token из sessionStorage
  sessionStorage.removeItem('refreshToken'); // Удаляем refresh token из sessionStorage
  sessionStorage.removeItem('userData'); // Удаляем данные пользователя из sessionStorage
  sessionStorage.removeItem('accessToken'); // Удаляем старый ключ access token из sessionStorage
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
        const response = await fetch('http://localhost:8000/api/users/token/refresh/', {
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
        localStorage.setItem('token', data.access); // Сохраняем под основным ключом
        localStorage.setItem('accessToken', data.access); // Сохраняем под старым ключом для совместимости

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
