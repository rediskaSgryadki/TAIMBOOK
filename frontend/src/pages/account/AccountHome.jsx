import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountHeader from '../../components/account/AccountHeader';
import { getToken, clearAuthData } from '../../utils/authUtils';
import LastEntryCard from '../../components/account/LastEntryCard';
import axios from 'axios';
import CalendarCard from '../../components/account/CalendarCard';
import EmotionCard from '../../components/emotion/EmotionCard';
import Joyride, { STATUS } from 'react-joyride';
import PinOffer from '../../components/account/pin/PinOffer';

// Base API URL
const API_URL = 'http://localhost:8000';

// Импортируем все изображения из папки covers
const coverImages = [
  '/assets/covers/cover1.jpg',
  '/assets/covers/cover2.jpg',
  '/assets/covers/cover3.jpg',
  '/assets/covers/cover4.jpg',
  '/assets/covers/cover5.jpg',
];

const AccountHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [lastEntry, setLastEntry] = useState(null);
  const [error, setError] = useState(null);
  const [runTour, setRunTour] = useState(true);
  const [showPinOffer, setShowPinOffer] = useState(false);
  const { user, updateUser } = useUser();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  
  // Добавляем состояния для эффекта слежения за мышью
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const welcomeRef = useRef(null);
  const animationRef = useRef(null);

  // Debug function to check user data and pin_offer status
  const debugPinOffer = (userData) => {
    console.log('Debug PinOffer:', {
      userExists: !!userData,
      remindPin: userData?.remind_pin,
      pinCode: userData?.pin_code,
      hasPin: !!userData?.pin_code,
      currentShowState: showPinOffer
    });
  };

  // Check if the user has a PIN code in the database
  const checkUserPinCode = async (userId) => {
    if (!userId) return false;
    
    try {
      const token = getToken();
      // Direct call to user details to check PIN status
      const response = await axios.get(`${API_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Examine the entire response for debugging
      console.log('User details response:', response.data);
      
      // Check various fields that might indicate PIN status
      const userHasPin = (
        response.data?.has_pin === true || 
        !!response.data?.pin_code || 
        response.data?.pin_set === true
      );
      
      console.log('PIN check result:', {
        userId,
        hasPin: userHasPin,
        rawHasPin: response.data?.has_pin,
        rawPinCode: !!response.data?.pin_code,
        rawPinSet: response.data?.pin_set
      });
      
      setHasPin(userHasPin);
      return userHasPin;
    } catch (err) {
      console.error('Error checking PIN status:', err);
      // If we can't check, default to assuming no PIN for safety
      return false;
    }
  };

  // Fetch user data and check authentication
  useEffect(() => {
    console.log('AccountHome useEffect running', { authChecked, userExists: !!user });
    
    // Если проверка уже выполнена или пользователь уже загружен, то выходим
    if (authChecked || user) {
      if (user) {
        setLoading(false);
        
        // Detailed debugging of user object
        console.log('Current user data:', {
          id: user.id,
          username: user.username,
          has_pin: user.has_pin,
          pin_code: !!user.pin_code,
          pin_set: user.pin_set
        });
        
        // Try checking PIN directly from user object first
        const userHasPinInState = 
          user.has_pin === true || 
          !!user.pin_code || 
          user.pin_set === true;
        
        if (userHasPinInState) {
          console.log('User already has PIN according to state, not showing banner');
          setShowPinOffer(false);
        } else {
          // Double-check with the database
          console.log('Checking PIN status with API...');
          checkUserPinCode(user.id).then(hasPinResult => {
            console.log('API PIN check result:', hasPinResult);
            // Показываем баннер только если у пользователя НЕТ пин-кода
            setShowPinOffer(!hasPinResult);
          });
        }
        
        // Загружаем последнюю запись пользователя, если она еще не загружена
        if (!lastEntry && user.id) {
          fetchLastEntry(user.id);
        }
      }
      return;
    }

    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
      const token = getToken();
        
      if (!token) {
          console.log('No token found, redirecting to auth page');
          clearAuthData();
        navigate('/auth');
        return;
      }

        const response = await axios.get(`${API_URL}/api/users/me/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.data) {
          throw new Error('No user data received');
        }

        const userData = response.data;
        console.log('Token is valid, detailed user data:', {
          id: userData.id,
          username: userData.username,
          has_pin: userData.has_pin,
          pin_code: !!userData.pin_code,
          pin_set: userData.pin_set
        });
        
        updateUser(userData);
        setLoading(false);
        
        // Try checking PIN directly from the API response
        const userHasPinInResponse = 
          userData.has_pin === true || 
          !!userData.pin_code || 
          userData.pin_set === true;
        
        if (userHasPinInResponse) {
          console.log('User has PIN according to API response, not showing banner');
          setShowPinOffer(false);
        } else {
          // Double-check with a separate call if needed
          const hasPinResult = await checkUserPinCode(userData.id);
          console.log('Separate PIN check result:', hasPinResult);
          // Показываем баннер только если у пользователя НЕТ пин-кода
          setShowPinOffer(!hasPinResult);
        }
        
        // Загружаем последнюю запись пользователя
        fetchLastEntry(userData.id);
      } catch (err) {
        console.error('Error checking auth:', err);
        setError(err.message || 'Authentication error');
        clearAuthData();
        navigate('/auth');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [navigate, updateUser, user, authChecked, lastEntry]);

  const fetchLastEntry = useCallback(async (userId) => {
    if (!userId) {
      console.error('No user ID provided');
      return;
    }

    try {
      const token = getToken();
      
      if (!token) {
        console.log('No token found, redirecting to auth page');
        navigate('/auth');
        return;
      }

      const response = await axios.get(`${API_URL}/api/entries/last/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Проверяем наличие данных
      if (response.data) {
      setLastEntry(response.data);
      }
    } catch (err) {
      console.error('Error fetching last entry:', err);
      // Не устанавливаем ошибку, если это 404 (нет записей)
      if (err.response?.status !== 404) {
        setError(err.message);
      }
    }
  }, [navigate]);

  const handleNewEntry = () => {
    navigate('/account/new-entry');
  };

  const handleMoreClick = (path) => {
    navigate(path);
  };

  const handleDontRemind = () => {
    setShowPinOffer(false);
  };

  // Функция для обработки движения мыши
  const handleMouseMove = (e) => {
    if (!welcomeRef.current) return;
    
    const rect = welcomeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Пересчитываем положение для более свободного движения
    const xMove = (x / rect.width - 0.5) * 20; // Увеличиваем амплитуду
    const yMove = (y / rect.height - 0.5) * 20;
    
    setTargetPosition({ x: xMove, y: yMove });
  };
  
  const handleMouseLeave = () => {
    // Плавно возвращаем к центру при уходе мыши
    setTargetPosition({ x: 0, y: 0 });
  };
  
  // Плавное обновление позиции для более гладкого движения
  useEffect(() => {
    const updatePosition = () => {
      setMousePosition(prevPos => {
        // Быстрая интерполяция текущей позиции к целевой
        const newX = prevPos.x + (targetPosition.x - prevPos.x) * 0.2; // Увеличиваем скорость следования
        const newY = prevPos.y + (targetPosition.y - prevPos.y) * 0.2;
        
        return { x: newX, y: newY };
      });
      
      animationRef.current = requestAnimationFrame(updatePosition);
    };
    
    animationRef.current = requestAnimationFrame(updatePosition);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  const tourSteps = [
    {
      target: '.welcome-section',
      content: 'Добро пожаловать в ваш дневник! Здесь вы можете создавать новые записи.',
      placement: 'bottom'
    },
    {
      target: '.new-entry-button',
      content: 'Нажмите здесь, чтобы создать новую запись в вашем дневнике.',
      placement: 'bottom'
    },
    {
      target: '.last-entry-card',
      content: 'Здесь отображается ваша последняя запись. Вы можете посмотреть её подробнее.',
      placement: 'right'
    },
    {
      target: '.calendar-card',
      content: 'Календарь поможет вам отслеживать свои записи по датам.',
      placement: 'left'
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <AccountHeader />
      
      {showPinOffer && (
        <PinOffer
          onClose={() => setShowPinOffer(false)}
          onDontRemind={handleDontRemind}
        />
      )}
      
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTour}
        steps={tourSteps}
        showSkipButton
        styles={{
          options: {
            zIndex: 40,
            primaryColor: '#4ade80',
            backgroundColor: '#1e293b',
            textColor: '#f8fafc',
            borderRadius: '12px',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            width: '300px',
            height: 'auto'
          }
        }}
      />
      
      <div className="flex-1 overflow-aut">
        <section className='flex flex-col gap-y-10 px-20 mt-10 h-full'>
          <div 
            ref={welcomeRef}
            className='card w-full py-20 shadow-md rounded-full text-center welcome-section account-welcome-bg'
            style={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`,
              overflow: 'hidden'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h2 className="zag text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Добро пожаловать в ваш дневник</h2>
            <div className="space-y-4">
              <button
                onClick={handleNewEntry}
                className="px-5 py-2 bg-[var(--color-green)] text rounded-full new-entry-button"
              >
                Новая запись
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lastEntry ? (
              <LastEntryCard 
                entry={lastEntry} 
                onMore={() => handleMoreClick(`/account/entry/${lastEntry.id}`)}
                className="last-entry-card bg-block"
              />
            ) : (
              <div className='bg-block h-[55vh] rounded-3xl flex flex-col items-center justify-center p-10 last-entry-card'>
                <p className="text-neutral-500 dark:text-neutral-400">У вас пока нет записей</p>
              </div>
            )}
            <div className="flex-1">
              <CalendarCard className="calendar-card" />
            </div>
            <div className="flex-1">
              <EmotionCard />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountHome;