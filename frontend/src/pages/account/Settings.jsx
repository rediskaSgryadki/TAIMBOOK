import React, { useState, useEffect } from 'react'
import AccountHeader from '../../components/account/AccountHeader'
import axios from 'axios'
import { getToken, setAuthData, clearAuthData, executeRequestWithTokenRefresh, API_BASE_URL } from '../../utils/authUtils'
import { useTheme } from '../../context/ThemeContext'
import AccountMenu from '../../components/account/AccountMenu'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { Helmet } from 'react-helmet-async'
// Универсальный инпут с глазом
function PasswordInput({ id, label, value, onChange, show, setShow, placeholder, autoComplete = 'off' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{label}</label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white pr-10"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-0 flex items-center px-3 text-neutral-500 hover:text-indigo-700 dark:text-neutral-400 dark:hover:text-indigo-300 focus:outline-none"
          style={{ background: 'none', border: 'none' }}
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Скрыть' : 'Показать'}
        >
          {show ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>
    </div>
  );
}

// Универсальный текстовый инпут (без глаза)
function TextInput({ id, label, value, onChange, placeholder, autoComplete = 'off' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{label}</label>
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        required
        className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-indigo-500 dark:bg-neutral-700 dark:text-white"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

const ProfileSettings = () => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(null)
  const [activeSubSection, setActiveSubSection] = useState(null)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pinStep, setPinStep] = useState(1);
  const [pinOld, setPinOld] = useState('');
  const [pinCodeNew, setPinCodeNew] = useState('');
  const [pinCodeNewConfirm, setPinCodeNewConfirm] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPinOld, setShowPinOld] = useState(false);
  const [showPinCodeNew, setShowPinCodeNew] = useState(false);
  const [showPinCodeNewConfirm, setShowPinCodeNewConfirm] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

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

        const response = await executeRequestWithTokenRefresh(() =>
          axios.get(`${API_BASE_URL}/api/users/me/`,
            { headers: { Authorization: `Bearer ${token}` } }));
        
        setUserData(response.data);
        setName(response.data.username || '');
        setPhotoPreview(response.data.profile_photo_url || '');
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
        setErrorMessage(error?.response?.data?.detail || 'Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Original handleSubmit logic will be split into dedicated functions
  };

  const handleUpdateUsername = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('username', name);
      
      const response = await executeRequestWithTokenRefresh(() =>
        axios.patch(`${API_BASE_URL}/api/users/me/`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      );
      setUserData(response.data);
      setName(response.data.username || '');
      // Update user data in localStorage after successful username update
      setAuthData({ user: response.data });
      setSuccessMessage('Имя пользователя успешно обновлено');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка обновления имени пользователя:', error);
      setErrorMessage(error?.response?.data?.detail || 'Не удалось обновить имя пользователя. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      const token = getToken();
      const formData = new FormData();
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      
      const response = await executeRequestWithTokenRefresh(() =>
        axios.patch(`${API_BASE_URL}/api/users/me/`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      );
      setUserData(response.data);
      // Update photo preview with the new URL from the response
      setPhotoPreview(response.data.profile_photo_url ? `${API_BASE_URL}${response.data.profile_photo_url}` : '');
      // Update user data in localStorage after successful photo update
      setAuthData({ user: response.data });
      setSuccessMessage('Фото профиля успешно обновлено');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка обновления фото профиля:', error);
      setErrorMessage(error?.response?.data?.detail || 'Не удалось обновить фото профиля. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Пожалуйста, заполните все поля для смены пароля.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Новые пароли не совпадают.');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      await executeRequestWithTokenRefresh(() =>
        axios.post(`${API_BASE_URL}/api/users/change-password/`, {
          old_password: oldPassword,
          new_password: newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      setSuccessMessage('Пароль успешно изменён.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Clear auth data and redirect to login after successful password change
      clearAuthData();
      window.location.href = '/auth'; // Redirect to Auth.jsx
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.old_password?.[0] ||
        error?.response?.data?.new_password?.[0] ||
        error?.response?.data?.detail ||
        (typeof error?.response?.data === 'string' ? error.response.data : 'Не удалось сменить пароль. Пожалуйста, попробуйте позже.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOldPin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!pinOld) {
      setErrorMessage('Введите старый пин-код.');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const response = await executeRequestWithTokenRefresh(() =>
        axios.post(`${API_BASE_URL}/api/users/verify-pin/`, { pin_code: pinOld }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      if (response.data.status === 'success') {
        setPinStep(2);
      } else {
        setErrorMessage(response.data.detail || 'Неверный старый пин-код.');
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.detail || (typeof error?.response?.data === 'string' ? error.response.data : 'Ошибка проверки пин-кода.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!pinCodeNew || !pinCodeNewConfirm) {
      setErrorMessage('Пожалуйста, заполните новые поля пин-кода.');
      return;
    }
    if (pinCodeNew !== pinCodeNewConfirm) {
      setErrorMessage('Новые пин-коды не совпадают.');
      return;
    }
    if (pinCodeNew.length !== 4 || !/^[0-9]+$/.test(pinCodeNew)) {
      setErrorMessage('Новый пин-код должен состоять из 4 цифр.');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const payload = {
        old_pin: pinOld,
        pin_code: pinCodeNew,
        confirm_pin: pinCodeNewConfirm
      };
      await executeRequestWithTokenRefresh(() =>
        axios.post(`${API_BASE_URL}/api/users/set-pin/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      setSuccessMessage('Пин-код успешно изменён.');
      setPinOld('');
      setPinCodeNew('');
      setPinCodeNewConfirm('');
      setPinStep(1);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.new_pin?.[0] ||
        error?.response?.data?.detail ||
        (typeof error?.response?.data === 'string' ? error.response.data : 'Не удалось сменить пин-код. Пожалуйста, попробуйте позже.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearPin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!pinOld) {
      setErrorMessage('Введите старый пин-код для удаления.');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const payload = {
        old_pin: pinOld,
        pin_code: '',
        confirm_pin: ''
      };
      const response = await executeRequestWithTokenRefresh(() =>
        axios.post(`${API_BASE_URL}/api/users/set-pin/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      if (response.data.message) {
        // Обновляем локальные данные пользователя, чтобы отразить удаление PIN-кода
        const currentUserData = JSON.parse(sessionStorage.getItem('userData'));
        if (currentUserData) {
          currentUserData.has_pin = false;
          sessionStorage.setItem('userData', JSON.stringify(currentUserData));
          // Обновляем состояние пользователя в контексте
          if (userData && currentUserData.id === userData.id) {
            setUserData(currentUserData);
          }
        }

        setSuccessMessage('Пин-код успешно удален.');
        setPinOld('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.data.detail || 'Не удалось удалить пин-код.');
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.detail || (typeof error?.response?.data === 'string' ? error.response.data : 'Ошибка при удалении пин-кода.'));
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    localStorage.setItem('theme', newTheme);
    window.location.reload(); // Reload to apply theme immediately
  };

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
      setErrorMessage('');
      setSuccessMessage('');
      setLoading(true);
      try {
        const token = getToken();
        await executeRequestWithTokenRefresh(() =>
          axios.delete(`${API_BASE_URL}/api/users/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        clearAuthData();
        setSuccessMessage('Аккаунт успешно удален.');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } catch (error) {
        setErrorMessage(error?.response?.data?.detail || (typeof error?.response?.data === 'string' ? error.response.data : 'Не удалось удалить аккаунт.'));
      } finally {
        setLoading(false);
      }
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
      <Helmet>
        <title>
          {loading
            ? 'Загрузка...'
            : errorMessage
              ? 'Ошибка'
              : userData
                ? `${userData.username} - настройки`
                : 'Имя пользователя - настройки'}
        </title>
      </Helmet>
      <AccountHeader />
      <section className="container mx-auto px-4 py-8">
        <AccountMenu/>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {String(errorMessage)}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Имя пользователя */}
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div 
                onClick={() => toggleSection('username')} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
              >
                <h2 className="text-xl font-semibold">Имя пользователя</h2>
                <svg className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'username' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {activeSection === 'username' && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t">
                  <div className="space-y-4">
                    <div>
                      <TextInput
                        id="name"
                        label="Имя пользователя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                      />
                    </div>
                    <button 
                      onClick={handleUpdateUsername}
                      className="py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                    >
                      Сохранить имя
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Фото профиля */}
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div 
                onClick={() => toggleSection('photo')} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
              >
                <h2 className="text-xl font-semibold">Фото профиля</h2>
                <svg className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'photo' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {activeSection === 'photo' && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview}  className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="block w-full text-sm border border-gray-300 rounded-md cursor-pointer focus:outline-none"
                      />
                      <p className="mt-1 text-sm opacity-70">PNG, JPG размером до 2MB</p>
                      <button 
                        onClick={handleUpdatePhoto}
                        className="mt-4 py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                      >
                        Сохранить фото
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Смена пароля */}
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div 
                onClick={() => toggleSection('password')} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
              >
                <h2 className="text-xl font-semibold">Смена пароля</h2>
                <svg className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'password' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {activeSection === 'password' && (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t">
                  <div className="space-y-4">
                    <div>
                      <PasswordInput
                        id="oldPassword"
                        label="Старый пароль"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        show={showOldPassword}
                        setShow={setShowOldPassword}
                        placeholder="Введите старый пароль"
                      />
                    </div>
                    <div>
                      <PasswordInput
                        id="newPassword"
                        label="Новый пароль"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        show={showNewPassword}
                        setShow={setShowNewPassword}
                        placeholder="Введите новый пароль"
                      />
                    </div>
                    <div>
                      <PasswordInput
                        id="confirmPassword"
                        label="Повторите новый пароль"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        show={showConfirmPassword}
                        setShow={setShowConfirmPassword}
                        placeholder="Повторите новый пароль"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                    >
                      Сменить пароль
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pin Code Section */}
            {userData?.has_pin && (
            <div className="card rounded-lg shadow-md overflow-hidden">
              <div 
                  onClick={() => toggleSection('pin')} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
              >
                  <h2 className="text-xl font-semibold">Пин-код</h2>
                  <svg className={`w-5 h-5 transition-transform duration-300 ${activeSection === 'pin' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
                {activeSection === 'pin' && (
                <div className="p-6 border-t">
                    <div className="space-y-4">
                      {pinStep === 1 && (
                        <>
                          <div>
                            <div className="relative">
                              <PasswordInput
                                id="pinOld"
                                label="Старый пин-код"
                                value={pinOld}
                                onChange={e => setPinOld(e.target.value)}
                                show={showPinOld}
                                setShow={setShowPinOld}
                                placeholder="Старый пин-код"
                              />
                            </div>
                          </div>
                          <button
                            onClick={handleVerifyOldPin}
                            className="py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                          >
                            Далее
                          </button>
                        </>
                      )}
                      {pinStep === 2 && (
                        <>
                      <div>
                            <label htmlFor="pinCodeNew" className="block text-sm font-medium mb-1">
                          Введите новый пин-код
                        </label>
                            <div className="relative">
                              <PasswordInput
                                id="pinCodeNew"
                                label="Новый пин-код"
                                value={pinCodeNew}
                                onChange={e => setPinCodeNew(e.target.value)}
                                show={showPinCodeNew}
                                setShow={setShowPinCodeNew}
                          placeholder="Новый пин-код"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="pinCodeNewConfirm" className="block text-sm font-medium mb-1">
                              Повторите новый пин-код
                            </label>
                            <div className="relative">
                              <PasswordInput
                                id="pinCodeNewConfirm"
                                label="Повторите новый пин-код"
                                value={pinCodeNewConfirm}
                                onChange={e => setPinCodeNewConfirm(e.target.value)}
                                show={showPinCodeNewConfirm}
                                setShow={setShowPinCodeNewConfirm}
                                placeholder="Повторите новый пин-код"
                        />
                            </div>
                          </div>
                      <button 
                            onClick={handleChangePin}
                        className="py-2 px-4 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                      >
                        Сохранить пин-код
                      </button>
                        </>
                      )}
                      </div>
                  </div>
                )}
                </div>
              )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileSettings;