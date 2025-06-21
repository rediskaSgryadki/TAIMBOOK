import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getToken, checkTokenValidity, redirectToAuth } from '../../utils/authUtils';
import { Link } from 'react-router-dom';
import { formatHashtags } from '../../utils/formatHashtags';
import HashtagList from '../ui/HashtagList';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const UserPosts = ({ post }) => {
  const [showFullCover, setShowFullCover] = useState(false)
  const [fullCoverUrl, setFullCoverUrl] = useState('')
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [coverImageLoadError, setCoverImageLoadError] = useState(false)

  useEffect(() => {
    if (post?.id) {
      fetchLikeCount(post.id)
      fetchLiked(post.id)
      // Не грузим комменты сразу
    }
    // eslint-disable-next-line
  }, [post?.id])

  useEffect(() => {
    // Сбрасываем ошибку загрузки обложки при смене поста
    setCoverImageLoadError(false);
  }, [post?.cover_image]);

  const fetchLikeCount = async (postId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/like/${postId}/count/`,
        { headers: { Authorization: `Bearer ${getToken()}` } })
      setLikes(res.data.count)
    } catch {}
  }

  const fetchLiked = async (postId) => {
    setLiked(false) // по умолчанию
    // Можно реализовать отдельный эндпоинт для проверки, лайкнул ли пользователь
  }

  const handleLike = async (postId) => {
    if (!getToken() || !checkTokenValidity()) {
      redirectToAuth();
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/like/${postId}/toggle/`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setLikes(res.data.count)
      setLiked(res.data.liked)
    } catch (e) {
      alert('Ошибка при попытке поставить лайк!');
    }
  }

  const handleShowComments = () => {
    setShowComments(show => !show)
    if (!showComments && comments.length === 0) fetchComments(post.id)
  }

  const fetchComments = async (postId) => {
    setCommentsLoading(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/api/comments/${postId}/`,
        { headers: { Authorization: `Bearer ${getToken()}` } })
      setComments(res.data)
    } catch {}
    setCommentsLoading(false)
  }

  const handleAddComment = async (postId) => {
    if (!getToken() || !checkTokenValidity()) {
      redirectToAuth();
      return;
    }
    if (commentText.length === 0) {
      alert('Комментарий не может быть пустым!');
      return;
    }
    if (commentText.length > 500) {
      alert('Комментарий слишком длинный (максимум 500 символов)! уу');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/comments/${postId}/`, { text: commentText }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCommentText('')
      fetchComments(postId)
    } catch (e) {
      alert('Ошибка при попытке добавить комментарий!');
    }
  }

  const getHashtagColorClass = (tag) => 'text-gray-600 dark:text-gray-300'

  const handleCoverClick = (imageUrl) => {
    setFullCoverUrl(imageUrl)
    setShowFullCover(true)
  }

  const closeFullCover = () => {
    setShowFullCover(false)
    setFullCoverUrl('')
  }

  if (!post) return null

  const authorName = post.author?.name || 'Имя пользователя'
  const authorPhoto = post.author?.photo || '/default-avatar.png'

  return (
    <section className=''>
      <div className='card px-2 sm:px-6 md:px-10 py-6 sm:py-10 w-full min-h-[60vh] h-auto rounded-3xl space-y-6 sm:space-y-10 flex flex-col justify-between'>
        <div className='flex justify-between items-center'>
          {authorPhoto && authorPhoto !== '/default-avatar.png' ? (
            <img
              src={authorPhoto}
              alt="user_photo"
              className='w-10 h-10 rounded-full object-cover'
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          {(!authorPhoto || authorPhoto === '/default-avatar.png') && (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl">
              👤
            </div>
          )}
          <h2 className='zag tracking-widest'>{authorName}</h2>
          {/* <Link to={`/social/user/${post.author.username}>
            <h2 className='zag tracking-widest'>{authorName}</h2>
          </Link> */}
        </div>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold'>{post.title || 'Без заголовка'}</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {post.date ? new Date(post.date).toLocaleDateString() : 'Без даты'}
          </p>
        </div>
        {post.cover_image && !coverImageLoadError && (
          <div className="cursor-pointer" onClick={() => handleCoverClick(post.cover_image)}>
            <img
              src={post.cover_image}
              alt={post.title || 'Cover image'}
              className='w-full h-64 sm:h-80 object-cover rounded-3xl'
              onError={() => setCoverImageLoadError(true)}
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <div className={`prose dark:prose-invert max-w-none transition-all duration-300 ${expanded ? 'h-auto' : 'h-60 overflow-hidden'}`}> 
            <div
              dangerouslySetInnerHTML={{ __html: post.htmlContent || post.content || 'Нет содержимого' }}
            />
          </div>
        </div>
        <div className='space-y-0 fon rounded-2xl'>
          <div className='flex justify-between w-full rounded-2xl px-2 sm:px-5 py-3 sm:py-5 fon'>
            <div className='space-x-5 flex'>
              <div className='flex items-center'>
                <button className={`text-2xl ${liked ? 'text-red-500' : ''}`} onClick={() => handleLike(post.id)} title={liked ? 'Убрать лайк' : 'Поставить лайк'}>
                  {liked ? '❤️' : '🤍'}
                </button>
                <p className='ml-1'> {likes ?? 0}</p>
              </div>
              <div className='flex items-center'>
                <button className='text-2xl' onClick={handleShowComments} title='Комментарии'>💬</button>
                <p className='ml-1'> {post.comments_count ?? 0} </p>
              </div>
            </div>
            {!expanded && (
              <button className="mt-2 text-green-600 hover:underline self-end" onClick={() => setExpanded(true)}>Подробнее</button>
            )}
            {expanded && (
              <button className="mt-2 text-green-600 hover:underline self-end" onClick={() => setExpanded(false)}>Скрыть</button>
            )}
          </div>
          {/* Комментарии */}
          {showComments && (
            <div className='w-full fon rounded-2xl p-4 mt-2 flex flex-col gap-y-4'>
              <div className='flex flex-col gap-y-2 mb-2'>
                <input
                  type='text'
                  className='border rounded-lg px-3 py-2 text-sm text-black'
                  placeholder='Написать комментарий...'
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post.id) }}
                />
                <button
                  className='self-end px-4 py-1 bg-green-500 text-white rounded-full text-sm mt-1 hover:bg-green-600 transition-colors'
                  onClick={() => handleAddComment(post.id)}
                >
                  Отправить
                </button>
              </div>
              <div className='flex flex-col gap-y-3 max-h-60 overflow-y-auto'>
                {commentsLoading ? (
                  <div className='text-center text-gray-400'>Загрузка...</div>
                ) : comments.length ? (
                  comments.map(comment => (
                    <div key={comment.id} className='flex items-start gap-x-3 p-2 card rounded-xl shadow-sm'>
                      {comment.author.photo && comment.author.photo !== '/default-avatar.png' ? (
                        <img
                          src={comment.author.photo}
                          alt='user_photo'
                          className='w-8 h-8 rounded-full object-cover mt-1'
                          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      {(!comment.author.photo || comment.author.photo === '/default-avatar.png') && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-lg mt-1">
                          👤
                        </div>
                      )}
                      <div className='flex flex-col'>
                        <span className='font-semibold text-sm'>{comment.author.name}</span>
                        <span className='text-xs text-gray-400'>{new Date(comment.created_at).toLocaleString()}</span>
                        <span className='mt-1 text-sm'>{comment.text}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center text-gray-400'>Комментариев пока нет</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className='flex justify-between items-center'>
          {post.location && (
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              📍 {post.location.name || `${post.location.latitude?.toFixed(2)}, ${post.location.longitude?.toFixed(2)}`}
            </p>
          )}
        </div>
        {/* Хэштеги */}
        <HashtagList hashtags={formatHashtags(post.hashtags)} className="mt-2" />
      </div>
      {showFullCover && fullCoverUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeFullCover}
        >
          <div className="max-w-full max-h-full overflow-hidden">
            <img src={fullCoverUrl} alt="Full size cover image" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </section>
  )
}

export default UserPosts
