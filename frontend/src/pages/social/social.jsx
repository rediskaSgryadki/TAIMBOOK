import React, { useState, useEffect } from 'react'
import AccountHeader from '../../components/account/AccountHeader'
import UserPosts from '../../components/social/UserPosts'
import { getToken } from '../../utils/authUtils'
import { useNavigate } from 'react-router-dom'

const Social = () => {
  const [publicPosts, setPublicPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = getToken()
        if (!token) {
          navigate('/auth')
          return
        }

        // Если бэкенд поддерживает фильтрацию через query, то можно прямо туда:
        const response = await fetch(
          'http://localhost:8000/api/entries/?is_public=true',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || 'Failed to fetch entries')
        }

        const data = await response.json()

        // На случай, если бэкенд не фильтрует, оставим дополнительный фильтр на клиенте:
        const onlyPublic = data.filter((post) => post.is_public === true)
        setPublicPosts(onlyPublic)
      } catch (err) {
        console.error('Error fetching public entries:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [navigate])

  return (
    <>
      <AccountHeader />

      <div className="space-y-20">
        <section className="px-20 flex justify-end">
          <input
            type="text"
            className="card px-10 py-2 rounded-b-full"
            placeholder="👀 Поиск"
          />
        </section>

        <section className="px-20 space-y-10">
          {loading ? (
            <p className="text-center text-gray-500">
              Загрузка публичных записей...
            </p>
          ) : error ? (
            <p className="text-center text-red-500">Ошибка: {error}</p>
          ) : publicPosts.length === 0 ? (
            <p className="text-center text-gray-500">
              Публичных записей пока нет.
            </p>
          ) : (
            publicPosts.map((post) => (
              <UserPosts key={post.id} post={post} />
            ))
          )}
        </section>
      </div>
    </>
  )
}

export default Social
