import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { filterBadWords } from '../../utils/filterBadWords';

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
    const text = div.innerText;
    
    // Если текстовое содержимое короткое, возвращаем полный HTML.
    // Иначе возвращаем укороченный текст, чтобы избежать поломки HTML тегов при обрезке.
    if (text.length <= maxLen) {
      return html;
    } else {
      return text.slice(0, maxLen) + '...';
    }
  };

  // Утилита цензуры для HTML-контента (цензурит текст внутри тегов)
  const censorHtmlContent = (html) => {
    if (!html) return '';
    // Создаем временный div для парсинга HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    // Рекурсивно обходим все текстовые узлы и фильтруем их
    const censorNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = filterBadWords(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach(censorNode);
      }
    };
    div.childNodes.forEach(censorNode);
    return div.innerHTML;
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

  return (
    <div className="card shadow-md rounded-2xl sm:rounded-3xl flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
      {cover_image && (
        <img
          src={cover_image}
          alt={title}
          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-xl entry-cover"
        />
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-y-2 sm:gap-y-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 entry-title">{filterBadWords(title)}</h2>
        {location && (
          <p className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-4 entry-location text-xs sm:text-sm md:text-base">
            <span className="text-gray-400 dark:text-gray-500">📍</span> {location.name || `${location.latitude?.toFixed(2) ?? ''}, ${location.longitude?.toFixed(2) ?? ''}`}
          </p>
        )}
      </div>
      <p
        className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-4 entry-content text-xs sm:text-sm md:text-base max-h-40 sm:max-h-60 overflow-y-auto pr-2"
        style={{ wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: censorHtmlContent(content || '') }}
      />
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-auto gap-y-2 sm:gap-y-0">
        <div className="flex items-center overflow-hidden flex-1 mr-0 sm:mr-3">
          {hashtagsList.length > 0 && (
            <div className="flex items-center overflow-hidden entry-hashtags">
              <div className="flex items-center flex-nowrap overflow-hidden">
                {hashtagsList.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`text-xs sm:text-md whitespace-nowrap mr-2 ${getHashtagColorClass(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center flex-shrink-0 gap-x-2 sm:gap-x-3">
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 entry-date mr-1 sm:mr-3">
            {new Date(created_at).toLocaleDateString()}
          </span>
          {is_public && (
            <span className="entry-public text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full mr-0 sm:mr-2">
              Публичная
            </span>
          )}
          <button
            onClick={onMore}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-[var(--color-green)] text-white rounded-full hover:scale-105 transition-all duration-300 text-xs sm:text-base"
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
};

export default LastEntryCard;