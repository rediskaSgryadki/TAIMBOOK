import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AccountHeader from '../../../components/account/AccountHeader';
import AccountMenu from '../../../components/account/AccountMenu';
import { getToken, clearAuthData, getUserData } from '../../../utils/authUtils';
import { Helmet } from 'react-helmet-async';
import { formatHashtags } from '../../../utils/formatHashtags';
import HashtagList from '../../../components/ui/HashtagList';

const MAX_CONTENT_LENGTH = 180;
const MAX_HASHTAG_LENGTH = 15;
const API_BASE_URL = process.env.REACT_APP_API_URL;

const EntriesList = () => {
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverImageLoadErrors, setCoverImageLoadErrors] = useState({});
  const userData = getUserData();

  // Функция для получения класса цвета хэштега в зависимости от длины
  const getHashtagColorClass = (tag) => {
    const length = tag.length;
    if (length <= MAX_HASHTAG_LENGTH / 3) return 'text-gray-800 dark:text-gray-200';
    if (length <= (MAX_HASHTAG_LENGTH * 2) / 3) return 'text-gray-600 dark:text-gray-300';
    return 'text-gray-400 dark:text-gray-500';
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
        const response = await fetch(`${API_BASE_URL}/api/entries/by_date/?date=${date}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
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
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка...'
            : error
              ? 'Ошибка'
              : userData
                ? `${userData.username} — записи за ${formatDate(date)}`
                : `Имя пользователя — записи за ${formatDate(date)}`}
        </title>
      </Helmet>
      <div className="h-screen flex flex-col">
        <AccountHeader />
        <div className="flex flex-1 h-screen">
          <AccountMenu />
          <main className="flex-1 flex flex-col px-10 py-10 fon shadow-[inset_0px_0px_12px_-5px_rgba(0,_0,_0,_0.08)] bg-neutral-50 dark:bg-neutral-900 overflow-y-auto">
            <section className="flex flex-col gap-y-10 w-full max-w-3xl mx-auto">
              <div className="w-full py-10 card rounded-3xl text-center">
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
                entries.map(entry => {
                  const getShortHtml = (html, maxLen = MAX_CONTENT_LENGTH) => {
                    if (!html) return '';
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    const text = div.innerText;
                    if (text.length <= maxLen) {
                      return html;
                    } else {
                      return text.slice(0, maxLen) + '...';
                    }
                  };
                  const hashtagsList = formatHashtags(entry.hashtags);
                  return (
                    <div
                      key={entry.id}
                      className="card px-2 sm:px-6 md:px-10 py-6 sm:py-10 w-full min-h-[40vh] rounded-3xl space-y-6 flex flex-col justify-between items-center mx-auto shadow-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-full">{entry.title}</h3>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(entry.created_at).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {entry.cover_image && !coverImageLoadErrors[entry.id] && (
                        <img
                          src={entry.cover_image}
                          alt="Обложка записи"
                          className="w-full max-w-xl h-64 object-cover rounded-3xl border-2 mx-auto"
                          onError={() => setCoverImageLoadErrors(prev => ({ ...prev, [entry.id]: true }))}
                        />
                      )}
                      <div className="overflow-x-auto w-full">
                        <div className="prose dark:prose-invert max-w-none transition-all duration-300 h-40 overflow-hidden">
                          <div
                            dangerouslySetInnerHTML={{ __html: getShortHtml(entry.htmlContent || entry.content, MAX_CONTENT_LENGTH) }}
                          />
                        </div>
                      </div>
                      {/* Хэштеги */}
                      <HashtagList hashtags={hashtagsList} className="mt-2" />
                      <div className="flex items-center w-full mt-2">
                        {entry.is_public && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Публичная
                          </span>
                        )}
                        <div className="flex-1"></div>
                        <button
                          onClick={() => navigate(`/account/entry/${entry.id}`)}
                          className="ml-auto px-4 py-2 bg-[var(--color-green)] text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition"
                        >
                          Подробнее
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-3xl p-10 text-center">
                  <p className="text-neutral-500 dark:text-neutral-400">На эту дату записей нет</p>
                </div>
              )}
            </section>
          </main>
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
    </>
  );
};

export default EntriesList; 