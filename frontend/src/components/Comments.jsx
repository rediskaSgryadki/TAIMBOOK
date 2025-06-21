import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewFormModal from './ReviewFormModal';
import { API_BASE_URL } from '../utils/authUtils';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const Comments = () => {
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reviews/`);
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          console.error('Некорректный формат данных отзывов:', response.data);
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      }
    };
    
    fetchReviews();
  }, []);

  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('Sending review data:', reviewData);
      const response = await axios.post(`${API_BASE_URL}/api/reviews/`, {
        author: reviewData.author,
        text: reviewData.text,
        rating: parseInt(reviewData.rating)
      });
      console.log('Response received:', response.data);
      setReviews([response.data, ...reviews]);
      setShowModal(false);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        request: error.request
      });
      throw error;
    }
  };

  return (
    <div className="container flex flex-col mx-auto items-end space-y-20 px-4 py-8">
      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[500px]">
        {Array.isArray(reviews) ? reviews.map((review, index) => (
          <div 
            key={index} 
            className="card dark:bg-neutral-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="zag text-xl tracking-wider text-gray-800 dark:text-white">
                {review.author || 'Аноним'}
              </h3>
              <div className="text-yellow-400">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
            </div>
            <p className="text text-lg text-gray-600 dark:text-gray-300 mb-4" style={{ wordBreak: 'break-word' }}>
              {review.text}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(review.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-red-600 dark:text-red-400">Ошибка загрузки отзывов</div>
        )}
      </div>

      {/* Add Review Button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-[var(--color-green)] text-white px-6 py-3 w-fit rounded-full shadow-lg hover:bg-[var(--color-green)] transition-colors"
      >
        Оставить отзыв
      </button>

      {/* Review Form Modal */}
      {showModal && (
        <ReviewFormModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};

export default Comments;
