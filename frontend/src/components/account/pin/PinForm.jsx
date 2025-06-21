import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../../../utils/authUtils';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PinForm = ({ onSuccess, updateUser, isSettingPin }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e, idx, setter, refs) => {
    const { value } = e.target;
    if (value && !/^[0-9]$/.test(value)) return;
    setter(prevPin => {
      const newPin = [...prevPin];
      newPin[idx] = value;
      if (value && idx < 3) {
        refs.current[idx + 1]?.focus();
      }
      return newPin;
    });
  };

  const handleKeyDown = (e, idx, setter, refs) => {
    if (e.key === 'Backspace' && !setter[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && idx < 3) {
      refs.current[idx + 1]?.focus();
    }
  };

  const fetchAndUpdateUser = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        updateUser(response.data); // Update user in context
      }
    } catch (err) {
      console.error('Error fetching user data after PIN operation:', err);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const token = getToken();
    if (!token) {
      setError('Сессия истекла. Пожалуйста, войдите снова.');
      setTimeout(() => { navigate('/auth'); }, 2000);
      setLoading(false);
      return;
    }

    if (isSettingPin) {
      const newPinString = pin.join('');

      if (newPinString.length !== 4) {
        setError('Введите все 4 цифры PIN-кода');
        setLoading(false);
        return;
      }

      try {
        const payload = { pin_code: newPinString, confirm_pin: newPinString };

        const response = await axios.post(`${API_BASE_URL}/api/users/set-pin/`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.message || response.status === 200) {
          const currentUserData = JSON.parse(sessionStorage.getItem('userData'));
          if (currentUserData) {
            currentUserData.has_pin = true;
            sessionStorage.setItem('userData', JSON.stringify(currentUserData));
            updateUser(currentUserData);
          }
          onSuccess();
        }
      } catch (err) {
        console.error('Error setting pin:', err.response?.status, err.response?.data);
        setError(err.response?.data?.pin_code || err.response?.data?.error || 'Не удалось установить PIN-код');
      } finally {
        setLoading(false);
      }
    } else { // Verifying existing PIN
      const pinString = pin.join('');
      if (pinString.length !== 4) {
        setError('Введите все 4 цифры PIN-кода');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.post(`${API_BASE_URL}/api/users/verify-pin/`, { pin_code: pinString }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data.status === 'success' || response.status === 200) {
          await fetchAndUpdateUser(token);
          onSuccess();
        }
      } catch (err) {
        console.error('Error in verify-pin request:', err.response?.status, err.response?.data);
        if (err.response?.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова.');
          setTimeout(() => { navigate('/auth'); }, 2000);
        } else {
          setError(err.response?.data?.error || 'Неверный PIN-код');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 px-7 lg:px-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]" style={{ zIndex: 2147483647 }}>
      <div className="w-full lg:w-3/4 card p-10 shadow-xl rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-x-10">
        <img src="/img/Home/security, accounts _ lock, padlock, privacy, policy, shield, confirm, approve, complete.webp" className='block lg:hidden' alt="" />
        <div className="flex flex-col items-center justify-center gap-y-10">
          <div className="flex flex-col items-center gap-y-2">
            <h3 className="zag tracking-wider text-3xl text-center">{isSettingPin ? 'Создайте PIN-код' : 'Введите PIN-код'}</h3>
            <p className="text text-xl text-center">{isSettingPin ? 'Для обеспечения безопасности вашего дневника, создайте PIN-код' : 'Введите ваш PIN-код для доступа к дневнику'}</p>
          </div>

          {isSettingPin && (
            <div className="flex flex-col gap-y-4 w-full items-center">
              <p className="text-neutral-500 text-lg">Новый PIN-код</p>
              <div className="flex justify-center gap-5 lg:gap-10 my-2">
                {pin.map((digit, idx) => (
                  <input
                    key={`new-pin-${idx}`}
                    ref={el => inputRefs.current[idx] = el}
                    type={isSettingPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(e, idx, setPin, inputRefs)}
                    onKeyDown={e => handleKeyDown(e, idx, setPin, inputRefs)}
                    className="w-14 h-14 lg:w-20 lg:h-20 text-center text-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>
          )} 

          {!isSettingPin && (
            <div className="flex justify-center gap-5 lg:gap-10 my-6">
              {pin.map((digit, idx) => (
                <input
                  key={`verify-pin-${idx}`}
                  ref={el => inputRefs.current[idx] = el}
                  type={isSettingPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(e, idx, setPin, inputRefs)}
                  onKeyDown={e => handleKeyDown(e, idx, setPin, inputRefs)}
                  className="w-14 h-14 lg:w-20 lg:h-20 text-center text-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  autoComplete="off"
                />
              ))}
            </div>
          )}
          {error && (
            <div className="bg-red-700 px-4 py-2 rounded text-sm mt-2 shadow-md text-white">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
              disabled={loading}
            >
              {loading ? 'Проверка...' : (isSettingPin ? 'Создать PIN-код' : 'Подтвердить')}
            </button>
          </div>
        </div>
        <div className='hidden lg:flex items-center'>
          <img src="/img/Home/security, accounts _ lock, padlock, privacy, policy, shield, confirm, approve, complete.webp" className='hidden lg:block' alt="" />
        </div>
      </div>
    </div>
  );
};

export default PinForm;
