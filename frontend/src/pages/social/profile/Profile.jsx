import React, { useState, useEffect } from 'react'
import { getUserData, clearAuthData, executeRequestWithTokenRefresh } from '../../../utils/authUtils'
import { Link } from 'react-router-dom'
import AccountHeader from '../../../components/account/AccountHeader'
import LastEntryCard from '../../../components/account/LastEntryCard'

const Profile = () => {
  const userData = getUserData();
  const [publicEntries, setPublicEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicEntries = async () => {
      if (userData?.id) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:8000/api/entries/public_by_user/?user_id=${userData.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch public entries');
          }
          
          const data = await response.json();
          setPublicEntries(data);
        } catch (err) {
          console.error('Error fetching public entries:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPublicEntries();
  }, [userData?.id]);

  const handleMore = (entryId) => {
    // Redirect to entry detail page
    window.location.href = `/account/entry/${entryId}`;
  };

  if (!userData) {
    clearAuthData();
    window.location.href = '/auth';
    return null;
  }

  return (
    <>
    <AccountHeader/>
    <section className='px-20 space-y-10'>
        <div className={
          'w-full mt-10 ' + 
          (userData?.profile?.gradient 
            ? `bg-gradient-to-r from-${userData.profile.gradient.split(',')[0]} to-${userData.profile.gradient.split(',')[1]}` 
            : `bg-${userData?.profile?.bgColor || 'neutral-100'}`) +
          ' dark:bg-neutral-800 rounded-full relative py-20 space-y-10'
        }>
            <img src="/img/Account/design _ idea, thought, mind, innovation, innovative, head.webp" alt="Фото профиля, которое пользователь может выбрать сам в настройках" className="w-20 border-2 rounded-full absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" />
            <p className='text-center text-neutral-900 dark:text-neutral-100 text-2xl zag'>{userData ? userData.username : 'Имя пользователя'}</p>
        </div>
        <div className='px-20 flex justify-between'>
            <div className='space-x-10'>
                <Link to="/account/new-entry" className='text'>Создать новую запись</Link>
                <Link to="/account/entries" className='text'>Черновики</Link>
                <Link to="/social/profile/settings" className='text'>Настройки профиля</Link>
            </div>
            <div>
                <button className='text'>Сортировка
                    {/* тут пользователь может отсортировать свои записи(сначала новые, сначала старые) */}
                </button>
            </div>
        </div>
        <div>
            {loading ? (
              <p className="text-center text-gray-500">Загрузка публичных записей...</p>
            ) : error ? (
              <p className="text-center text-red-500">Ошибка: {error}</p>
            ) : publicEntries.length === 0 ? (
              <p className="text-center text-gray-500">У пользователя нет публичных записей</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicEntries.map((entry) => (
                  <LastEntryCard 
                    key={entry.id} 
                    entry={entry} 
                    onMore={() => handleMore(entry.id)} 
                  />
                ))}
              </div>
            )}
        </div>
    </section>
    </>
  )
}

export default Profile