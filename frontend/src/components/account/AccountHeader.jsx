import React, { useEffect, useState } from 'react'
import { getToken, getUserData } from '../../utils/authUtils';
import AccountThemeToggle from './AccountThemeToggle';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AccountHeader = () => {
  const [user, setUser] = useState(null);
  const [runTour, setRunTour] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setUser(getUserData());
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data);
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя в AccountHeader:', error);
        setUser(getUserData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
  }, [user]);

  const startTour = () => {
    setRunTour(true);
  };

  return (
    <div className='relative'>
      <div className="flex items-center justify-between py-4 px-7 lg:px-20 card">
          <div className='user-info flex gap-x-2 lg:gap-x-5 items-center'>
            {user?.profile_photo_url ? (
              <img 
                src={`${API_BASE_URL}${user.profile_photo_url}`}
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                  👤
                </div>
              )}

            <p className="text">{user ? user.username : 'Имя пользователя'}</p>
          </div>
        <button className="zag text-xl hidden lg:block lg:text-3xl" onClick={() => navigate('/account/home')}>ТАЙМБУК</button>
        <div className="flex items-center gap-x-4">
          <AccountThemeToggle className="theme-toggle" />
        </div>
      </div>
    </div>
  );
}

export default AccountHeader