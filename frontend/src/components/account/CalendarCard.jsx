import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getToken, clearAuthData } from '../../utils/authUtils';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CalendarCard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [showYearSelect, setShowYearSelect] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        clearAuthData();
        navigate('/auth');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/entries/`, {
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
      
      const response = await fetch(`${API_BASE_URL}/api/entries/by_date/?date=${formattedDate}`, {
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
        navigate(`/account/entries?date=${formattedDate}`);
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
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm hover:bg-[var(--color-green)] hover:text-white
            ${isToday ? 'bg-[var(--color-green)] text-white' : 'px-4 py-2 bg-primary text-black dark:text-white rounded-full hover:bg-primary-dark'}
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

  return (
    <div className="card shadow-md rounded-2xl sm:rounded-3xl flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden w-full h-full min-h-[250px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-6 calendar-header gap-y-2 sm:gap-y-0">
        <div className="flex gap-2 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => setShowMonthSelect(!showMonthSelect)}
              className="text-lg sm:text-xl md:text-2xl font-bold hover:bg-neutral-200 dark-theme:hover:bg-neutral-700 px-2 sm:px-3 py-1 rounded-lg transition-colors"
            >
              {monthNames[selectedDate.getMonth()]}
            </button>
            {showMonthSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark-theme:bg-neutral-800 rounded-lg shadow-lg py-2 w-32 sm:w-48 z-10">
                {monthNames.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className="w-full text-left px-2 sm:px-4 py-2 hover:bg-neutral-100 dark-theme:hover:bg-neutral-700 text-sm sm:text-base"
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
              className="text-lg sm:text-xl md:text-2xl font-bold hover:bg-neutral-200 dark-theme:hover:bg-neutral-700 px-2 sm:px-3 py-1 rounded-lg transition-colors"
            >
              {selectedDate.getFullYear()}
            </button>
            {showYearSelect && (
              <div className="absolute top-full left-0 mt-1 bg-white dark-theme:bg-neutral-800 rounded-lg shadow-lg py-2 w-20 sm:w-32 z-10">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className="w-full text-left px-2 sm:px-4 py-2 hover:bg-neutral-100 dark-theme:hover:bg-neutral-700 text-sm sm:text-base"
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 min-h-[120px]">
        {generateCalendarDays()}
      </div>
      {loading && (
        <div className="text-center text-neutral-500 dark:text-neutral-400 mt-2 sm:mt-4 text-xs sm:text-base">
          Загрузка...
        </div>
      )}
      {error && (
        <p className="text-white dark:text-white mb-2 sm:mb-4 entry-location text-xs sm:text-base">
          {error}
        </p>
      )}
      {events.length === 0 && !loading && !error && (
        <div className="text-center text-neutral-500 dark:text-neutral-400 mt-2 sm:mt-4 text-xs sm:text-base">
          На выбранную дату записей нет
        </div>
      )}
    </div>
  );
};

export default CalendarCard; 