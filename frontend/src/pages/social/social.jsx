import React, { useState, useEffect } from 'react'
import AccountHeader from '../../components/account/AccountHeader'
import UserPosts from '../../components/social/UserPosts'
import { getToken, executeRequestWithTokenRefresh, API_BASE_URL } from '../../utils/authUtils'
import { useNavigate } from 'react-router-dom'
import AccountMenu from '../../components/account/AccountMenu'
// Если здесь есть роутинг, добавить:
// import UserProfile from './UserProfile';
// <Route path="/social/user/:userId" element={<UserProfile />} />
import axios from 'axios'; // Импортируем axios
import { Helmet } from 'react-helmet-async';

const Social = () => {
  const [publicPosts, setPublicPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // const API_BASE_URL = process.env.REACT_APP_API_URL; // Уже импортирован из authUtils

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError('Требуется авторизация для просмотра публичных записей.');
          setLoading(false);
          return;
        }
        const response = await executeRequestWithTokenRefresh(() =>
          axios.get(`${API_BASE_URL}/api/entries/public/`, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
        );
        setPublicPosts(response.data);
      } catch (err) {
        console.error('Error fetching public entries:', err);
        setError(err.message || 'Не удалось получить записи.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  // Фильтрация постов по поиску
  const filteredPosts = publicPosts.filter(post => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    // Поиск по хештегам
    if (query.startsWith('#')) {
      const tag = query.slice(1);
      return (post.hashtags || '').toLowerCase().split(',').some(t => t.trim().includes(tag));
    }
    // Поиск по заголовку и содержимому
    const title = (post.title || '').toLowerCase();
    const content = (post.content || post.htmlContent || '').toLowerCase();
    const hashtags = (post.hashtags || '').toLowerCase();
    return title.includes(query) || content.includes(query) || hashtags.includes(query);
  });

  return (
    <>
      <Helmet>
        <title>Сообщество</title>
      </Helmet>
      <AccountHeader />

      <div className="flex flex-grow h-screen">
        <AccountMenu/>
        <div className="flex flex-col flex-grow space-y-20">
          <div className="px-20 w-screen flex justify-center md:justify-end">
            <input
              type="text"
              className="card md:w-1/5 px-10 py-4 rounded-b-full focus:outline-none border-b border-b-gray-300"
              placeholder="👀 Поиск"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-screen px-7 md:px-20 space-y-10">
            <div></div>
            {loading ? (
              <p className="text-center text-gray-500">
                Загрузка публичных записей...
              </p>
            ) : error ? (
              <p className="text-center text-red-500">Ошибка: {error}</p>
            ) : filteredPosts.length === 0 ? (
              <p className="text-center text-gray-500">
                Нет записей по вашему запросу.
              </p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="mx-auto w-full md:w-1/2">
                  <UserPosts post={post} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Social
