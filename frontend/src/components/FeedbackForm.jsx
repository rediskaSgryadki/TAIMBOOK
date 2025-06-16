import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/authUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const FeedbackForm = ({ onClose, isAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/feedback/create/`, {
        email,
        subject,
        message,
      }, { headers });
      setSuccess(true);
      setEmail('');
      setSubject('');
      setMessage('');
      // Optionally close the modal after a short delay
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.detail || 'Failed to send feedback. Please try again.');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-block rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Обратная связь</h2>
      {success && <p className="text-green-500 text-center mb-4">Спасибо за ваш отзыв!</p>}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="email" className="block text-text-color mb-1">Ваш Email {isAuthenticated ? '(необязательно)' : '(обязательно)'}</label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-border-color rounded-md bg-transparent text-text-color"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@example.com"
            required={!isAuthenticated}
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject" className="block text-text-color mb-1">Тема</label>
          <input
            type="text"
            id="subject"
            className="w-full p-2 border border-border-color rounded-md bg-transparent text-text-color"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message" className="block text-text-color mb-1">Сообщение</label>
          <textarea
            id="message"
            className="w-full p-2 border border-border-color rounded-md bg-transparent text-text-color h-32 resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[var(--color-green)] text-white rounded-md hover:bg-[var(--color-green)] transition-colors"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm; 