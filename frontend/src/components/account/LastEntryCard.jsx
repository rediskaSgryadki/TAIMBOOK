import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';

const MAX_CONTENT_LENGTH = 150;
const MAX_HASHTAG_LENGTH = 15;

const LastEntryCard = ({ entry, onMore }) => {
  const [runTour, setRunTour] = useState(true);

  if (!entry) return null;
  
  // Destructure with default values to prevent undefined errors
  const { 
    cover_image, 
    title = '', 
    content = '', 
    location, 
    created_at,
    hashtags = '',
    is_public = false
  } = entry;

  // Safely handle content length
  const getShortHtml = (html, maxLen = MAX_CONTENT_LENGTH) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = div.innerText;
    if (text.length > maxLen) text = text.slice(0, maxLen) + '...';
    if (div.innerText.length > maxLen) {
      return html.slice(0, maxLen) + '...';
    }
    return html;
  };

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

  const hashtagsList = formatHashtags(hashtags);

  const tourSteps = [
    {
      target: '.entry-cover',
      content: 'Обложка записи. Вы можете загрузить изображение для каждой записи.',
      placement: 'bottom'
    },
    {
      target: '.entry-title',
      content: 'Заголовок записи. Здесь отображается название вашей записи.',
      placement: 'bottom'
    },
    {
      target: '.entry-content',
      content: 'Краткое содержание записи. Для просмотра полной версии нажмите на кнопку "Подробнее".',
      placement: 'bottom'
    },
    {
      target: '.entry-location',
      content: 'Местоположение записи. Вы можете указать, где была сделана запись.',
      placement: 'bottom'
    },
    {
      target: '.entry-hashtags',
      content: 'Хэштеги для классификации записи.',
      placement: 'bottom'
    },
    {
      target: '.entry-date',
      content: 'Дата создания записи. Записи автоматически сортируются по дате.',
      placement: 'bottom'
    },
    {
      target: '.entry-public',
      content: 'Индикатор публичности записи. Публичные записи могут быть видны другим пользователям.',
      placement: 'bottom'
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false);
    }
  };

  return (
    <div className="card shadow-md h-[55vh] rounded-3xl flex flex-col p-10 relative overflow-hidden">
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTour}
        steps={tourSteps}
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#4ade80',
            backgroundColor: '#1e293b',
            textColor: '#f8fafc',
            borderRadius: '12px',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            width: '300px',
            height: 'auto'
          }
        }}
      />
      {cover_image && (
        <img
          src={cover_image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-xl entry-cover"
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold mb-4 entry-title">{title}</h2>
        {location && (
          <p className="text-gray-500 dark:text-gray-400 mb-4 entry-location">
            <span className="text-gray-400 dark:text-gray-500">📍</span> {location.name || `${location.latitude?.toFixed(2) ?? ''}, ${location.longitude?.toFixed(2) ?? ''}`}
          </p>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4 entry-content" dangerouslySetInnerHTML={{ __html: getShortHtml(content, MAX_CONTENT_LENGTH) }} />
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
      
      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center overflow-hidden flex-1 mr-3">
          {/* Хэштеги в строку с эффектом затухания */}
          {hashtagsList.length > 0 && (
            <div className="flex items-center overflow-hidden entry-hashtags">
              <div className="flex items-center flex-nowrap overflow-hidden">
                {hashtagsList.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`text-md whitespace-nowrap mr-2 ${getHashtagColorClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center flex-shrink-0">
          <span className="text-sm text-gray-500 dark:text-gray-400 entry-date mr-3">
            {new Date(created_at).toLocaleDateString()}
          </span>
          {is_public && (
            <span className="entry-public text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mr-2">
              Публичная
            </span>
          )}
          <button
            onClick={onMore}
            className="px-4 py-2 bg-[var(--color-green)] text-white rounded-full hover:bg-[var(--color-green-dark)]"
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
};

export default LastEntryCard;