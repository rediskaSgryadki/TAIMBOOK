import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountHeader from '../../components/account/AccountHeader';
import { getToken, clearAuthData } from '../../utils/authUtils';
import LastEntryCard from '../../components/account/LastEntryCard';
import axios from 'axios';
import CalendarCard from '../../components/account/CalendarCard';
import EmotionCard from '../../components/emotion/EmotionCard';
import PinOffer from '../../components/account/pin/PinOffer';
import AccountMenu from '../../components/account/AccountMenu';
import Modal from '../../components/ui/Modal';
import FeedbackForm from '../../components/FeedbackForm';
import { useMovingBg } from '../../utils/movingBg';
import { Helmet } from 'react-helmet-async';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL;

const AccountHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [lastEntry, setLastEntry] = useState(null);
  const [error, setError] = useState(null);
  const [showPinOffer, setShowPinOffer] = useState(false);
  const { user, updateUser } = useUser();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const { ref: welcomeRef, mousePosition, handleMouseMove, handleMouseLeave } = useMovingBg();

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
      if (!token) {
        console.log('No token found for PIN check.');
        return false;
      }
      // Direct call to user details to check PIN status
      const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {
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
          pin_set: user.pin_set,
          dont_remind_pin: user.dont_remind_pin
        });
        
        // Only show PinOffer if user has no PIN and has NOT opted to be reminded later
        if (!user.has_pin && !user.dont_remind_pin) {
          console.log('User has no PIN and has not opted out, showing banner');
          setShowPinOffer(true);
        } else {
          console.log('User has PIN or opted out, not showing banner');
          setShowPinOffer(false);
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

        const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {}, {
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
          pin_set: userData.pin_set,
          dont_remind_pin: userData.dont_remind_pin
        });
        
        updateUser(userData);
        setLoading(false);
        
        // Only show PinOffer if user has no PIN and has NOT opted to be reminded later
        if (!userData.has_pin && !userData.dont_remind_pin) {
          console.log('User has no PIN and has not opted out, showing banner');
          setShowPinOffer(true);
        } else {
          console.log('User has PIN or opted out, not showing banner');
          setShowPinOffer(false);
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

      const response = await axios.get(`${API_BASE_URL}/api/entries/last/`, {},
        { headers: {
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
    updateUser();
  };

  const handleOpenFeedbackModal = () => {
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
  };

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

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка...'
            : error
              ? 'Ошибка'
              : user
                ? user.username
                : 'Имя пользователя'}
        </title>
      </Helmet>

    <div className="h-screen flex flex-col">
      <AccountHeader />
      <div className="flex flex-grow w-full">
        <AccountMenu/>
        <section className='flex flex-col flex-grow justify-center items-center gap-y-10 py-10 px-7 lg:px-20 shadow-[inset_0px_0px_12px_-5px_rgba(0,_0,_0,_0.8)]'>
          <div 
            ref={welcomeRef}
            className='card w-full py-10 2xl:py-20 rounded-2xl lg:rounded-full text-center welcome-section account-welcome-bg'
            style={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h2 className="zag text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold mb-2 sm:mb-4">Добро пожаловать в ваш дневник</h2>
            <div className="space-y-2 sm:space-y-4">
              <button
                onClick={handleNewEntry}
                className="px-4 sm:px-5 py-2 sm:py-3 bg-[var(--color-green)] text text-base sm:text-lg md:text-xl rounded-full new-entry-button"
              >
                Новая запись
              </button>
              <button
                onClick={handleOpenFeedbackModal}
                className="px-4 sm:px-5 py-2 sm:py-3 bg-blue-500 text-white text-base sm:text-lg md:text-xl rounded-full mt-2 hover:bg-blue-600 transition-colors"
              >
                Обратная связь
              </button>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {lastEntry ? (
              <LastEntryCard 
                entry={lastEntry} 
                onMore={() => handleMoreClick(`/account/entry/${lastEntry.id}`)}
                className="last-entry-card bg-block"
              />
            ) : (
              <div className='bg-block h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-4 sm:p-10 last-entry-card'>
                <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg">У вас пока нет записей</p>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CalendarCard className="calendar-card" />
            </div>
            <div className="flex-1 min-w-0">
              <EmotionCard />
            </div>
          </div>

          {showPinOffer && (
            <PinOffer onClose={handleDontRemind} onDontRemind={handleDontRemind} updateUser={updateUser} />
          )}

          {showFeedbackModal && (
            <Modal onClose={handleCloseFeedbackModal}>
              <FeedbackForm onClose={handleCloseFeedbackModal} isAuthenticated={!!user} />
            </Modal>
          )}
        </section>
      </div>
    </div>
    </>
    
  );
};

export default AccountHome;