import React, { useState } from 'react';

const ReviewFormModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    author: '',
    text: '',
    rating: 5
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Валидация формы
    if (!formData.text.trim()) {
      setError('Пожалуйста, напишите ваш отзыв');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      setError(error.response?.data?.message || 'Произошла ошибка при отправке отзыва');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]" style={{ zIndex: 2147483647 }}>
      <div className="w-full md:w-1/2 card p-10 shadow-xl rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-x-10">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-y-2">
            <h3 className="zag tracking-wider text-3xl text-center">Оставить отзыв</h3>
            <p className="text text-xl text-center">Поделитесь вашим мнением о нашем сервисе</p>
          </div>
          
          {error && (
            <div className="bg-red-700 px-4 py-2 rounded text-sm mt-2 shadow-md text-white">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="author">
                Ваше имя (необязательно)
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg card border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Аноним"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="text">
                Ваш отзыв *
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg card border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Оценка
              </label>
              <div className="flex space-x-2 my-2">
                {[1, 2, 3, 4, 5].map(star => {
                  // Determine the background color based on star number
                  let bgColor = '';
                  if (star <= formData.rating) {
                    if (formData.rating === 5) bgColor = 'bg-lime-500';
                    else if (formData.rating === 4) bgColor = 'bg-lime-400';
                    else if (formData.rating === 3) bgColor = 'bg-yellow-400';
                    else bgColor = 'bg-red-500';
                  } else {
                    bgColor = 'bg-gray-200 dark:bg-gray-700';
                  }
                  
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className={`w-10 h-10 flex items-center justify-center text-xl rounded-full ${
                        star <= formData.rating 
                          ? `${bgColor} text-white` 
                          : `${bgColor} text-gray-400 dark:text-gray-500`
                      } transition-all`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="bg-white text-green-600 font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="flex items-center justify-center hidden md:block">
          <img src="/img/Home/social media, mobile device _ smartphone, like, comment, image, picture, views.webp" alt="Отзыв" className="max-w-full h-auto"/>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormModal;
