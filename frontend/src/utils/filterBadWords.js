import leoProfanity from 'leo-profanity';

// Добавляем русский словарь
leoProfanity.add(leoProfanity.getDictionary('ru'));

// Можно добавить свои слова, если нужно:
// leoProfanity.add(['дурак', 'идиот', 'блин', 'чёрт']);

export function filterBadWords(text) {
  if (!text) return text;
  return leoProfanity.clean(text);
}

export function hasBadWords(text) {
  if (!text) return false;
  return leoProfanity.check(text);
}
