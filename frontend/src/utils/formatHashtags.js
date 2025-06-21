// Универсальная функция для разбора строки хештегов
const MAX_HASHTAG_LENGTH = 15;

export function formatHashtags(hashtagsString) {
  if (!hashtagsString) return [];
  return hashtagsString
    .split(/[\s,]+/)
    .map(tag => tag.trim())
    .filter(tag => tag)
    .map(tag => {
      // Удаляем все ведущие # и добавляем один
      tag = tag.replace(/^#+/, '');
      tag = '#' + tag;
      if (tag.length > MAX_HASHTAG_LENGTH) {
        return tag.substring(0, MAX_HASHTAG_LENGTH) + '...';
      }
      return tag;
    });
} 