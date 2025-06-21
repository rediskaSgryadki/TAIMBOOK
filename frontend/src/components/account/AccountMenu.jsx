import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import LogoutButton from './LogoutButton'
import { useNavigate } from 'react-router-dom'
import CalendarCard from './CalendarCard'

const menuWidth = 280 // Ширина меню в пикселях

const AccountMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const [showCalendarModal, setShowCalendarModal] = useState(false)

  return (
    <>
      {/* Кнопка для сворачивания/разворачивания меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Свернуть меню' : 'Развернуть меню'}
        className='fixed top-1/2 left-0 z-50 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-r-md px-3 py-2 text-sm font-semibold select-none'
        style={{
          transform: 'translateY(-50%)',
          left: isOpen ? menuWidth : 0,
          transition: 'left 0.3s ease',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {isOpen ? '←' : '→'}
      </button>

      {/* Само меню, которое анимировано сдвигается влево */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -menuWidth }}
        transition={{ type: 'tween', duration: 0.3 }}
        className='fixed top-0 shadow-[0px_4px_97px_0px_#000000] left-0 h-full card z-40 flex flex-col justify-between py-10 text-lg'
        style={{ width: menuWidth }}
      >
        <div>
          <p className='flex gap-x-2 w-full py-2 px-10 text-neutral-900 dark:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800 transition-colors relative'>
            💭
            <a href="/social" className="text dark:text-white">Сообщество</a>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            👤<a href="/account/profile" className="text dark:text-white">Профиль</a>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            🏠<a href="/account/home" className='text dark:text-white'>Главная</a>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            📝<a href="/account/new-entry" className='text dark:text-white'>Новая запись</a>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            😜<a href="/account/emotions" className='text dark:text-white'>Трекер эмоций</a>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            🗓
            <button
              type="button"
              className="text dark:text-white bg-transparent border-none p-0 cursor-pointer"
              onClick={() => setShowCalendarModal(true)}
            >
              Календарь
            </button>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            ⚙️<a href="/account/settings" className='text dark:text-white'>Настройки</a>
          </p>
          <p className='flex gap-x-2 w-full py-2 px-10 hover:bg-white dark:hover:bg-neutral-800 transition-colors'>
            🔙<button
              onClick={() => navigate(-1)}
              className='text bg-transparent border-none p-0'
              type='button'
            >
              Назад
            </button>
          </p>
        </div>
        <LogoutButton />
      </motion.div>

      {/* Модальное окно календаря */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-neutral-800 rounded-full shadow p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-2xl font-bold"
              aria-label="Закрыть календарь"
            >
              ×
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <CalendarCard />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AccountMenu
