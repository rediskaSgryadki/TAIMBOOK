import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AccountHeader from '../../../components/account/AccountHeader';
import axios from 'axios';
import { checkTokenValidity, getUserData, getToken, executeRequestWithTokenRefresh } from '../../../utils/authUtils';
import { useTheme } from '../../../context/ThemeContext';
import { Editor } from '@tinymce/tinymce-react';
import LastEntryCard from '../../../components/account/LastEntryCard';
import AccountMenu from '../../../components/account/AccountMenu';
import { Helmet } from 'react-helmet-async';
import HashtagList from '../../../components/ui/HashtagList';

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
  const userData = getUserData();
  const [showCustomImageModal, setShowCustomImageModal] = useState(false);
  const customImageInputRef = useRef();

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
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
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
      // Внимание: порядок координат — "долгота,широта"
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${coords[1]},${coords[0]}`;
      const response = await fetch(url);
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
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${encodeURIComponent(localSearchQuery)}`;
      const response = await fetch(url);
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

  const handlePublicToggle = () => {
    setEntry(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const handleHashtagsChange = (e) => {
    const value = e.target.value;
    setEntry(prev => ({ ...prev, hashtags: value }));
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
      const formData = new FormData();
      formData.append('title', entry.title);
      formData.append('content', entry.content); // Send the raw HTML content
  
      if (entry.location) {
        formData.append('location.latitude', entry.location.latitude);
        formData.append('location.longitude', entry.location.longitude);
        formData.append('location.name', entry.location.name);
      }
      formData.append('date', entry.date);
      // Only append cover_image if a new file has been selected
      if (entry.coverImage) {
        formData.append('cover_image', entry.coverImage);
      }
      formData.append('hashtags', entry.hashtags);
      formData.append('is_public', entry.isPublic);

      const url = isEditMode
        ? `${API_BASE_URL}/api/entries/${id}/`
        : `${API_BASE_URL}/api/entries/`;

      await executeRequestWithTokenRefresh(async () => {
        const token = getToken();
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
      }, navigate);

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
    // Разделяем по запятой и/или пробелу, убираем пустые
    return hashtagsString
      .split(/[,\s]+/)
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

  const handleEditorChange = (content, editor) => {
    setEntry(prev => ({ ...prev, content })); // Store raw HTML
  };

  const handleShowPreview = () => {
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  const handleForceSave = () => {
    handleFinalSubmit();
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (editorRef.current) {
        editorRef.current.insertContent(`<img src="${event.target.result}" alt="image" />`);
      }
      setShowCustomImageModal(false);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка...'
            : error
              ? 'Ошибка'
              : userData
                ? `${userData.username} — редактор записи`
                : 'Имя пользователя — редактор записи'}
        </title>
      </Helmet>
      <AccountHeader />
      <AccountMenu/>
      <div className='w-full space-y-10 h-screen mt-12 px-7 md:px-20'>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Заголовок</label>
              <input
                type="text"
                id="title"
                value={entry.title}
                onChange={e => {
                  const value = e.target.value;
                  setEntry(prev => ({ ...prev, title: value }));
                }}
                className="mt-1 block w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Дата</label>
              <input
                type="date"
                id="date"
                value={entry.date}
                onChange={handleDateChange}
                className="mt-1 block w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="content" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Содержание</label>
            <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden h-[50vh] 2xl:h-[70vh] dark:bg-neutral-700">
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                value={entry.content}
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
                    charmap: '/tinymce/plugins/charmap/plugin.min.js',
                    preview: '/tinymce/plugins/preview/plugin.min.js',
                    searchreplace: '/tinymce/plugins/searchreplace/plugin.min.js',
                    visualblocks: '/tinymce/plugins/visualblocks/plugin.min.js',
                    fullscreen: '/tinymce/plugins/fullscreen/plugin.min.js',
                    insertdatetime: '/tinymce/plugins/insertdatetime/plugin.min.js',
                    media: '/tinymce/plugins/media/plugin.min.js',
                    help: '/tinymce/plugins/help/plugin.min.js',
                    wordcount: '/tinymce/plugins/wordcount/plugin.min.js',
                    emoticons: '/tinymce/plugins/emoticons/plugin.min.js',
                    table: '/tinymce/plugins/table/plugin.min.js',
                    image: '/tinymce/plugins/image/plugin.min.js',
                  },
                  height: '100%',
                  menubar: false,
                  branding: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 
                    'charmap', 'preview',
                    'searchreplace', 'visualblocks', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount',
                    'emoticons',
                    'image',
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | ' +
                    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | emoticons | customImageUpload media table | fullscreen | help',
                  image_uploadtab: true,
                  image_urltab: false,
                  content_style: isDarkMode
                    ? 'body { background-color: #262626; color: #fff; overflow-y: auto !important; }'
                    : 'body { background-color: #fff; color: #222; overflow-y: auto !important; }',
                  help_tabs: ['shortcuts', 'keyboardnav'],
                  setup: function(editor) {
                    editor.ui.registry.addIcon('customImageIcon', '<svg width="20" height="20" fill="none" stroke="#222" stroke-width="4" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="8" stroke="#222" stroke-width="4" fill="none"/><path d="M14 20h2a2 2 0 0 0 2-2 2 2 0 0 1 2-2h8a2 2 0 0 1 2 2 2 2 0 0 0 2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V22a2 2 0 0 1 2-2z" stroke="#222" stroke-width="4" fill="none"/><circle cx="24" cy="27" r="4" stroke="#222" stroke-width="4" fill="none"/></svg>');
                    editor.ui.registry.addButton('customImageUpload', {
                      icon: 'customImageIcon',
                      tooltip: 'Добавить фото (кастом)',
                      onAction: function() {
                        setShowCustomImageModal(true);
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

          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать запись')}
            </button>
          </div>
        </form>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="zag text-xl">Сохранение записи</h2>
              <button
                onClick={handleClosePreview}
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
            }} onMore={handleClosePreview} />

            <div className="space-y-4 mb-6 mt-6">
              {/* Кнопка для добавления местоположения */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors mb-2"
                >
                  <svg className="inline w-5 h-5 mr-2 align-text-bottom" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.5.5 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103M10 1.91l-4-.8v12.98l4 .8zm1 12.98 4-.8V1.11l-4 .8zm-6-.8V1.11l-4 .8v12.98z" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/></svg>
                  Добавить местоположение
                </button>
                {entry.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Выбрано: {entry.location.name} ({entry.location.latitude}, {entry.location.longitude})</p>
                )}
              </div>
              {/* Cover Image in Preview Modal */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Обложка
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    style={{ display: 'none' }}
                    onChange={handleCoverImageChange}
                  />
                  <label
                    htmlFor="cover-upload"
                    className="w-32 h-32 border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 cursor-pointer hover:shadow-lg transition"
                    style={{ cursor: 'pointer' }}
                  >
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
                  </label>
                </div>
              </div>

              {/* Hashtags in Preview Modal */}
              <div>
                <label className="text block text-sm">
                  Хэштеги
                </label>
                <input
                  type="text"
                  value={entry.hashtags}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEntry(prev => ({ ...prev, hashtags: value }));
                  }}
                  placeholder="Введите хэштеги через запятую или пробел, например: мысли, вдохновение или привет пока"
                  className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Максимальная длина хэштега: {MAX_HASHTAG_LENGTH} символов. Чем длиннее хэштег, тем более серым он будет отображаться.
                </p>
                {/* Отображение разобранных хештегов */}
                <HashtagList hashtags={formatHashtags(entry.hashtags)} className="mt-2" />
              </div>

              {/* Public Toggle in Preview Modal */}
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
                onClick={handleClosePreview}
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

      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="zag text-xl">Выбор местоположения</h2>
              <button
                onClick={() => setShowMap(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={handleLocalSearchChange}
                    onKeyDown={handleLocalKeyDown}
                    placeholder="Поиск места..."
                    className="flex-1 p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleLocalSearchSubmit}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Найти
                  </button>
                </div>
                {entry.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Выбрано: {entry.location.name} ({entry.location.latitude}, {entry.location.longitude})</p>
                )}
                <div style={{ width: '100%', height: '400px' }}>
                  <YMaps query={{ apikey: yandexApiKey }}>
                    <Map
                      defaultState={{ center: mapCenter, zoom: 15 }}
                      state={{ center: mapCenter, zoom: 15 }} 
                      width="100%" height="100%"
                      onClick={handleMapClick}
                      instanceRef={mapRef}
                    >
                      {entry.location && <Placemark geometry={[entry.location.latitude, entry.location.longitude]} />} 
                    </Map>
                  </YMaps>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setShowMap(false)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {showCustomImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-6 w-full max-w-xs flex flex-col items-center">
            <h2 className="zag text-lg mb-4">Добавить фото</h2>
            <input
              type="file"
              accept="image/*"
              ref={customImageInputRef}
              style={{ display: 'none' }}
              onChange={handleCustomImageUpload}
            />
            <button
              type="button"
              className="w-40 h-40 border-2 border-dashed border-lime-500 rounded-lg flex flex-col items-center justify-center text-lime-600 bg-lime-50 hover:bg-lime-100 transition mb-4"
              onClick={() => customImageInputRef.current && customImageInputRef.current.click()}
            >
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-base font-medium">Выбрать файл</span>
            </button>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              onClick={() => setShowCustomImageModal(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EntryEditor;