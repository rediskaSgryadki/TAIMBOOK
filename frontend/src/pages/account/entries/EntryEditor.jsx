import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AccountHeader from '../../../components/account/AccountHeader';
import axios from 'axios';
import { checkTokenValidity, getUserData, getToken } from '../../../utils/authUtils';
import { useTheme } from '../../../context/ThemeContext';
import { Editor } from '@tinymce/tinymce-react';
import { filterBadWords, hasBadWords } from '../../../utils/filterBadWords';
import LastEntryCard from '../../../components/account/LastEntryCard';
import AccountMenu from '../../../components/account/AccountMenu';

// Constants for hashtag formatting
const MAX_HASHTAG_LENGTH = 15;

const EntryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const [entry, setEntry] = useState({
    title: '',
    content: '',
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
  const [loading, setLoading] = useState(isEditMode);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const yandexApiKey = '27861ba2-1edf-4ada-9c93-c277cf2a043a';
  const mapRef = useRef(null);
  const { theme, isDarkMode } = useTheme();
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const editorRef = useRef(null);
  const [showBadWordsModal, setShowBadWordsModal] = useState(false);
  const [badWordsDetected, setBadWordsDetected] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      navigate('/auth');
      return;
    }
    if (!isEditMode) {
       checkTokenValidity(
        () => setLoading(false),
        (errorMsg) => {
          setError(errorMsg);
          setTimeout(() => navigate('/auth'), 2000);
        }
      );
    } else {
       checkTokenValidity(
        () => {},
        (errorMsg) => {
          setError(errorMsg);
          setTimeout(() => navigate('/auth'), 2000);
        }
      );
    }
  }, [navigate, isEditMode]);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!isEditMode) return;
      try {
        const token = getToken();
        if (!token) {
          navigate('/auth');
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/entries/${id}/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch entry');
        }
        const data = await response.json();
        setEntry(prev => ({
          ...prev,
          title: data.title || '',
          content: data.content || '',
          location: data.location || null,
          date: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          coverPreview: data.cover_image || null,
          coverImagePath: data.cover_image || null,
          hashtags: data.hashtags || '',
          isPublic: data.is_public || false,
        }));

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

  const fetchAddressByCoords = async (coords) => {
    if (!yandexApiKey) return '';
    try {
      const response = await fetch(`https://geocode-maps.yandex.ru/1.x/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: yandexApiKey,
          format: 'json',
          geocode: `${coords[1]},${coords[0]}`
        })
      });
      const data = await response.json();
      const firstResult = data.response.GeoObjectCollection.featureMember[0];
      if (firstResult) {
        return firstResult.GeoObject.metaDataProperty.GeocoderMetaData.text;
      }
    } catch {}
    return '';
  };

  const handleLocalSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!yandexApiKey) {
      setError('API-ключ Яндекс.Карт не задан. Обратитесь к администратору.');
      return;
    }
    try {
      const response = await fetch(`https://geocode-maps.yandex.ru/1.x/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apikey: yandexApiKey,
          format: 'json',
          geocode: localSearchQuery
        })
      });
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

  const handleLocalKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLocalSearchSubmit();
    }
  };

  const handleLocalSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
  };

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

    setError(''); // Clear previous errors
    setIsUploading(true); // Indicate processing

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const originalDataUrl = readerEvent.target.result;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 1000; // Max width for resized image
        const maxHeight = 1000; // Max height for resized image
        let width = img.width;
        let height = img.height;

        // Resize image if it exceeds max dimensions
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export canvas as JPEG with lower quality
        // Use file.type for the format, fallback to 'image/jpeg'
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = 0.8; // Compression quality (0.0 to 1.0)

        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new File object from the blob
            const compressedFile = new File([blob], file.name, { type: outputFormat, lastModified: Date.now() });

      setEntry(prev => ({
        ...prev,
              coverImage: compressedFile, // Use the compressed file for upload
              coverPreview: originalDataUrl // Use original Data URL for preview (or compressed Data URL if preferred)
            }));
          } else {
            setError('Ошибка при сжатии изображения.');
            setEntry(prev => ({ ...prev, coverImage: null, coverPreview: null }));
          }
          setIsUploading(false); // Processing finished
        }, outputFormat, quality);
      };

      img.onerror = () => {
        setError('Ошибка при загрузке изображения для сжатия.');
        setEntry(prev => ({ ...prev, coverImage: null, coverPreview: null }));
        setIsUploading(false); // Processing finished
      };

      img.src = originalDataUrl;
    };

    reader.onerror = () => {
      setError('Ошибка при чтении файла изображения.');
      e.target.value = '';
      setEntry(prev => ({ ...prev, coverImage: null, coverPreview: null }));
      setIsUploading(false); // Processing finished
    };

    reader.readAsDataURL(file);
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
      formData.append('title', filterBadWords(entry.title));
      formData.append('content', filterBadWords(editorRef.current?.getContent() || ''));
  
      if (entry.location) {
        formData.append('location', JSON.stringify(entry.location));
      }
      formData.append('date', entry.date);
      if (entry.coverImage) {
        formData.append('cover_image', entry.coverImage);
      } else if (entry.coverImagePath) {
        formData.append('cover_image', entry.coverImagePath);
      }
      formData.append('hashtags', entry.hashtags);
      formData.append('is_public', entry.isPublic);

      const url = isEditMode
        ? `${API_BASE_URL}/api/entries/${id}/`
        : `${API_BASE_URL}/api/entries/`;

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

  const getHashtagColorClass = (tag) => {
    const length = tag.length;
    if (length <= MAX_HASHTAG_LENGTH / 3) return 'text-gray-800 dark:text-gray-200';
    if (length <= (MAX_HASHTAG_LENGTH * 2) / 3) return 'text-gray-600 dark:text-gray-300';
    return 'text-gray-400 dark:text-gray-500';
  };

  const formatHashtags = (hashtagsString) => {
    if (!hashtagsString) return [];

    return hashtagsString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
      .map(tag => {
        if (!tag.startsWith('#')) tag = '#' + tag;

        if (tag.length > MAX_HASHTAG_LENGTH) {
          return tag.substring(0, MAX_HASHTAG_LENGTH) + '...';
        }
        return tag;
      });
  };

  // Проверка на нецензурные слова при изменении контента
  const handleEditorChange = (content, editor) => {
    if (hasBadWords(content)) {
      setBadWordsDetected(true);
      setShowBadWordsModal(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <AccountHeader />
      <AccountMenu/>
      <div className="flex flex-1 h-screen">
        <main className="flex-1 flex flex-col px-7 py-10 lg:px-10 fon shadow-[inset_0px_0px_12px_-5px_rgba(0,_0,_0,_0.8)]">
          <div className="w-full flex flex-col">
            <div className="flex items-end gap-4 mb-2">
              <div className="flex-1">
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Заголовок
                </label>
                <input
                  type="text"
                  id="title"
                  value={entry.title}
                  onChange={e => setEntry(prev => ({ ...prev, title: filterBadWords(e.target.value) }))}
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
            <div className="flex justify-end mb-6">
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                {entry.location && (entry.location.name || `${entry.location.latitude?.toFixed(4)}, ${entry.location.longitude?.toFixed(4)}`)}
              </div>
            </div>
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
              <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden h-[50vh] 2xl:h-[70vh] dark:bg-neutral-700">
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    // apiKey='hb6tf9tq88ffck9vy5v59t7b2imro2k1dbdgdkxm9cnpypll'
                    initialValue={entry.content}
                    init={{
                      base_url: '/tinymce',
                      language_url: '/tinymce/langs/ru.js',
                      language: 'ru',
                      skin_url: isDarkMode ? '/tinymce/skins/ui/tinymce-5-dark' : '/tinymce/skins/ui/tinymce-5',
                      content_css: isDarkMode ? '/tinymce/skins/content/dark/content.min.css' : '/tinymce/skins/content/default/content.min.css',
                      suffix: '.min',
                      external_plugins: {
                        accordion: '/tinymce/plugins/accordion/plugin.min.js',
                        advlist: '/tinymce/plugins/advlist/plugin.min.js',
                        autolink: '/tinymce/plugins/autolink/plugin.min.js',
                        lists: '/tinymce/plugins/lists/plugin.min.js',
                        link: '/tinymce/plugins/link/plugin.min.js',
                        image: '/tinymce/plugins/image/plugin.min.js',
                        charmap: '/tinymce/plugins/charmap/plugin.min.js',
                        preview: '/tinymce/plugins/preview/plugin.min.js',
                        anchor: '/tinymce/plugins/anchor/plugin.min.js',
                        searchreplace: '/tinymce/plugins/searchreplace/plugin.min.js',
                        visualblocks: '/tinymce/plugins/visualblocks/plugin.min.js',
                        fullscreen: '/tinymce/plugins/fullscreen/plugin.min.js',
                        insertdatetime: '/tinymce/plugins/insertdatetime/plugin.min.js',
                        media: '/tinymce/plugins/media/plugin.min.js',
                        help: '/tinymce/plugins/help/plugin.min.js',
                        wordcount: '/tinymce/plugins/wordcount/plugin.min.js',
                        emoticons: '/tinymce/plugins/emoticons/plugin.min.js',
                        table: '/tinymce/plugins/table/plugin.min.js',
                      },
                      height: '100%',
                      menubar: false,
                      branding: false,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                        'searchreplace', 'visualblocks', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount',
                        'emoticons'
                      ],
                      toolbar:
                        'undo redo | formatselect | bold italic backcolor | ' +
                        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | emoticons | link image media table mapButton | fullscreen | help',
                      content_style: isDarkMode
                        ? 'body { background-color: #262626; color: #fff; overflow-y: auto !important; }'
                        : 'body { background-color: #fff; color: #222; overflow-y: auto !important; }',
                      help_tabs: ['shortcuts', 'keyboardnav'],
                      statusbar: false,
                      setup: function(editor) {
                        editor.on('Change KeyUp', (e) => {
                          const content = editor.getContent({ format: 'text' });
                          if (hasBadWords(content)) {
                            setBadWordsDetected(true);
                            setShowBadWordsModal(true);
                          }
                        });
                        // Register the custom map icon
                        editor.ui.registry.addIcon('customMapIcon', '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-map" viewBox="0 0 16 16">\n  <path \n    fill-rule="evenodd" \n    d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z"\n    stroke="currentColor"\n    stroke-width="0.8"\n    stroke-linejoin="round"\n  />\n</svg>');

                        editor.ui.registry.addButton('mapButton', {
                          icon: 'customMapIcon',
                          onAction: function() {
                            setShowMap(true);
                          }
                        });
                      },
                      init_instance_callback: function (editor) {
                        editorRef.current = editor;
                      },
                    }}
                    onEditorChange={handleEditorChange}
                  />
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

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:text-white">
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

            <LastEntryCard entry={{
              ...entry,
              created_at: entry.date,
              content: editorRef.current?.getContent() || entry.content,
            }} onMore={() => setShowPreviewModal(false)} />

            <div className="space-y-4 mb-6 mt-6">
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
                  </div>
                </div>
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

      {showBadWordsModal && (
        <div className="fixed inset-0 px-7 lg:px-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]" style={{ zIndex: 2147483647 }}>
          <div className="lg:w-1/2 card p-10 shadow-xl rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-10">
            <img src="/img/Account/error, 404 _ dinosaur, animal, danger, warning, predator, dangerous, run away.webp" className='block lg:hidden' alt="" />
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-y-10">
                <h3 className="zag tracking-wider text-3xl text-center">Это Валера. За плохие слова его съел динозавр🥲</h3>
                <p className="text text-xl text-center">Пожалуйста, избегайте использования нежелательных слов, чтобы не оказаться на месте Валеры.</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setShowBadWordsModal(false)}
                  className="bg-[var(--color-green)] text font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-md"
                >
                  Понятно
                </button>
              </div>
            </div>
            <div>
              <img src="/img/Account/error, 404 _ dinosaur, animal, danger, warning, predator, dangerous, run away.webp" className='hidden lg:block' alt="" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryEditor;
