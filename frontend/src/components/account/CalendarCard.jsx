import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Joyride, { STATUS } from 'react-joyride';
import { getToken, clearAuthData } from '../../utils/authUtils';

const CalendarCard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runTour, setRunTour] = useState(true);
  const [showTourButton, setShowTourButton] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        clearAuthData();
        navigate('/auth');
        return;
      }
      const response = await fetch('http://localhost:8000/api/entries/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      console.log('Received events:', data);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [showYearSelect, setShowYearSelect] = useState(false);

  const handleDateSelect = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        clearAuthData();
        navigate('/auth');
        return;
      }
      // Format date as YYYY-MM-DD without timezone conversion
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      console.log('Fetching entries for date:', formattedDate);
      
      const response = await fetch(`http://localhost:8000/api/entries/by_date/?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.detail || 'Ошибка при загрузке записей');
      }

      const data = await response.json();
      console.log('Received events:', data);
      setEvents(data);
      
      if (data && data.length > 0) {
        navigate(`/account/EntriesList?date=${formattedDate}`);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err.message || 'Ошибка при загрузке записей');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm
            ${isToday ? 'bg-[var(--color-green)] text-white' : 'px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark'}
            transition-colors`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleMonthSelect = (monthIndex) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), monthIndex));
    setShowMonthSelect(false);
  };

  const handleYearSelect = (year) => {
    setSelectedDate(new Date(year, selectedDate.getMonth()));
    setShowYearSelect(false);
  };

  const tourSteps = [
    {
      target: '.calendar-header',
      content: 'Здесь вы можете выбрать месяц и год для просмотра записей',
      placement: 'bottom'
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  const startTour = () => {
    setRunTour(true);
  };

  return (
    <div className="card shadow-md rounded-3xl p-6 h-[55vh]">
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
      <div className="flex justify-between items-center mb-6 calendar-header">
        <div className="flex gap-4">
          <div className="relative">
            <button
              onClick={() => setShowMonthSelect(!showMonthSelect)}
              className="text-xl font-bold hover:bg-neutral-200 dark-theme:hover:bg-neutral-700 px-3 py-1 rounded-lg transition-colors"
            >
              {monthNames[selectedDate.getMonth()]}
            </button>
            {showMonthSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark-theme:bg-neutral-800 rounded-lg shadow-lg py-2 w-48 z-10">
                {monthNames.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark-theme:hover:bg-neutral-700"
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowYearSelect(!showYearSelect)}
              className="text-xl font-bold hover:bg-neutral-200 dark-theme:hover:bg-neutral-700 px-3 py-1 rounded-lg transition-colors"
            >
              {selectedDate.getFullYear()}
            </button>
            {showYearSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark-theme:bg-neutral-800 rounded-lg shadow-lg py-2 w-32 z-10">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark-theme:hover:bg-neutral-700"
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {generateCalendarDays()}
      </div>

      {loading && (
        <div className="text-center text-neutral-500 dark:text-neutral-400 mt-4">
          Загрузка...
        </div>
      )}

      {error && (
        <p className="text-white dark:text-white mb-4 entry-location">
          {error}
        </p>
      )}

      {events.length === 0 && !loading && !error && (
        <div className="text-center text-neutral-500 dark:text-neutral-400 mt-4">
          На выбранную дату записей нет
        </div>
      )}
    </div>
  );
};

export default CalendarCard; 