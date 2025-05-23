import React from 'react'
import { useNavigate } from 'react-router-dom'; 
const Footer = () => {
    const navigate = useNavigate();

    const goToRegister = (e) => {
        e.preventDefault();
        navigate('/auth');
      };
  return (
    <footer className='pt-20 flex flex-col gap-y-5 card'>
        <div className='flex px-0 md:px-10 pb-5 justify-between border-b-2 border-[var(--color-darkFiol)] dark:border-neutral-700'>
            <div><p className='zag text-xl md:text-3xl dark:text-white'>ТАЙМБУК</p></div>
            <div className='flex flex-col md:flex-row gap-x-5 gap-y-5'>
                <a href="/" className='text text-lg md:text-2xl transition-transform duration-300 hover:scale-105 dark:text-white'>Обратная связь</a>
                <a href="/about" className='text text-lg md:text-2xl transition-transform duration-300 hover:scale-105 dark:text-white'>О нас</a>
                <button onClick={goToRegister} className='text text-lg md:text-2xl transition-transform duration-300 hover:scale-105 bg-transparent border-none p-0 cursor-pointer dark:text-white'>Войти/Присоединиться</button>
            </div>
        </div>
        <div className='flex px-0 md:px-10 justify-between'>
            <div><p className='text text-sm md:text-lg flex flex-col md:flex-row gap-x-2 mr-5 dark:text-white'>© 2020 - 2025 ТАЙМБУК</p></div>
            <div className='flex flex-col md:flex-row gap-x-5 gap-y-5'>
                <a href="/privacy-policy" className='text text-sm transition-transform duration-300 hover:scale-105 dark:text-white'>Политика конфиденциальности</a>
                <a href="/user-agreement" className='text text-sm transition-transform duration-300 hover:scale-105 dark:text-white'>Пользовательское соглашение</a>
            </div>
        </div>
    </footer>
  )
}

export default Footer