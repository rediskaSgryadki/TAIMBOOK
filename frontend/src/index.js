import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import { getToken, clearAuthData } from './utils/authUtils';
import ErrorBoundary from './ErrorBoundary';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for authentication
axios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      console.log('Adding token to request:', config.url);
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Request headers after adding token:', config.headers);
    } else {
      console.log('No token found for request:', config.url);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      console.error('Failed URL:', error.config.url);
      clearAuthData();
      window.location.href = '/auth';
      return Promise.reject('Сессия истекла. Пожалуйста, войдите снова.');
    }

    let errorMessage = 'Произошла неизвестная ошибка.';
    if (error.response) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data) {
        try {
          const firstErrorValue = Object.values(error.response.data)[0];
          if (Array.isArray(firstErrorValue) && firstErrorValue.length > 0) {
            errorMessage = firstErrorValue[0];
          } else if (typeof firstErrorValue === 'string') {
            errorMessage = firstErrorValue;
          } else {
            errorMessage = JSON.stringify(error.response.data); 
          }
        } catch (e) {
          errorMessage = 'Ошибка формата ответа сервера.';
        }
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', error);
    return Promise.reject(errorMessage);
  }
);

// Apply standard theme on page load
const savedStandardTheme = localStorage.getItem('standard-theme') || 'light';
if (savedStandardTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
