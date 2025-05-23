import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, clearAuthData, executeRequestWithTokenRefresh } from '../../utils/authUtils';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Joyride from 'react-joyride';
import { useUser } from '../../context/UserContext';


// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

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
        const res = await fetch('http://localhost:8000/api/emotions/stats/day/', {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
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
        const response = await fetch('http://localhost:8000/api/emotions/', {
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

  const tourSteps = [
    {
      target: '.emotion-chart',
      content: 'График эмоций за день. Показывает соотношение разных эмоций.',
      placement: 'bottom'
    },
    {
      target: '.emotion-buttons',
      content: 'Выберите свою текущую эмоцию. Это поможет отслеживать ваши настроения.',
      placement: 'bottom'
    },
    {
      target: '.emotions-link',
      content: 'Перейдите на страницу отслеживания эмоций для более подробного анализа.',
      placement: 'bottom'
    }
  ];

  return (
    <div className="card rounded-3xl shadow-md p-8 flex flex-col h-full">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        onFinished={() => setRunTour(false)}
        styles={{
          options: {
            primaryColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.95)',
            textColor: '#ffffff',
            width: 350,
            zIndex: 10000,
          },
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-primary">Эмоции</h3>
        <Link to="/account/emotions" className="px-5 py-2 bg-primary rounded-full text-white">Подробнее</Link>
      </div>

      <div className="mb-6">
        <Pie
          data={{
            labels: ['Радость', 'Грусть', 'Нейтральный'],
            datasets: [{
              data: [emotions.joy, emotions.sadness, emotions.neutral],
              backgroundColor: ['#FFCE56', '#FF6384', '#36A2EB'],
              borderWidth: 1
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                enabled: true
              }
            },
            animation: {
              duration: 1000
            },
            layout: {
              padding: 20
            }
          }}
          width={300}
          height={300}
        />
      </div>

      <div className="flex justify-center gap-x-10">
        <button
          onClick={() => handleEmotionClick('joy')}
          className="emotion-button joy"
        >
          😊
        </button>
        <button
          onClick={() => handleEmotionClick('sadness')}
          className="emotion-button sadness"
        >
          😔
        </button>
        <button
          onClick={() => handleEmotionClick('neutral')}
          className="emotion-button neutral"
        >
          😐
        </button>
      </div>

      {error && (
        <div className="mt-4 text-center text-red-600 bg-red-100 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default EmotionCard;
