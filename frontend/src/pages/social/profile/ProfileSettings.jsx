import React, { useState, useEffect } from 'react'
import AccountHeader from '../../../components/account/AccountHeader'
import axios from 'axios'
import { getToken } from '../../../utils/authUtils'
import { useTheme } from '../../../context/ThemeContext'

const ProfileSettings = () => {
  const { themeFamily, isDarkMode, setThemeFamily } = useTheme();
  const [name, setName] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)
  const [activeSubSection, setActiveSubSection] = useState(null)

  const themes = [
    { 
      name: 'light', 
      label: 'Стандартная', 
      lightColors: ['#FFFFFF', '#393e46', '#4ade80'],
      darkColors: ['#333333', '#FFFFFF', '#22c55e']
    },
    { 
      name: 'SmokyGarden', 
      label: 'Дымчатый сад', 
      lightColors: ['#c3dbd9', '#394c58', '#bfd397'],
      darkColors: ['#5d7682', '#FFFFFF', '#869c68'] 
    },
    { 
      name: 'BluePages', 
      label: 'Синие страницы', 
      lightColors: ['#c4e0f3', '#2c4b66', '#cad9bc'],
      darkColors: ['#2a537a', '#FFFFFF', '#a3b287']
    },
    { 
      name: 'MidnightEntries', 
      label: 'Полуночные записи', 
      lightColors: ['#abbccd', '#2b313c', '#f9dece'],
      darkColors: ['#2e3240', '#FFFFFF', '#e5b9a0']
    },
    { 
      name: 'PastelEntries', 
      label: 'Пастельные записи', 
      lightColors: ['#d9daec', '#5d5e6f', '#e1d7ca'],
      darkColors: ['#7a7b8f', '#FFFFFF', '#bdb3a6']
    }
  ];

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
      setActiveSubSection(null);
    } else {
      setActiveSection(section);
      setActiveSubSection(null);
    }
  };

  const toggleSubSection = (subsection) => {
    if (activeSubSection === subsection) {
      setActiveSubSection(null);
    } else {
      setActiveSubSection(subsection);
    }
  };

  useEffect(() => {
    // Fetch current user data
    const fetchUserData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setErrorMessage('Требуется авторизация');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(response.data);
        setName(response.data.username || '');
        setPhotoPreview(response.data.profile_photo || '');
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        setErrorMessage('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleThemeChange = (themeName) => {
    setThemeFamily(themeName);
    setSuccessMessage('Тема успешно изменена');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      const token = getToken();
      const formData = new FormData();
      
      formData.append('username', name);
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      
      await axios.patch('http://localhost:8000/api/users/profile/update/', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessMessage('Профиль успешно обновлен');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      setErrorMessage('Не удалось обновить профиль. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AccountHeader />
        <div className="flex justify-center items-center h-screen">
          <div className="loader">
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AccountHeader/>
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Personal Information Section (with sub-sections) */}
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div 
                onClick={() => toggleSection('personal')} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
              >
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <svg className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'personal' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {activeSection === 'personal' && (
                <div className="border-t">
                  {/* Username Sub-section */}
                  <div className="border-b">
                    <div 
                      onClick={() => toggleSubSection('username')} 
                      className="p-3 pl-8 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
                    >
                      <h3 className="text-lg font-medium">Имя пользователя</h3>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${activeSubSection === 'username' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {activeSubSection === 'username' && (
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                              Имя пользователя
                            </label>
                            <input
                              id="name"
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500 focus:z-10 sm:text-sm"
                              placeholder="Ваше имя"
                              required
                            />
                          </div>
                          <button 
                            onClick={handleSubmit}
                            className="py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                          >
                            Сохранить имя
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Photo Sub-section */}
                  <div>
                    <div 
                      onClick={() => toggleSubSection('photo')} 
                      className="p-3 pl-8 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
                    >
                      <h3 className="text-lg font-medium">Фото профиля</h3>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${activeSubSection === 'photo' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {activeSubSection === 'photo' && (
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {photoPreview ? (
                              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-4xl">👤</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Загрузить новое фото</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="block w-full text-sm border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                            />
                            <p className="mt-1 text-sm opacity-70">PNG, JPG размером до 2MB</p>
                            <button 
                              onClick={handleSubmit}
                              className="mt-4 py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                            >
                              Сохранить фото
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme Selection Section */}
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div 
                onClick={() => toggleSection('theme')} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
              >
                <h2 className="text-xl font-semibold">Выбор темы</h2>
                <svg className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'theme' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {activeSection === 'theme' && (
                <div className="p-6 border-t">
                  <p className="mb-4 text-sm opacity-80">
                    Выберите основную тему. Для переключения между светлой и темной версией используйте кнопку в верхнем меню.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themes.map((theme) => (
                      <div 
                        key={theme.name}
                        onClick={() => handleThemeChange(theme.name)}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                          themeFamily === theme.name ? 'border-lime-500 shadow-md' : 'border-gray-200'
                        }`}
                      >
                        <div className="mb-3">
                          <span className="font-medium">{theme.label}</span>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2">🌞</div>
                            <div className="flex">
                              <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: theme.lightColors[0] }}></div>
                              <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: theme.lightColors[1] }}></div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.lightColors[2] }}></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-4 h-4 mr-2">🌙</div>
                            <div className="flex">
                              <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: theme.darkColors[0] }}></div>
                              <div className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: theme.darkColors[1] }}></div>
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.darkColors[2] }}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full h-20 rounded overflow-hidden flex mt-2">
                          <div className="w-1/2 h-full p-1">
                            <div className="w-full h-full rounded" style={{ backgroundColor: theme.lightColors[0] }}>
                              <div className="w-1/2 h-1/2 rounded m-2" style={{ backgroundColor: theme.lightColors[2] }}></div>
                            </div>
                          </div>
                          <div className="w-1/2 h-full p-1">
                            <div className="w-full h-full rounded" style={{ backgroundColor: theme.darkColors[0] }}>
                              <div className="w-1/2 h-1/2 rounded m-2" style={{ backgroundColor: theme.darkColors[2] }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileSettings;