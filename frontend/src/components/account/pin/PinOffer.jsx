import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../../../utils/authUtils';

const PinOffer = ({ onClose, onDontRemind }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  const handleChange = (e, idx) => {
    const { value } = e.target;
    if (value && !/^[0-9]$/.test(value)) return;
    const newPin = [...pin];
    newPin[idx] = value;
    setPin(newPin);
    if (value && idx < 3) {
      inputRefs.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1].focus();
    }
    if (e.key === 'ArrowRight' && idx < 3) {
      inputRefs.current[idx + 1].focus();
    }
  };

  const handleSetPin = async () => {
    setError('');
    if (pin.some(d => d === '')) {
      setError('Введите все 4 цифры PIN-кода');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const pinString = pin.join('');
      const response = await axios.post('http://localhost:8000/api/users/set-pin/', {
        pin_code: pinString,
        confirm_pin: pinString
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success' || response.status === 200) {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleDontRemind = async () => {
    try {
      const token = getToken();
      await axios.post('http://localhost:8000/api/users/dont-remind-pin/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDontRemind();
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка');
    }
  };

  // CSS for the pulsating animation
  const pulsateStyle = {
    animation: 'pulsate 2s ease-in-out infinite'
  };

  // Keyframes animation for the pulsating effect
  const keyframesStyle = `
    @keyframes pulsate {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }
  `;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]" style={{ zIndex: 2147483647 }}>
      <div className="w-1/2 card p-10 shadow-xl rounded-3xl grid grid-cols-2 gap-x-10">
        <div className="flex flex-col items-center justify-between">
          <div className="flex flex-col items-center gap-y-2">
            <h3 className="zag tracking-wider text-3xl">Защитите ваш дневник!</h3>
            <p className="text text-xl text-center">Установите PIN-код для безопасного доступа к записям</p>
          </div>
          <div className="flex justify-center gap-10 my-6">
            {pin.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                className="w-20 h-20 text-center text-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                autoComplete="off"
              />
            ))}
          </div>
          {error && (
            <div className="bg-red-700 px-4 py-2 rounded text-sm mt-2 shadow-md text-white">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleSetPin}
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
              disabled={loading}
            >
              {loading ? 'Установка...' : 'Установить PIN'}
            </button>
            <button
              onClick={onClose}
              className="bg-white text-green-800 bg-opacity-60 px-6 py-3 rounded-md hover:bg-opacity-80 transition-all shadow-md"
            >
              Позже
            </button>
            <button
              onClick={handleDontRemind}
              className="bg-white text-green-800 bg-opacity-50 px-4 py-3 rounded-md hover:bg-opacity-70 transition-all flex items-center shadow-md"
            >
              <span>Не напоминать</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <img src="/img/Home/security, accounts _ lock, padlock, privacy, policy, shield, confirm, approve, complete.webp" alt="" />
        </div>
      </div>
    </div>
  );
};

export default PinOffer;