import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getToken } from '../../../utils/authUtils';
import PinForm from './PinForm';
import { useUser } from '../../../context/UserContext';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const PinOffer = ({ onClose, onDontRemind }) => {
  const [showPinFormInternal, setShowPinFormInternal] = useState(true);
  const [error, setError] = useState('');
  const { updateUser } = useUser();

  const handleDontRemind = async () => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/api/users/dont-remind-pin/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDontRemind();
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка');
    }
  };

  const handlePinFormSuccess = () => {
    onClose();
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
      55% {
        transform: scale(1.05);
        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }
  `;

  if (showPinFormInternal) {
    return <PinForm onSuccess={handlePinFormSuccess} updateUser={updateUser} isSettingPin={true} />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]" style={{ zIndex: 2147483647 }}>
      <div className="w-1/2 card p-10 shadow-xl rounded-3xl grid grid-cols-2 gap-x-10">
        <div className="flex flex-col items-center justify-between">
          <div className="flex flex-col items-center gap-y-2">
            <h3 className="zag tracking-wider text-3xl">Защитите ваш дневник!</h3>
            <p className="text text-xl text-center">Установите PIN-код для безопасного доступа к записям</p>
          </div>
          {error && (
            <div className="bg-red-700 px-4 py-2 rounded text-sm mt-2 shadow-md text-white">
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setShowPinFormInternal(true)}
              className="bg-white text-green-600 font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
              style={pulsateStyle}
            >
              Установить PIN
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
      <style>{keyframesStyle}</style>
    </div>
  );
};

export default PinOffer;