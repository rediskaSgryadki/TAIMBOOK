import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'; 
import FeedbackForm from './FeedbackForm';
import Modal from './ui/Modal';

const Footer = () => {
    const navigate = useNavigate();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const goToRegister = (e) => {
        e.preventDefault();
        navigate('/auth');
      };
    const handleOpenFeedbackModal = (e) => {
        e.preventDefault();
        setShowFeedbackModal(true);
    };
    const handleCloseFeedbackModal = () => {
        setShowFeedbackModal(false);
    };
  return (
    <footer className='pt-20 flex flex-col gap-y-5 card'>
        <div className='flex px-7 lg:px-10 pb-5 justify-between border-b-2 border-[var(--color-darkFiol)] dark:border-neutral-700'>
            <div><p className='zag text-xl md:text-3xl'>ТАЙМБУК</p></div>
            <div className='flex flex-col md:flex-row gap-x-5 gap-y-5'>
                <button onClick={handleOpenFeedbackModal} className='text text-end text-lg md:text-2xl dark:text-white hover:text-[var(--color-green)]'>Обратная связь</button>
                <a href="/about" className='text text-end text-lg md:text-2xl dark:text-white hover:text-[var(--color-green)]'>О нас</a>
                <button onClick={goToRegister} className='text-end text text-lg dark:text-white hover:text-[var(--color-green)]'>Войти<br className='block lg:hidden'></br>/Присоединиться</button>
            </div>
        </div>
        <div className='flex px-7 lg:px-10 justify-between'>
            <div><p className='text text-sm md:text-lg flex flex-col md:flex-row gap-x-2 mr-5 dark:text-white'>© 2020 - 2025 ТАЙМБУК</p></div>
            <div className='flex flex-col md:flex-row gap-x-5 gap-y-5'>
                <a href="/privacy-policy" className='text text-end text-sm dark:text-white hover:text-[var(--color-green)]'>Политика конфиденциальности</a>
                <a href="/user-agreement" className='text text-end text-sm dark:text-white hover:text-[var(--color-green)]'>Пользовательское соглашение</a>
            </div>
        </div>
        {showFeedbackModal && (
            <Modal onClose={handleCloseFeedbackModal}>
                <FeedbackForm onClose={handleCloseFeedbackModal} isAuthenticated={false} />
            </Modal>
        )}
    </footer>
  )
}

export default Footer