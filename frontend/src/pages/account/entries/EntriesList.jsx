import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AccountHeader from '../../../components/account/AccountHeader';
import { getToken, clearAuthData } from '../../../utils/authUtils';

const MAX_CONTENT_LENGTH = 180;
const MAX_HASHTAG_LENGTH = 15;

const EntriesList = () => {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const fetchEntries = async () => {
      try {
        const token = getToken();
        if (!token) {
          clearAuthData();
          navigate('/auth');
          return;
        }

        if (!date) {
          setError('Дата не указана');
          setLoading(false);
          return;
        }

        console.log('Fetching entries for date:', date);
        const response = await fetch(`http://localhost:8000/api/entries/by_date/?date=${date}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch entries');
        }

        const data = await response.json();
        console.log('Received entries:', data);
        setEntries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [date, navigate]);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    // Разбираем дату вручную, чтобы избежать проблем с часовым поясом
    const [year, month, day] = dateString.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
    <div className="h-screen overflow-hidden flex flex-col">
      <AccountHeader />
      <div className="flex-1 overflow-auto">
        <section className='flex flex-col gap-y-10 px-20 mt-10'>
          <div className='w-full py-10 card rounded-3xl text-center'>
            <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
              Записи за {formatDate(date)}
            </h2>
            <button
              onClick={() => {
                navigate(`/account/new-entry?date=${date}`);
              }}
              className="px-6 py-2 bg-[var(--color-green)] text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
            >
              Новая запись
            </button>
          </div>

          {entries.length > 0 ? (
            <div className='grid grid-cols-3 gap-6'>
              {entries.map(entry => {
                const getShortHtml = (html, maxLen = MAX_CONTENT_LENGTH) => {
                  if (!html) return '';
                  const div = document.createElement('div');
                  div.innerHTML = html;
                  let text = div.innerText;
                  if (text.length > maxLen) text = text.slice(0, maxLen) + '...';
                  // Обрезаем только текст, но возвращаем исходный HTML, если короткий
                  if (div.innerText.length > maxLen) {
                    // Обрезаем HTML по символам (грубый способ)
                    return html.slice(0, maxLen) + '...';
                  }
                  return html;
                };
                
                const hashtagsList = formatHashtags(entry.hashtags);
                
                return (
                  <div 
                    key={entry.id}
                    className="card rounded-3xl flex flex-col p-10 relative overflow-hidden cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => navigate(`/account/entry/${entry.id}/edit`)}
                  >
                    {entry.cover_image && (
                      <img
                        src={entry.cover_image}
                        alt="Обложка записи"
                        className="w-1/2 h-48 rounded-3xl border-2 object-cover mx-auto mb-6"
                      />
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[60%]">{entry.title}</h3>
                      {entry.location && (
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-[35%]">
                          {entry.location.name || `${entry.location.latitude?.toFixed(2) ?? ''}, ${entry.location.longitude?.toFixed(2) ?? ''}`}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 flex-1 mb-4 break-words" 
                      dangerouslySetInnerHTML={{ __html: getShortHtml(entry.content, MAX_CONTENT_LENGTH) }} />
                    
                    {/* Хэштеги с эффектом постепенного исчезновения */}
                    {hashtagsList.length > 0 && (
                      <div className="mb-8 overflow-hidden">
                        <div className="flex flex-wrap">
                          {hashtagsList.map((tag, index) => (
                            <span 
                              key={index} 
                              className={`text-xs mr-2 mb-1 ${getHashtagColorClass(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-end justify-end absolute bottom-6 right-10 w-[calc(100%-5rem)]">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-4 self-end">
                        {new Date(entry.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {entry.is_public && (
                        <span className="mr-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full self-end">
                          Публичная
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/account/entry/${entry.id}`);
                        }}
                        className="px-4 py-2 bg-[var(--color-green)] text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='bg-neutral-100 dark:bg-neutral-800 rounded-3xl p-10 text-center'>
              <p className="text-neutral-500 dark:text-neutral-400">На эту дату записей нет</p>
            </div>
          )}
        </section>
      </div>
      <style>{`
        .entry-content table, .entry-content td, .entry-content th {
          border: 2px solid #444;
          border-collapse: collapse;
        }
        .entry-content td, .entry-content th {
          min-width: 40px;
          min-height: 24px;
          padding: 4px;
        }
      `}</style>
    </div>
  );
};

export default EntriesList; 