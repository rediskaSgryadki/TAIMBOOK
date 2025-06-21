import React, { useState, useEffect, useMemo } from 'react'
import { getUserData, clearAuthData, executeRequestWithTokenRefresh } from '../../../utils/authUtils'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AccountHeader from '../../../components/account/AccountHeader'
import AccountMenu from '../../../components/account/AccountMenu'
import { useMovingBg } from '../../../utils/movingBg'
import UserPosts from '../../../components/social/UserPosts'
import LastEntryCard from '../../../components/account/LastEntryCard'
import axios from 'axios'
import { getToken } from '../../../utils/authUtils'
import { Helmet } from 'react-helmet-async'
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
  const { username: profileUsername } = useParams(); // Get username from URL
  const navigate = useNavigate(); // Ensure navigate is available if needed for redirects
  const loggedInUserData = useMemo(() => getUserData(), []); // Теперь useMemo
  const [profileUser, setProfileUser] = useState(null); // This will be the user whose profile we are viewing
  const [publicEntries, setPublicEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('date_desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [imageError, setImageError] = useState(false); // Новый стейт для отслеживания ошибки загрузки изображения

  useEffect(() => {
    let isMounted = true; // Флаг для отслеживания монтирования компонента

    const fetchUserDataAndEntries = async () => {
      setLoading(true);
      setError(null);
      let userIdToFetch = null;

      try {
        const token = getToken();
        if (!token) {
          if (isMounted) {
            clearAuthData();
            navigate('/auth');
          }
          return;
        }

        // 1. Fetch user data
        let userResponse;
        if (profileUsername) {
          userResponse = await axios.get(`${API_BASE_URL}/api/users/by_username/?username=${profileUsername}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          userResponse = await axios.get(`${API_BASE_URL}/api/users/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        if (isMounted) {
          setProfileUser(userResponse.data);
        }
        userIdToFetch = userResponse.data.id;
        // Сбросить imageError при успешной загрузке данных пользователя
        if (isMounted) {
          setImageError(false);
        }

        // 2. Fetch entries
        let entriesData = [];
        if (userIdToFetch) {
          if (loggedInUserData && loggedInUserData.id === userIdToFetch) {
            // Владелец профиля — получаем все записи
            const entriesResponse = await fetch(`${API_BASE_URL}/api/entries/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            });
            if (!entriesResponse.ok) throw new Error('Ошибка загрузки записей');
            entriesData = await entriesResponse.json();
          } else {
            // Чужой профиль — только публичные
            const entriesResponse = await fetch(`${API_BASE_URL}/api/entries/public_by_user/?user_id=${userIdToFetch}`, {
              method: 'GET',
              headers: {'Content-Type': 'application/json'},
            });
            if (!entriesResponse.ok) throw new Error('Ошибка загрузки записей');
            entriesData = await entriesResponse.json();
          }
        }
        if (isMounted) {
          setPublicEntries(entriesData);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError(err.response?.data?.detail || 'Не удалось загрузить данные пользователя или записи.');
          if (err.response?.status === 404) {
            navigate('/social');
          } else if (err.response?.status === 401) {
            clearAuthData();
            navigate('/auth');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserDataAndEntries();

    return () => { // Функция очистки для сброса флага монтирования
      isMounted = false;
    };
  }, [profileUsername, navigate, loggedInUserData]); // Добавил loggedInUserData в зависимости

  const { ref: welcomeRef, mousePosition, handleMouseMove, handleMouseLeave } = useMovingBg();

  const sortOptions = [
    { value: 'date_desc', label: 'По дате (сначала новые)' },
    { value: 'date_asc', label: 'По дате (сначала старые)' },
    { value: 'title_asc', label: 'По алфавиту (заголовок)' },
    { value: 'content_asc', label: 'По алфавиту (контент)' },
    { value: 'words_desc', label: 'По количеству слов (убыв.)' },
    { value: 'words_asc', label: 'По количеству слов (возр.)' },
  ];

  const getSortedEntries = () => {
    const entries = [...publicEntries];
    switch (sortType) {
      case 'date_asc':
        return entries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'date_desc':
        return entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'title_asc':
        return entries.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ru'));
      case 'content_asc':
        return entries.sort((a, b) => (a.content || '').localeCompare(b.content || '', 'ru'));
      case 'words_desc':
        return entries.sort((a, b) => (b.content?.split(/\s+/).length || 0) - (a.content?.split(/\s+/).length || 0));
      case 'words_asc':
        return entries.sort((a, b) => (a.content?.split(/\s+/).length || 0) - (b.content?.split(/\s+/).length || 0));
      default:
        return entries;
    }
  };

  const getPopularEntries = () => [...publicEntries].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  const getLastEntry = () => [...publicEntries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const getLastFiveEntries = () => [...publicEntries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const getFilteredEntries = () => {
    switch (filterType) {
      case 'popular': return getPopularEntries();
      case 'last': return getLastEntry() ? [getLastEntry()] : [];
      case 'last5': return getLastFiveEntries();
      default: return getSortedEntries();
    }
  };

  if (!loggedInUserData) {
    clearAuthData();
    window.location.href = '/auth';
    return null;
  }

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка профиля...'
            : error
              ? 'Ошибка загрузки'
              : profileUser
                ? `${profileUser.username} - профиль`
                : 'Профиль пользователя'}
        </title>
      </Helmet>
    <AccountHeader/>
    <AccountMenu/>
    <section className='px-7 lg:px-20 space-y-10 py-10'>
      <div
        ref={welcomeRef}
        className="card w-full py-10 2xl:py-20 rounded-2xl lg:rounded-full text-center welcome-section profile-welcome-bg"
        style={{
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className='user-info flex gap-x-2 lg:gap-x-5 items-center'>
            {profileUser?.profile_photo_url && !imageError ? (
              <img 
                src={`${API_BASE_URL}${profileUser.profile_photo_url}`}
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                  👤
                </div>
              )}
          </div>
          <p className='text-center text-2xl zag mt-4'>{profileUser ? profileUser.username : 'Имя пользователя'}</p>
        </div>
      </div>
      <div className='px-0 lg:px-20 flex justify-between'>
          <div className='flex items-center space-x-10'>
              <Link to="/account/new-entry" className='text text-xs lg:text-base'>Новая запись</Link>
              <Link to="/account/settings" className='text text-xs lg:text-base'>Настройки</Link>
          </div>
          <div>
              <div className="relative inline-block text-left">
                <button
                  className='text text-xs lg:text-base px-3 py-2'
                  onClick={() => setSortOpen((v) => !v)}
                >
                  Сортировка
                  <svg className="inline ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {sortOptions.map(opt => (
                        <button
                          key={opt.value}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 ${sortType === opt.value ? 'font-bold text-green-600' : ''}`}
                          onClick={() => { setSortType(opt.value); setSortOpen(false); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          </div>
      </div>
      <div className='w-full flex justify-center gap-6 overflow-x-hidden'>
        <div className='flex-1 min-w-0'>
          {loading ? (
            <p className="text-center text-gray-500">Загрузка публичных записей...</p>
          ) : error ? (
            <p className="text-center text-red-500">Ошибка: {error}</p>
          ) : getFilteredEntries().length === 0 ? (
            <p className="text-center text-gray-500">У пользователя нет записей</p>
          ) : (
            <div className="flex w-full md:w-3/4 2xl:w-1/2 mx-auto flex-col gap-10">
              {getFilteredEntries().map(entry =>
                entry.is_public === true
                  ? <UserPosts key={entry.id} post={entry} />
                  : <LastEntryCard key={entry.id} entry={entry} onMore={() => navigate(`/account/entries/${entry.id}`)} />
              )}
            </div>
          )}
        </div>
      </div>

    </section>
    </>
  )
}

export default Profile