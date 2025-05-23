import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AccountHeader from '../../../components/account/AccountHeader';
import Footer from '../../../components/Footer';
import axios from 'axios';
import { checkTokenValidity, getUserData, getToken } from '../../../utils/authUtils';
import Loader from '../../../components/Loader';
import { AiOutlineFontSize, AiOutlineAlignLeft, AiOutlineAlignCenter, AiOutlineAlignRight, AiOutlineBold, AiOutlineUnderline, AiOutlineStrikethrough, AiOutlineUnorderedList, AiOutlineOrderedList, AiOutlineBgColors, AiOutlinePicture, AiOutlineTable } from 'react-icons/ai';
import { FiMapPin } from 'react-icons/fi';
import { useTheme } from '../../../context/ThemeContext';

const ALIGN_ICONS = {
  left: <AiOutlineAlignLeft className="w-5 h-5 mx-auto" />,
  center: <AiOutlineAlignCenter className="w-5 h-5 mx-auto" />,
  right: <AiOutlineAlignRight className="w-5 h-5 mx-auto" />,
};

// Constants for hashtag formatting
const MAX_HASHTAG_LENGTH = 15;

const EntryEditor = () => {
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    htmlContent: '',
    location: null,
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    coverImage: null,
    coverPreview: null,
    coverImagePath: null,
    hashtags: '',
    isPublic: false,
  });
  const [mapCenter, setMapCenter] = useState([55.75, 37.57]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const yandexApiKey = '27861ba2-1edf-4ada-9c93-c277cf2a043a';
  const mapRef = useRef(null);
  const [coverImages, setCoverImages] = useState([]);
  const { theme, isDarkMode } = useTheme();
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    // Устанавливаем курсор в конец при монтировании компонента
    if (contentRef.current) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      navigate('/auth');
      return;
    }
    checkTokenValidity(
      () => setLoading(false),
      (errorMsg) => {
        setError(errorMsg);
        setTimeout(() => navigate('/auth'), 2000);
      }
    );
  }, [navigate]);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!isEditMode) return;
      try {
        const token = getToken();
        if (!token) {
          navigate('/auth');
          return;
        }
        const response = await fetch(`http://localhost:8000/api/entries/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch entry');
        }
        const data = await response.json();
        setEntry({
          title: data.title || '',
          content: data.content || '',
          textColor: data.text_color || '#222222',
          fontSize: data.font_size || '16px',
          textAlign: data.text_align || 'left',
          location: data.location || null,
          date: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          coverImage: null,
          coverPreview: data.cover_image || null,
          isBold: data.is_bold || false,
          isUnderline: data.is_underline || false,
          isStrikethrough: data.is_strikethrough || false,
          listType: data.list_type || null,
          hashtags: data.hashtags || '',
          isPublic: data.is_public || false,
        });
        if (data.location) {
          setMapCenter([data.location.latitude, data.location.longitude]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id, isEditMode, navigate]);

  // Получить список обложек с бэка
  useEffect(() => {
    const fetchCovers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/covers/');
        if (!response.ok) throw new Error('Ошибка загрузки обложек');
        const data = await response.json();
        setCoverImages(data);
      } catch {
        setCoverImages([]);
      }
    };
    fetchCovers();
  }, []);

  const handleTextChange = (e) => {
    setEntry(prev => ({
      ...prev,
      content: e.target.innerText,
      htmlContent: e.target.innerHTML
    }));
  };

  // Фокусировка редактора перед execCommand
  const focusEditor = () => {
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  // Универсальное выравнивание: если курсор в таблице — выравнивает таблицу, иначе текст
  const handleAlign = (align) => {
    focusEditor();
    if (!contentRef.current) return;

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;

    // Проверяем, является ли узел текстовым узлом
    const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

    // Проверяем, находится ли курсор внутри таблицы
    const table = element.closest('table');
    if (table) {
      const cell = element.closest('td, th');
      if (cell) {
        document.execCommand(align === 'left' ? 'justifyLeft' : 
                            align === 'center' ? 'justifyCenter' : 
                            'justifyRight', false, null);
        return;
      }
    }

    // Проверяем, находится ли курсор внутри контейнера таблицы
    const container = element.closest('div[style*="width: 100%"]');
    if (container) {
      container.style.justifyContent = align === 'left' ? 'flex-start' : 
                                      align === 'center' ? 'center' : 
                                      'flex-end';
      return;
    }

    // Если курсор не в таблице — выравниваем текст
    document.execCommand(align === 'left' ? 'justifyLeft' : 
                        align === 'center' ? 'justifyCenter' : 
                        'justifyRight', false, null);
  };

  // Вставка таблицы с выбранным размером
  const insertTable = (rows, cols) => {
    // Убедимся, что редактор в фокусе
    contentRef.current.focus();

    // Получаем текущую позицию курсора
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);

    // Создаем невидимый контейнер для таблицы
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.display = 'flex';
    container.style.justifyContent = 'flex-start'; // По умолчанию выравнивание по левому краю

    // Создаем таблицу
    const table = document.createElement('table');
    table.setAttribute('border', '1');
    table.style.borderCollapse = 'collapse';
    table.style.border = '2px solid #444';

    // Заполняем таблицу
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        td.style.border = '2px solid #444';
        td.style.minWidth = '40px';
        td.style.minHeight = '24px';
        td.innerHTML = '&nbsp;';
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    // Добавляем таблицу в контейнер
    container.appendChild(table);

    // Вставляем контейнер с таблицей в позицию курсора
    range.insertNode(container);

    // Создаем пустой абзац после таблицы
    const newParagraph = document.createElement('p');
    newParagraph.innerHTML = '<br>'; // Пустой абзац для новой строки
    container.after(newParagraph);

    // Перемещаем курсор в новый абзац после таблицы
    const newRange = document.createRange();
    newRange.selectNodeContents(newParagraph);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // Обновляем состояние
    setEntry(prev => ({
      ...prev,
      content: contentRef.current.innerText,
      htmlContent: contentRef.current.innerHTML
    }));
    setShowTablePicker(false);
  };

  // Получить адрес по координатам (обратное геокодирование)
  const fetchAddressByCoords = async (coords) => {
    if (!yandexApiKey) return '';
    try {
      const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${coords[1]},${coords[0]}`);
      const data = await response.json();
      const firstResult = data.response.GeoObjectCollection.featureMember[0];
      if (firstResult) {
        return firstResult.GeoObject.metaDataProperty.GeocoderMetaData.text;
      }
    } catch {}
    return '';
  };

  // Поиск по адресу (с геокодированием и обратным геокодированием)
  const handleLocalSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!yandexApiKey) {
      setError('API-ключ Яндекс.Карт не задан. Обратитесь к администратору.');
      return;
    }
    try {
      const response = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${encodeURIComponent(localSearchQuery)}`);
      if (!response.ok) {
        throw new Error('Ошибка запроса к Яндекс.Картам');
      }
      const data = await response.json();
      const firstResult = data.response.GeoObjectCollection.featureMember[0];
      if (firstResult) {
        const coords = firstResult.GeoObject.Point.pos.split(' ').map(Number).reverse();
        const address = firstResult.GeoObject.metaDataProperty.GeocoderMetaData.text;
        setMapCenter(coords);
        setEntry(prev => ({
          ...prev,
          location: {
            latitude: coords[0],
            longitude: coords[1],
            name: address
          }
        }));
      } else {
        setError('Ничего не найдено. Попробуйте другой запрос.');
      }
    } catch (err) {
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Обработка клавиши Enter в поле поиска
  const handleLocalKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLocalSearchSubmit();
    }
  };

  const handleLocalSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
  };

  // Клик по карте: сохраняем координаты и ищем адрес
  const handleMapClick = async (e) => {
    const coords = e.get('coords');
    let address = '';
    if (yandexApiKey) {
      address = await fetchAddressByCoords(coords);
    }
    setEntry(prev => ({
      ...prev,
      location: {
        latitude: coords[0],
        longitude: coords[1],
        name: address
      }
    }));
    setMapCenter(coords);
    // Центрируем карту через ref, если возможно
    if (mapRef.current && mapRef.current.setCenter) {
      mapRef.current.setCenter(coords, 15, { duration: 300 });
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение (JPEG, PNG, GIF)');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер изображения не должен превышать 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEntry(prev => ({
        ...prev,
        coverImage: file,
        coverPreview: reader.result
      }));
      setError('');
    };

    reader.onerror = () => {
      setError('Ошибка при чтении файла');
      e.target.value = '';
    };

    reader.readAsDataURL(file);
    return;
  };

  const handleRandomCover = () => {
    if (!coverImages.length) return;
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    let randomCover = coverImages[randomIndex];
    // Если путь относительный, делаем абсолютный
    if (randomCover.startsWith('/media')) {
      randomCover = `http://localhost:8000${randomCover}`;
    }
    setEntry(prev => ({
      ...prev,
      coverPreview: randomCover,
      coverImagePath: randomCover // если нужно сохранить путь для бэка
    }));
  };

  const handleFontSizeChange = (size) => {
    setEntry(prev => ({
      ...prev,
      fontSize: size
    }));
  };

  const handleTextAlign = (align) => {
    setEntry(prev => ({
      ...prev,
      textAlign: align
    }));
  };

  const toggleTextStyle = (style) => {
    setEntry(prev => ({
      ...prev,
      [style]: !prev[style]
    }));
  };

  const handleListType = (type) => {
    setEntry(prev => ({
      ...prev,
      listType: type
    }));
  };

  // Изменение цвета текста (выделенного или всего)
  const handleColorChange = (color) => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      document.execCommand('foreColor', false, color);
      setEntry(prev => ({
        ...prev,
        htmlContent: contentRef.current.innerHTML
      }));
    } else if (contentRef.current) {
      contentRef.current.style.color = color;
      setEntry(prev => ({
        ...prev,
        htmlContent: contentRef.current.innerHTML
      }));
    }
  };

  const handleDateChange = (e) => {
    setEntry(prev => ({
      ...prev,
      date: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowPreviewModal(true);
  };

  // Новый метод для финального сохранения после предпросмотра
  const handleFinalSubmit = async () => {
    if (isUploading) return;
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      if (!token) {
        navigate('/auth');
        return;
      }

      const formData = new FormData();
      formData.append('title', entry.title);
      // Очищаем htmlContent от col-resizer
      let htmlContent = entry.htmlContent;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.querySelectorAll('.col-resizer').forEach(el => el.remove());
      htmlContent = tempDiv.innerHTML;
      formData.append('content', htmlContent);
      formData.append('font_size', entry.fontSize);
      formData.append('text_align', entry.textAlign);
      if (entry.location) {
        formData.append('location[latitude]', entry.location.latitude);
        formData.append('location[longitude]', entry.location.longitude);
      }
      formData.append('date', entry.date);
      if (entry.coverImage) {
        formData.append('cover_image', entry.coverImage);
      } else if (entry.coverImagePath) {
        formData.append('cover_image', entry.coverImagePath);
      }
      if (entry.listType) {
        formData.append('list_type', entry.listType);
      }
      // Добавляем новые поля
      formData.append('hashtags', entry.hashtags);
      formData.append('is_public', entry.isPublic);

      const url = isEditMode 
        ? `http://localhost:8000/api/entries/${id}/` 
        : 'http://localhost:8000/api/entries/';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save entry');
      }

      setSuccess('Запись успешно сохранена!');
      setTimeout(() => {
        navigate(`/account/entries?date=${entry.date}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setShowPreviewModal(false);
    }
  };

  // Функция для отображения короткого превью контента
  const getShortHtml = (html, maxLen = 150) => {
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

  // Позволяет редактировать ширину столбцов таблицы через drag&drop
  useEffect(() => {
    const editor = contentRef.current;
    if (!editor) return;
    // Функция для добавления ресайзеров к таблицам
    const addTableResizers = () => {
      const tables = editor.querySelectorAll('table');
      tables.forEach(table => {
        // Удаляем старые ресайзеры
        table.querySelectorAll('.col-resizer').forEach(r => r.remove());
        const firstRow = table.rows[0];
        if (!firstRow) return;
        for (let i = 0; i < firstRow.cells.length; i++) {
          const cell = firstRow.cells[i];
          let resizer = document.createElement('div');
          resizer.className = 'col-resizer';
          resizer.style.position = 'absolute';
          resizer.style.top = '0';
          resizer.style.right = '-3px';
          resizer.style.width = '6px';
          resizer.style.height = '100%';
          resizer.style.cursor = 'col-resize';
          resizer.style.zIndex = '10';
          resizer.style.userSelect = 'none';
          resizer.style.background = 'transparent';
          resizer.onmousedown = function (e) {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.pageX;
            const startWidth = cell.offsetWidth;
            document.body.style.cursor = 'col-resize';
            function onMouseMove(ev) {
              const delta = ev.pageX - startX;
              const newWidth = Math.max(30, startWidth + delta);
              cell.style.width = newWidth + 'px';
              // Применить ширину ко всем ячейкам этого столбца
              for (let r = 0; r < table.rows.length; r++) {
                table.rows[r].cells[i].style.width = newWidth + 'px';
              }
            }
            function onMouseUp() {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              document.body.style.cursor = '';
            }
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          };
          // Обеспечить позиционирование
          cell.style.position = 'relative';
          cell.appendChild(resizer);
        }
      });
    };
    // Добавлять ресайзеры после каждого изменения html
    addTableResizers();
    // Также при клике внутри редактора (на случай вставки таблицы)
    editor.addEventListener('click', addTableResizers);
    return () => {
      editor.removeEventListener('click', addTableResizers);
    };
  }, [entry.htmlContent]);

  // Добавляем новые функции для выравнивания
  const handleTableAlign = (alignment) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const table = range.commonAncestorContainer.closest('table');
    
    if (!table) return;

    // Если курсор внутри ячейки таблицы
    const cell = range.commonAncestorContainer.closest('td, th');
    if (cell) {
      cell.style.textAlign = alignment;
      return;
    }

    // Если курсор перед таблицей
    table.style.marginLeft = alignment === 'left' ? '0' : 
                            alignment === 'center' ? 'auto' : 
                            alignment === 'right' ? 'auto' : '0';
    table.style.marginRight = alignment === 'left' ? 'auto' : 
                             alignment === 'center' ? 'auto' : 
                             alignment === 'right' ? '0' : 'auto';
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

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <AccountHeader />
      <div className="flex flex-1 h-screen">
        {/* Toolbar */}
        <aside className="sticky top-0 left-0 h-screen w-20 flex-shrink-0 card flex flex-col items-center gap-2 py-4">
          {/* Font size */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition"
            >
              <AiOutlineFontSize className="w-6 h-6" />
            </button>
            {showFontSizeMenu && (
              <div className="absolute left-12 z-10 mt-1 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-2">
                {['14px', '16px', '18px', '20px'].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      handleAlign('center');
                      setShowFontSizeMenu(false);
                    }}
                    className="block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Align */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAlignMenu(!showAlignMenu)}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
            >
              {ALIGN_ICONS.left}
            </button>
            {showAlignMenu && (
              <div className="absolute left-12 z-10 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => { handleAlign('left'); setShowAlignMenu(false); }}
                  className="block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                >
                  {ALIGN_ICONS.left}
                </button>
                <button
                  type="button"
                  onClick={() => { handleAlign('center'); setShowAlignMenu(false); }}
                  className="block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                >
                  {ALIGN_ICONS.center}
                </button>
                <button
                  type="button"
                  onClick={() => { handleAlign('right'); setShowAlignMenu(false); }}
                  className="block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                >
                  {ALIGN_ICONS.right}
                </button>
              </div>
            )}
          </div>
          {/* Style */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
            >
              <AiOutlineBold className="w-5 h-5" />
            </button>
            {showStyleMenu && (
              <div className="absolute left-12 z-10 mt-1 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => { handleAlign('bold'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded ${entry.isBold ? 'font-bold' : ''}`}
                >Жирный</button>
                <button
                  type="button"
                  onClick={() => { handleAlign('underline'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded ${entry.isUnderline ? 'underline' : ''}`}
                >Подчеркнутый</button>
                <button
                  type="button"
                  onClick={() => { handleAlign('strikeThrough'); setShowStyleMenu(false); }}
                  className={`block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded ${entry.isStrikethrough ? 'line-through' : ''}`}
                >Зачеркнутый</button>
              </div>
            )}
          </div>
          {/* List */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowListMenu(!showListMenu)}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
            >
              <AiOutlineUnorderedList className="w-5 h-5" />
            </button>
            {showListMenu && (
              <div className="absolute left-12 z-10 mt-1 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-2">
                <button
                  type="button"
                  onClick={() => { handleAlign('insertUnorderedList'); setShowListMenu(false); }}
                  className="block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                >
                  <AiOutlineUnorderedList className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => { handleAlign('insertOrderedList'); setShowListMenu(false); }}
                  className="block w-full text-left px-3 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                >
                  <AiOutlineOrderedList className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          {/* Color */}
          <input
            type="color"
            onChange={e => handleColorChange(e.target.value)}
            className="w-8 h-8 p-0 border-0 rounded cursor-pointer mt-2"
          />
          {/* Map button */}
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="mt-4 p-2 rounded transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Указать местоположение"
          >
            <FiMapPin className="w-6 h-6" color={isDarkMode ? '#fff' : '#333'} />
          </button>
          {/* Table button */}
          <button
            type="button"
            onClick={() => setShowTablePicker(v => !v)}
            className="mt-2 p-2 rounded transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Вставить таблицу"
          >
            <AiOutlineTable className="w-6 h-6" />
          </button>
          {showTablePicker && (
            <div className="absolute left-16 top-0 z-20 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg p-3 flex flex-col items-center">
              <div className="mb-2 text-xs text-neutral-700 dark:text-neutral-200">Выберите размер таблицы</div>
              <div className="flex flex-col gap-1">
                {[...Array(6)].map((_, r) => (
                  <div key={r} className="flex gap-1">
                    {[...Array(6)].map((_, c) => (
                      <div
                        key={c}
                        onMouseEnter={() => { setTableRows(r+1); setTableCols(c+1); }}
                        onClick={() => insertTable(r+1, c+1)}
                        className={`w-5 h-5 border ${r < tableRows && c < tableCols ? 'bg-blue-400' : 'bg-neutral-200 dark:bg-neutral-700'} cursor-pointer`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-700 dark:text-neutral-200">{tableRows} x {tableCols}</div>
              <button className="mt-2 text-xs text-blue-600 hover:underline" onClick={() => setShowTablePicker(false)}>Отмена</button>
            </div>
          )}
        </aside>

        {/* Main form */}
        <main className="flex-1 flex flex-col px-10 py-10 shadow-[inset_0px_0px_19px_4px_rgba(0,_0,_0,_0.1)]">
          <div className="w-full flex flex-col">
            {/* Первая строка: заголовок и дата */}
            <div className="flex items-end gap-4 mb-2">
              <div className="flex-1">
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Заголовок
                </label>
                <input
                  type="text"
                  id="title"
                  value={entry.title}
                  onChange={e => setEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex flex-col items-end">
                <label htmlFor="date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  id="date"
                  value={entry.date}
                  onChange={e => setEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white min-w-[140px]"
                  required
                />
              </div>
            </div>
            {/* Местоположение: просто текст справа под заголовком */}
            <div className="flex justify-end mb-6">
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                {entry.location && (entry.location.name || `${entry.location.latitude?.toFixed(4)}, ${entry.location.longitude?.toFixed(4)}`)}
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Содержание
                </label>
                <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-auto h-[50vh] dark:bg-neutral-800">
                  <div
                    ref={contentRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleTextChange}
                    placeholder="Напишите здесь..."
                    className="w-full h-full p-4 focus:outline-none bg-transparent dark:text-white"
                    style={{ minHeight: '300px' }}
                  />
                  <style>{`
                     .col-resizer:hover { background: #60a5fa33; }
                     .col-resizer { transition: background 0.2s; }
                     table, .entry-editor-content table { border: 2px solid #444 !important; border-collapse: collapse !important; }
                     table td, .entry-editor-content table td { border: 2px solid #444 !important; }
                   `}</style>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Обложка
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-32 border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    {entry.coverPreview ? (
                      <img
                        src={entry.coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block">
                      <span className="sr-only">Выберите изображение</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="block w-full text-sm text-neutral-500 dark:text-neutral-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          dark:file:bg-indigo-900 dark:file:text-indigo-300
                          hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRandomCover}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Случайная обложка
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать запись')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Выберите местоположение</h2>
              <button
                onClick={() => setShowMap(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 relative">
              <form onSubmit={handleLocalSearchSubmit} className="flex">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={handleLocalSearchChange}
                  onKeyDown={handleLocalKeyDown}
                  placeholder="Поиск места..."
                  className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
                >
                  Поиск
                </button>
              </form>
            </div>
            <div className="h-96 rounded-lg overflow-hidden">
              <YMaps>
                <Map
                  defaultState={{ center: mapCenter, zoom: 10 }}
                  state={{ center: mapCenter, zoom: 15 }}
                  width="100%"
                  height="100%"
                  onClick={handleMapClick}
                  instanceRef={mapRef}
                >
                  {entry.location && (
                    <Placemark geometry={[entry.location.latitude, entry.location.longitude]} />
                  )}
                </Map>
              </YMaps>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowMap(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно предпросмотра */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="zag text-xl">Сохранение записи</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Предпросмотр карточки записи */}
            <div className="card shadow-md rounded-3xl flex flex-col p-6 relative overflow-hidden mb-4">
              {entry.coverPreview && (
                <img
                  src={entry.coverPreview}
                  alt={entry.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              )}
              <div className="flex items-center justify-between mb-2 mt-2">
                <h2 className="text-2xl font-bold">{entry.title}</h2>
                {entry.location && (
                  <p className="text-gray-500 dark:text-gray-400">
                    <span className="text-gray-400 dark:text-gray-500">📍</span> {entry.location.name || `${entry.location.latitude?.toFixed(2) ?? ''}, ${entry.location.longitude?.toFixed(2) ?? ''}`}
                  </p>
                )}
              </div>
              <div 
                className="text-gray-600 dark:text-gray-300 mb-4"
                dangerouslySetInnerHTML={{ __html: getShortHtml(entry.htmlContent, 150) }}
              />
              
              <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center overflow-hidden flex-1 mr-3">
                  {/* Хэштеги в строку с эффектом затухания */}
                  {formatHashtags(entry.hashtags).length > 0 && (
                    <div className="flex items-center overflow-hidden">
                      <div className="flex items-center flex-nowrap overflow-hidden">
                        {formatHashtags(entry.hashtags).map((tag, index) => (
                          <span 
                            key={index} 
                            className={`text-xs whitespace-nowrap mr-2 ${getHashtagColorClass(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center flex-shrink-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Дополнительные поля для предпросмотра */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text block text-sm">
                  Хэштеги
                </label>
                <input
                  type="text"
                  value={entry.hashtags}
                  onChange={(e) => setEntry(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder="Введите хэштеги через запятую, например: мысли, вдохновение"
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Максимальная длина хэштега: {MAX_HASHTAG_LENGTH} символов. Чем длиннее хэштег, тем более серым он будет отображаться.
                </p>
              </div>
              
              <div className="flex items-center">
                <input
                  id="is-public"
                  type="checkbox"
                  checked={entry.isPublic}
                  onChange={(e) => setEntry(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-neutral-300 rounded"
                />
                <label htmlFor="is-public" className="ml-2 text">
                  Сделать запись публичной
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Назад к редактированию
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать запись')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryEditor;
