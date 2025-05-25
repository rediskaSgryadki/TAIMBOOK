import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../../../utils/authUtils';
import { useNavigate } from 'react-router-dom';

const PinForm = ({ onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
    inputRefs.current[0]?.focus();
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

  const handleSubmit = async () => {
    setError('');
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      setError('Введите все 4 цифры PIN-кода');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        return;
      }
      const response = await axios.post('http://localhost:8000/api/users/verify-pin/', { pin_code: pinString }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.status === 'success' || response.status === 200) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error in verify-pin request:', err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      } else {
        setError(err.response?.data?.error || 'Неверный PIN-код');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]" style={{ zIndex: 2147483647 }}>
      <div className="w-1/2 card p-10 shadow-xl rounded-3xl grid grid-cols-2 gap-x-10">
        <div className="flex flex-col items-center justify-between">
          <div className="flex flex-col items-center gap-y-2">
            <h3 className="zag tracking-wider text-3xl">Введите PIN-код</h3>
            <p className="text text-xl text-center">Введите ваш PIN-код для доступа к дневнику</p>
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
              onClick={handleSubmit}
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
              disabled={loading}
            >
              {loading ? 'Проверка...' : 'Подтвердить'}
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

export default PinForm;
