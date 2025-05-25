import React, { useEffect, useState } from 'react'
import SideMenu from '../../components/animation/menu';
import LogoutButton from './LogoutButton';
import { getToken, getUserData } from '../../utils/authUtils';
import AccountThemeToggle from './AccountThemeToggle';
import Joyride, { STATUS } from 'react-joyride';
import axios from 'axios';

const AccountHeader = () => {
  const [user, setUser] = useState(null);
  const [runTour, setRunTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();
        if (!token) {
          // Optionally set user from localStorage if token is missing for a moment
          setUser(getUserData());
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя в AccountHeader:', error);
        // Optionally set user from localStorage on error
        setUser(getUserData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  const startTour = () => {
    setRunTour(true);
  };

  return (
    <div className='relative'>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTour}
        steps={[
          {
            target: '.logo-link',
            content: 'Нажмите на логотип, чтобы вернуться на предыдущую страницу',
            placement: 'bottom'
          },
          {
            target: '.user-info',
            content: 'Здесь отображается ваше имя. Нажмите на него для перехода на страницу профиля',
            placement: 'bottom'
          },
          {
            target: '.theme-toggle',
            content: 'Нажмите на эту кнопку, чтобы переключить тему приложения между светлой и темной',
            placement: 'bottom'
          }
        ]}
        styles={{
          options: {
            zIndex: 10000,
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
      <div className="flex items-center justify-between py-4 px-20 card">
        <div className='flex items-center gap-x-5'>
            <div className='user-info flex gap-x-5 items-center'>
              {user?.profile_photo_url ? (
                <img 
                  src={`http://localhost:8000${user.profile_photo_url}`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                  👤
                </div>
              )}

              <p className="text text-primary">{user ? user.username : 'Имя пользователя'}</p>
            </div>
        </div>
        <button className="zag text-3xl hover:text-primary transition-colors duration-200" onClick={startTour}>ТАЙМБУК</button>
        <div className="flex items-center gap-x-4">
          <AccountThemeToggle className="theme-toggle" />
          <LogoutButton />
          <SideMenu />
        </div>
      </div>
    </div>
  );
}

export default AccountHeader