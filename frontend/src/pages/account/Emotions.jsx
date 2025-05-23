import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountHeader from '../../components/account/AccountHeader';
import Footer from '../../components/Footer';
import DayChart from '../../components/emotion/DayChart';
import WeekChart from '../../components/emotion/WeekChart';
import MonthChart from '../../components/emotion/MonthChart';
import { getToken, clearAuthData, executeRequestWithTokenRefresh } from '../../utils/authUtils';
import Joyride, { STATUS } from 'react-joyride';
import { useUser } from '../../context/UserContext';

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
  const [runTour, setRunTour] = useState(true);
  const navigate = useNavigate();
  
  // Добавляем состояния для эффекта слежения за мышью
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const welcomeRef = useRef(null);
  const animationRef = useRef(null);

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  const tourSteps = [
    {
      target: '.welcome-section',
      content: 'Выберите свою текущую эмоцию, нажав на соответствующую кнопку.',
      placement: 'bottom'
    },
    {
      target: '.day-chart',
      content: 'Эта диаграмма показывает ваши эмоции за день.',
      placement: 'bottom'
    },
    {
      target: '.week-chart',
      content: 'Эта диаграмма показывает ваши эмоции за неделю.',
      placement: 'bottom'
    },
    {
      target: '.month-chart',
      content: 'Эта диаграмма показывает ваши эмоции за месяц.',
      placement: 'bottom'
    }
  ];

  const handleEmotionClick = async (emotion) => {
    try {
      setError(null);
      setUpdatingCharts(true);
      
      await executeRequestWithTokenRefresh(async () => {
        const response = await fetch('http://localhost:8000/api/emotions/', {
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
    } catch (error) {
      console.error('Error saving emotion:', error);
      setError('Не удалось сохранить эмоцию. Попробуйте еще раз.');
      setUpdatingCharts(false);
    }
  };

  const fetchEmotionStats = async (setLoadingState = true) => {
    try {
      if (setLoadingState) {
        setLoading(true);
      }
      setError(null);
      
      const newStats = { ...emotions };
      
      const fetchPeriodStats = async (period) => {
        try {
          const response = await executeRequestWithTokenRefresh(async () => {
            const res = await fetch(`http://localhost:8000/api/emotions/stats/${period}/`, {
              headers: {
                'Authorization': `Bearer ${getToken()}`
              }
            });
            
            if (!res.ok) {
              throw new Error(`Failed to fetch ${period} stats`);
            }
            
            return res.json();
          }, navigate);
          
          const safeResponse = {
            joy: response?.joy || 0,
            sadness: response?.sadness || 0,
            neutral: response?.neutral || 0
          };
          
          return safeResponse;
        } catch (err) {
          console.error(`Error fetching ${period} stats:`, err);
          return { joy: 0, sadness: 0, neutral: 0 };
        }
      };
      
      newStats.day = await fetchPeriodStats('day');
      newStats.week = await fetchPeriodStats('week');
      newStats.month = await fetchPeriodStats('month');
      
      setEmotions(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Не удалось загрузить статистику эмоций.');
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
      setUpdatingCharts(false);
    }
  };

  useEffect(() => {
    fetchEmotionStats(true);
  }, []);

  // Создаем безопасные версии данных для диаграмм
  const safeData = {
    day: emotions.day || { joy: 0, sadness: 0, neutral: 0 },
    week: emotions.week || { joy: 0, sadness: 0, neutral: 0 },
    month: emotions.month || { joy: 0, sadness: 0, neutral: 0 }
  };

  // Функция для обработки движения мыши
  const handleMouseMove = (e) => {
    if (!welcomeRef.current) return;
    
    const rect = welcomeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Пересчитываем положение для более свободного движения
    const xMove = (x / rect.width - 0.5) * 20; // Увеличиваем амплитуду
    const yMove = (y / rect.height - 0.5) * 20;
    
    setTargetPosition({ x: xMove, y: yMove });
  };
  
  const handleMouseLeave = () => {
    // Плавно возвращаем к центру при уходе мыши
    setTargetPosition({ x: 0, y: 0 });
  };
  
  // Плавное обновление позиции для более гладкого движения
  useEffect(() => {
    const updatePosition = () => {
      setMousePosition(prevPos => {
        // Быстрая интерполяция текущей позиции к целевой
        const newX = prevPos.x + (targetPosition.x - prevPos.x) * 0.2; // Увеличиваем скорость следования
        const newY = prevPos.y + (targetPosition.y - prevPos.y) * 0.2;
        
        return { x: newX, y: newY };
      });
      
      animationRef.current = requestAnimationFrame(updatePosition);
    };
    
    animationRef.current = requestAnimationFrame(updatePosition);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <AccountHeader />
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={runTour}
        steps={tourSteps}
        showSkipButton
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#4ade80',
            backgroundColor: '#1e293b',
            textColor: '#f8fafc',
            borderRadius: '12px',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            width: '300px',
            height: 'auto'
          }
        }}
      />
      <div className="flex-1 overflow-hidden">
        <section className='flex flex-col gap-y-10 px-20 mt-10 h-full'>
          <div 
            ref={welcomeRef}
            className='card w-full py-20 rounded-full text-center welcome-section emotions-welcome-bg'
            style={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: `calc(50% + ${mousePosition.x}px) calc(50% + ${mousePosition.y}px)`,
              overflow: 'hidden'
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <h2 className="zag text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Трекер эмоций</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleEmotionClick('joy')}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
              >
                😊
              </button>
              <button
                onClick={() => handleEmotionClick('sadness')}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
              >
                😔
              </button>
              <button
                onClick={() => handleEmotionClick('neutral')}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer'
                }}
              >
                😐
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
            <div className="grid grid-cols-3 gap-x-6 relative">
              {updatingCharts && (
                <div className="absolute inset-0 bg-black bg-opacity-10 rounded-3xl flex items-center justify-center z-10">
                  <div className="bg-white dark:bg-neutral-800 p-3 rounded-full shadow-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                </div>
              )}
              <div className="card rounded-3xl p-8 flex flex-col h-[500px] day-chart">
                <DayChart data={safeData.day} />
              </div>
              <div className="card rounded-3xl p-8 flex flex-col h-[500px] week-chart">
                <WeekChart data={safeData.week} />
              </div>
              <div className="card rounded-3xl p-8 flex flex-col h-[500px] month-chart">
                <MonthChart data={safeData.month} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Emotions;
