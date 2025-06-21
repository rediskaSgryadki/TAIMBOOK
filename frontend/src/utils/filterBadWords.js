import leoProfanity from 'leo-profanity';
import { extendedRussianBadWords } from './converter';
// Функция для нормализации текста:
// 1. Приводит к нижнему регистру.
// 2. Удаляет все, кроме букв (включая цифры и спецсимволы).
function normalizeText(text) {
  return text.toLowerCase()
             .replace(/[^a-zа-яё]/g, ''); // Удаляем все, кроме букв
}

// Добавляем русский словарь
leoProfanity.add(leoProfanity.getDictionary('ru'));

// Можно добавить свои слова, если нужно:
// leoProfanity.add(['дурак', 'идиот', 'блин', 'чёрт']);

export function filterBadWords(text) {
  if (!text) return text;
  const normalized = normalizeText(text);
  if (leoProfanity.check(normalized)) {
    return leoProfanity.clean(text);
  }
  return text;
}

export function hasBadWords(text) {
  if (!text) return false;
  const normalized = normalizeText(text);
  return leoProfanity.check(normalized);
}
