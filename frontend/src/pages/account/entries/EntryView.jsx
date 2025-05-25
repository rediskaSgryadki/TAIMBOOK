import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AccountHeader from '../../../components/account/AccountHeader';
import Footer from '../../../components/Footer';
import { checkTokenValidity, getUserData, getToken, clearAuthData } from '../../../utils/authUtils';
import Loader from '../../../components/Loader';

// Константа для хэштегов
const MAX_HASHTAG_LENGTH = 15;

const EntryView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([55.75, 37.57]);

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

        const response = await fetch(`http://localhost:8000/api/entries/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
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
    navigate(`/account/entry/${id}/edit`);
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

      const response = await fetch(`http://localhost:8000/api/entries/${id}/`, {
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

      navigate('/account');
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
    <div className="min-h-screen">
      <AccountHeader />
      <div className='w-full space-y-10 h-screen mt-12 px-20'>
        <div className='flex gap-10'>
          {entry.cover_image && (
            <img src={entry.cover_image} alt={entry.title} className='h-[30vh] rounded-lg' />
          )}
          <div className='space-y-6 w-full'>
            <p className='zag text-6xl m-auto'>
              {entry.title}
            </p>
            
            {/* Хэштеги с эффектом затухания */}
            {hashtagsList.length > 0 && (
              <div className="mb-2 overflow-hidden">
                <div className="flex flex-wrap items-center">
                  <p className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">Хэштеги:</p>
                  <div className="flex flex-wrap">
                    {hashtagsList.map((tag, index) => (
                      <span 
                        key={index} 
                        className={`text-sm mr-2 mb-1 ${getHashtagColorClass(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className='flex justify-between w-full'>
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
              <p className='text text-xl'>
                {entry.location ? `${entry.location.latitude}, ${entry.location.longitude}` : 'Нет местоположения'}
              </p>
            </div>
            <div className='flex justify-end gap-x-10 items-end'>
              <button onClick={handleEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Редактировать
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Удалить
              </button>
            </div>
          </div>
        </div>
        <div className='w-full h-[50vh] overflow-y-auto overflow-x-hidden'>
          <div
            className="prose dark:prose-invert max-w-none overflow-y-auto overflow-x-hidden p-5 bg-neutral-300 dark:bg-neutral-800 rounded-xl"
            style={{
              color: entry.text_color || '#222222',
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
  );
};

export default EntryView; 