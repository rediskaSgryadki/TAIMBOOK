import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AccountHeader from '../../../components/account/AccountHeader';
import Footer from '../../../components/Footer';
import { checkTokenValidity, getUserData, getToken, clearAuthData } from '../../../utils/authUtils';
import Loader from '../../../components/Loader';
import AccountMenu from '../../../components/account/AccountMenu';
import { Helmet } from 'react-helmet-async';
import { formatHashtags } from '../../../utils/formatHashtags';
import HashtagList from '../../../components/ui/HashtagList';

// Константа для хэштегов
const MAX_HASHTAG_LENGTH = 15;

const EntryView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([55.75, 37.57]);
  const userData = getUserData();

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Функция для получения класса цвета хэштега в зависимости от длины
  const getHashtagColorClass = (tag) => {
    const length = tag.length;
    if (length <= MAX_HASHTAG_LENGTH / 3) return 'text-gray-800 dark:text-gray-200';
    if (length <= (MAX_HASHTAG_LENGTH * 2) / 3) return 'text-gray-600 dark:text-gray-300';
    return 'text-gray-400 dark:text-gray-500';
  };

  // Преобразование строки хэштегов в массив и форматирование
  const formatHashtags = (hashtagsString) => {
    if (!hashtagsString) return [];
    
    return hashtagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
      .map(tag => {
        // Добавляем # если его нет
        if (!tag.startsWith('#')) tag = '#' + tag;
        
        // Обрезаем до MAX_HASHTAG_LENGTH
        if (tag.length > MAX_HASHTAG_LENGTH) {
          return tag.substring(0, MAX_HASHTAG_LENGTH) + '...';
        }
        return tag;
      });
  };

  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      clearAuthData();
      navigate('/auth');
      return;
    }
    checkTokenValidity(
      () => {
        setLoading(false);
      },
      (errorMsg) => {
        setError(errorMsg);
        clearAuthData();
        setTimeout(() => navigate('/auth'), 2000);
      }
    );
  }, [navigate]);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const token = getToken();
        if (!token) {
          clearAuthData();
          navigate('/auth');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/entries/${id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch entry');
        }

        const data = await response.json();
        setEntry(data);
        
        if (data.location) {
          setMapCenter([data.location.latitude, data.location.longitude]);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/account/entries/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        clearAuthData();
        navigate('/auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/entries/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete entry');
      }

      navigate('/account/home');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <AccountHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const hashtagsList = formatHashtags(entry.hashtags);

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка...'
            : error
              ? 'Ошибка'
              : userData
                ? `${userData.username} — просмотр записи`
                : 'Имя пользователя — просмотр записи'}
        </title>
      </Helmet>
      <div className="min-h-screen">
        <AccountHeader />
        <AccountMenu/>
        <div className='w-full space-y-10 h-screen mt-12 px-7 md:px-20'>
          <div className='flex flex-col md:flex-row gap-10'>
            {entry.cover_image && (
              <img src={entry.cover_image} alt={entry.title} className='h-[30vh] rounded-lg' />
            )}
            <div className='space-y-6 w-full'>
              <p className='zag text-6xl m-auto'>
                {entry.title}
              </p>
              
              {/* Хэштеги */}
              <HashtagList hashtags={hashtagsList} className="mt-2" />
              
              <div className='flex flex-col gap-y-10 md:flex-row justify-center md:justify-between w-full'>
                <div className="flex items-center">
                  <p className='text text-xl'>
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                  {entry.is_public && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Публичная
                    </span>
                  )}
                </div>
                <div className='flex flex-col items-start md:items-end'>
                  {entry.location ? (
                    <>
                      <p className='text text-sm md:text-xl'>
                        {entry.location.name
                          ? <span>📍 {entry.location.name}</span>
                          : <span>Координаты: {entry.location.latitude}, {entry.location.longitude}</span>
                        }
                      </p>
                      {entry.location.latitude && entry.location.longitude && (
                        <div className='w-full max-w-xs h-40 mt-2 rounded-xl overflow-hidden border border-gray-300'>
                          <YMaps>
                            <Map
                              defaultState={{ center: [entry.location.latitude, entry.location.longitude], zoom: 13 }}
                              width="100%"
                              height="100%"
                            >
                              <Placemark geometry={[entry.location.latitude, entry.location.longitude]} />
                            </Map>
                          </YMaps>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className='text text-xl'>Нет местоположения</p>
                  )}
                </div>
              </div>
              <div className='flex justify-end gap-x-10 items-end'>
                <button onClick={() => navigate(`/account/entries/${id}/edit`)} className="px-4 py-2 bg-[var(--color-green)] text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Редактировать
                </button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Удалить
                </button>
              </div>
            </div>
          </div>
          <div className='w-full overflow-x-hidden text-black dark:text-white'>
            <div
              className="prose dark:prose-invert max-w-none overflow-y-auto overflow-x-hidden px-5 py-20 border-t-4 border-black dark:border-white"
              style={{
                fontSize: entry.font_size || '16px',
                textAlign: entry.text_align || 'left',
                fontWeight: entry.is_bold ? 'bold' : 'normal',
                textDecoration: entry.is_underline ? 'underline' : (entry.is_strikethrough ? 'line-through' : 'none'),
                height: '100%',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            dangerouslySetInnerHTML={{
              __html: entry.html_content || entry.content || ''
            }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryView; 