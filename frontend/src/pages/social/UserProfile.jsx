import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AccountHeader from '../../components/account/AccountHeader'
import AccountMenu from '../../components/account/AccountMenu'
import { useMovingBg } from '../../utils/movingBg'
import UserPosts from '../../components/social/UserPosts'
import { Helmet } from 'react-helmet-async'
import LastEntryCard from '../../components/account/LastEntryCard'

const API_BASE_URL = process.env.REACT_APP_API_URL;

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [publicEntries, setPublicEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('date_desc');
  const [sortOpen, setSortOpen] = useState(false);
  const { ref: welcomeRef, mousePosition, handleMouseMove, handleMouseLeave } = useMovingBg();
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/by_username/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username })
        });
        if (!response.ok) throw new Error('Ошибка загрузки пользователя');
        const userData = await response.json();
        setUser(userData);
        // Теперь загрузим записи
        const entriesRes = await fetch(`${API_BASE_URL}/api/entries/public_by_user/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userData.id })
        });
        if (!entriesRes.ok) throw new Error('Ошибка загрузки записей');
        setPublicEntries(await entriesRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

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

  // Разделяем записи на публичные и непубличные
  const publicPosts = publicEntries.filter(entry => entry.is_public);
  const privatePosts = publicEntries.filter(entry => !entry.is_public);

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка профиля...'
            : error
              ? 'Ошибка загрузки'
              : user
                ? `${user.username} - профиль`
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
              {user?.profile_photo_url ? (
                <img 
                  src={`${API_BASE_URL}${user.profile_photo_url}`} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
            </div>
            <p className='text-center text-2xl zag mt-4'>{user ? user.username : 'Имя пользователя'}</p>
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

          <div className='flex-1 min-w-0'>
            {loading ? (
              <p className="text-center text-gray-500">Загрузка публичных записей...</p>
            ) : error ? (
              <p className="text-center text-red-500">Ошибка: {error}</p>
            ) : publicPosts.length + privatePosts.length === 0 ? (
              <p className="text-center text-gray-500">Нет записей</p>
            ) : (
              <div className="flex w-full md:w-3/4 2xl:w-1/2 mx-auto flex-col gap-10">
                {/* Публичные записи */}
                {publicPosts.map((entry) => (
                  <UserPosts key={entry.id} post={entry} />
                ))}
                {/* Непубличные записи */}
                {privatePosts.map((entry) => (
                  <LastEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
      </section>
    </>
  )
}

export default UserProfile