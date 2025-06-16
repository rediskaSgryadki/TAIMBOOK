import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, clearAuthData, executeRequestWithTokenRefresh } from '../../utils/authUtils';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUser } from '../../context/UserContext';


// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL = process.env.REACT_APP_API_URL;

const EmotionCard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [emotions, setEmotions] = useState({ joy: 0, sadness: 0, neutral: 0 });
  const [runTour, setRunTour] = useState(true);
  const [error, setError] = useState('');

  const fetchEmotionStats = async () => {
    try {
      setError('');
      const response = await executeRequestWithTokenRefresh(async () => {
        const res = await fetch(`${API_BASE_URL}/api/emotions/stats/day/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          },
        });
        if (!res.ok) {
          throw new Error('Ошибка получения статистики эмоций');
        }
        return res.json();
      }, navigate);
      
      setEmotions(response);
    } catch (err) {
      setError('Ошибка получения статистики эмоций');
      console.error('Error fetching emotion stats:', err);
    }
  };

  useEffect(() => {
    fetchEmotionStats();
  }, []);

  const handleEmotionClick = async (emotion) => {
    try {
      setError('');
      console.log(`Posting emotion: ${emotion}`);
      
      // The backend only needs the emotion_type, it will auto-assign the user and timestamp
      const requestData = { 
        emotion_type: emotion
      };
      
      console.log('Request payload:', requestData);
      
      await executeRequestWithTokenRefresh(async () => {
        const response = await fetch(`${API_BASE_URL}/api/emotions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify(requestData)
        });
        
        // Log the response status for debugging
        console.log(`Emotion API response status: ${response.status}`);
        
        if (!response.ok) {
          // Try to get any error details from the response
          let errorData;
          try {
            errorData = await response.json();
            console.error('Error details:', errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          
          if ([401, 403].includes(response.status)) {
            throw new Error('Ошибка авторизации или доступа');
          } else if (response.status === 500) {
            throw new Error('Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.');
          } else {
            throw new Error('Ошибка сохранения эмоции');
          }
        }
        
        const data = await response.json();
        console.log('Emotion saved successfully:', data);
        return data;
      }, navigate);
      
      // If successful, fetch updated stats
      fetchEmotionStats();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения эмоции');
      console.error('Error saving emotion:', err);
    }
  };

  return (
    <div className="card rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col h-full min-h-[32vh] sm:min-h-[40vh] md:min-h-[50vh]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-4 gap-y-2 sm:gap-y-0">
        <h2 className="text-lg sm:text-xl font-bold">Эмоции сегодня</h2>
        <Link to="/account/emotions" className="text-primary hover:underline transition-colors text-xs sm:text-base">Подробнее</Link>
      </div>
      <div className="flex-1 min-h-[120px] sm:min-h-[180px] md:min-h-[220px]">
        <Pie
          data={{
            labels: ['Радость', 'Грусть', 'Нейтральный'],
            datasets: [{
              data: [emotions.joy, emotions.sadness, emotions.neutral],
              backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
              borderWidth: 2
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                displayColors: false,
                callbacks: {
                  label: function(context) {
                    let label = context.label || '';
                    let emoji = '';
                    if (label.includes('Радость')) emoji = '😃 ';
                    else if (label.includes('Грусть')) emoji = '☹️ ';
                    else if (label.includes('Нейтральный')) emoji = '😐 ';
                    label = emoji + label;
                    if (context.parsed !== null) label += ': ' + context.parsed;
                    return label;
                  }
                }
              }
            },
            animation: { duration: 1000 },
            layout: { padding: 10 }
          }}
          width={200}
          height={200}
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between mt-2 sm:mt-4 gap-y-2 sm:gap-y-0">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#22c55e] mr-2"></div>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Радость</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Грусть</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Нейтральный</span>
        </div>
      </div>
      <div className="flex justify-center gap-x-4 sm:gap-x-10 mt-4">
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
        <div className="mt-2 sm:mt-4 text-center text-red-600 bg-red-100 rounded-lg p-2 text-xs sm:text-base">
          {error}
        </div>
      )}
    </div>
  );
};

export default EmotionCard;
