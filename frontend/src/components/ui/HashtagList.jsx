import React from 'react';

const MAX_HASHTAG_LENGTH = 15;

function getHashtagColorClass(tag) {
  const length = tag.length;
  if (length <= MAX_HASHTAG_LENGTH / 3) return 'text-gray-800 dark:text-gray-200';
  if (length <= (MAX_HASHTAG_LENGTH * 2) / 3) return 'text-gray-600 dark:text-gray-300';
  return 'text-gray-400 dark:text-gray-500';
}

export default function HashtagList({ hashtags, className = '' }) {
  if (!hashtags || hashtags.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {hashtags.map((tag, idx) => (
        <span
          key={idx}
          className={`px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 ${getHashtagColorClass(tag)}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
} 