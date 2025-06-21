import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountHeader from '../../components/account/AccountHeader';
import DayChart from '../../components/emotion/DayChart';
import WeekChart from '../../components/emotion/WeekChart';
import MonthChart from '../../components/emotion/MonthChart';
import { getToken, executeRequestWithTokenRefresh } from '../../utils/authUtils';
import { useUser } from '../../context/UserContext';
import AccountMenu from '../../components/account/AccountMenu';
import { useMovingBg } from '../../utils/movingBg';
import { Helmet } from 'react-helmet-async';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Emotions = () => {
  const { user } = useUser();
  const [emotions, setEmotions] = useState({
    day: { joy: 0, sadness: 0, neutral: 0 },
    week: { joy: 0, sadness: 0, neutral: 0 },
    month: { joy: 0, sadness: 0, neutral: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [updatingCharts, setUpdatingCharts] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { ref: welcomeRef, mousePosition, handleMouseMove, handleMouseLeave } = useMovingBg();

  const [currentMonthStats, setCurrentMonthStats] = useState({ joy: 0, sadness: 0, neutral: 0 });
  const [allTimeStats, setAllTimeStats] = useState({ joy: 0, sadness: 0, neutral: 0 });
  const [lastMonthStats, setLastMonthStats] = useState({ joy: 0, sadness: 0, neutral: 0, month: null });

  const handleEmotionClick = async (emotion) => {
    try {
      setError(null);
      setUpdatingCharts(true);

      await executeRequestWithTokenRefresh(async () => {
        const response = await fetch(`${API_BASE_URL}/api/emotions/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ emotion_type: emotion })
        });

        if (!response.ok) {
          throw new Error('Failed to save emotion');
        }

        return response.json();
      }, navigate);

      await fetchEmotionStats(false);
      fetchCurrentMonthStats();
      fetchLastMonthStats();
      fetchAllTimeStats();
    } catch (error) {
      setError('Не удалось сохранить эмоцию. Попробуйте еще раз.');
      setUpdatingCharts(false);
    }
  };

  const fetchEmotionStats = async (setLoadingState = true) => {
    try {
      if (setLoadingState) setLoading(true);
      setError(null);

      const newStats = { ...emotions };

      const fetchPeriodStats = async (period) => {
        try {
          const response = await executeRequestWithTokenRefresh(async () => {
            const res = await fetch(`${API_BASE_URL}/api/emotions/stats/${period}/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
              },
            });

            if (!res.ok) throw new Error(`Failed to fetch ${period} stats`);
            return res.json();
          }, navigate);

          return {
            joy: response?.joy || 0,
            sadness: response?.sadness || 0,
            neutral: response?.neutral || 0
          };
        } catch {
          return { joy: 0, sadness: 0, neutral: 0 };
        }
      };

      newStats.day = await fetchPeriodStats('day');
      newStats.week = await fetchPeriodStats('week');
      newStats.month = await fetchPeriodStats('month');
      setEmotions(newStats);
    } catch {
      setError('Не удалось загрузить статистику эмоций.');
    } finally {
      if (setLoadingState) setLoading(false);
      setUpdatingCharts(false);
    }
  };

  const fetchCurrentMonthStats = async () => {
    try {
      const response = await executeRequestWithTokenRefresh(async () => {
        const res = await fetch(`${API_BASE_URL}/api/emotions/stats/current_month/`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
        });
        if (!res.ok) throw new Error('Failed to fetch current month stats');
        return res.json();
      }, navigate);
      setCurrentMonthStats({
        joy: response?.joy || 0,
        sadness: response?.sadness || 0,
        neutral: response?.neutral || 0
      });
    } catch {
      setCurrentMonthStats({ joy: 0, sadness: 0, neutral: 0 });
    }
  };

  const fetchAllTimeStats = async () => {
    try {
      const response = await executeRequestWithTokenRefresh(async () => {
        const res = await fetch(`${API_BASE_URL}/api/emotions/stats/all_time/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
        });
        if (!res.ok) throw new Error('Failed to fetch all time stats');
        return res.json();
      }, navigate);
      setAllTimeStats({
        joy: response?.joy || 0,
        sadness: response?.sadness || 0,
        neutral: response?.neutral || 0
      });
    } catch {
      setAllTimeStats({ joy: 0, sadness: 0, neutral: 0 });
    }
  };

  const fetchLastMonthStats = async () => {
    try {
      const response = await executeRequestWithTokenRefresh(async () => {
        const res = await fetch(`${API_BASE_URL}/api/emotions/stats/last_month/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
        });
        if (!res.ok) throw new Error('Failed to fetch last month stats');
        return res.json();
      }, navigate);
      setLastMonthStats({
        joy: response?.joy || 0,
        sadness: response?.sadness || 0,
        neutral: response?.neutral || 0,
        month: response?.month || null
      });
    } catch {
      setLastMonthStats({ joy: 0, sadness: 0, neutral: 0, month: null });
    }
  };

  useEffect(() => {
    fetchEmotionStats(true);
    fetchCurrentMonthStats();
    fetchLastMonthStats();
    fetchAllTimeStats();
  }, []);

  const safeData = {
    day: emotions.day || { joy: 0, sadness: 0, neutral: 0 },
    week: emotions.week || { joy: 0, sadness: 0, neutral: 0 },
    month: emotions.month || { joy: 0, sadness: 0, neutral: 0 }
  };

  return (
    <>
      <Helmet>
        <title>
          {loading
            ? 'Загрузка...'
            : error
              ? 'Ошибка'
              : user
                ? `${user.username} - трекер эмоций`
                : 'Имя пользователя - трекер эмоций'}
        </title>
      </Helmet>
    <div className="h-screen flex flex-col">
      <AccountHeader />
      <div className="flex flex-grow w-full">
        <AccountMenu />
        <section className="flex flex-col flex-grow justify-center items-center gap-y-10 py-10 px-7 lg:px-20 shadow-[inset_0px_0px_12px_-5px_rgba(0,_0,_0,_0.8)]">
          <div
            ref={welcomeRef}
            className="card w-full py-10 2xl:py-20 rounded-2xl lg:rounded-full text-center welcome-section emotions-welcome-bg"
            style={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h2 className="zag text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold mb-2 sm:mb-4">Трекер эмоций</h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <button
                className="group hover:scale-110 transition-all duration-300"
                onClick={() => handleEmotionClick('joy')}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '10px 25px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
                title="Счастливая эмоция"
              >
                <p className="transition-all duration-300 rounded-full group-hover:scale-150 group-hover:shadow-md group-hover:bg-white/30">
                  😃
                </p>
              </button>
              <button
                className="group hover:scale-110 transition-all duration-300"
                onClick={() => handleEmotionClick('sadness')}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 25px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
                title="Грустная эмоция"
              >
                <p className="transition-all duration-300 rounded-full group-hover:scale-150 group-hover:shadow-md group-hover:bg-white/30">
                  ☹️
                </p>
              </button>
              <button
                className="group hover:scale-110 transition-all duration-300"
                onClick={() => handleEmotionClick('neutral')}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 25px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
                title="Нейтральная эмоция"
              >
                <p className="transition-all duration-300 rounded-full group-hover:scale-150 group-hover:shadow-md group-hover:bg-white/30">
                  😐
                </p>
              </button>
            </div>
            {error && (
              <div className="mt-4 text-red-500 bg-red-100 p-2 rounded-lg">
                {error}
              </div>
            )}
          </div>
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              <p className="mt-2">Загрузка данных...</p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative">
              {updatingCharts && (
                <div className="absolute inset-0 bg-black bg-opacity-10 rounded-3xl flex items-center justify-center z-10">
                  <div className="bg-white dark:bg-neutral-800 p-3 rounded-full shadow-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                </div>
              )}
              <div className="card rounded-3xl p-4 md:p-8 flex flex-col day-chart">
                <DayChart data={safeData.day} />
              </div>
              <div className="card rounded-3xl p-4 md:p-8 flex flex-col week-chart">
                <WeekChart data={safeData.week} />
              </div>
              <div className="card rounded-3xl p-4 md:p-8 flex flex-col month-chart">
                <MonthChart data={lastMonthStats} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
    </>
  );
};

export default Emotions;
