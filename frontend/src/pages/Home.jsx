// frontend/src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';  // импортируем useNavigate
import ImageStack from '../components/animation/function';
import FadeInSection from "../components/animation/FadeInSection";
import MobilePhotoMarquee from "../components/animation/slider";
import Header from '../components/Header';
import Footer from '../components/Footer';
import Comments from '../components/Comments';
import { Helmet } from 'react-helmet-async';
const Home = () => {
  const navigate = useNavigate();
  return (
    <>
    <Helmet>
        <title>ТАЙМБУК</title>
    </Helmet>
      <div className="App min-h-screen overflow-x-hidden">
        <Header />
        <div className='space-y-56'>
            <section className="relative h-[100vh] overflow-visible">
                <img src="/img/Home/health _ zen, meditation, concentration, yoga, man, mental.webp" alt="" className="absolute w-[20vh] top-10 lg:w-[30vh] lg:right-[10vh] z-40"/>
                <div className="relative h-full">
                    <div className="bg-neutral-100 dark:bg-neutral-600 w-[100vh] h-[100vh] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-700 w-[75vh] h-[75vh] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"></div>
                    <div className="bg-neutral-300 dark:bg-neutral-800 w-[50vh] h-[50vh] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col justify-center items-center text-center px-2 gap-y-5 dark:text-white">
                        <h1 className='zag text-4xl'>ТАЙМБУК</h1>
                        <p className='text font-semibold text-2xl'>ваш личный дневник, помогающий структурировать мысли, фиксировать важные события и развивать себя каждый день</p>
                        <button className='py-5 px-10 bg-[var(--color-green)] rounded-full text text-2xl pulse-button' onClick={() => navigate('/auth')}>Присоединиться</button>
                    </div>
                </div>
                <img src="/img/Home/education, hobby _ library, read, book, notebook, woman.webp" alt="" className="absolute w-[20vh] left-2/3 top-[75vh] lg:w-[30vh] lg:top-[50vh] lg:left-[10vh] z-40"/>
            </section>

            <FadeInSection>
                <section className='grid grid-cols-2 gap-x-10 px-7 py-10 lg:py-0 lg:px-20 card'>
                    <div className='col-span-2 lg:col-span-1 lg:flex justify-center items-center'>
                        <div className='lg:w-1/2'>
                            <p className='text font-semibold text-2xl text-justify'>ТАЙМБУК — это идеальный помощник для тех, кто ценит свое время и хочет эффективно организовать личное пространство онлайн.</p>
                        </div>
                    </div>
                    <div className='hidden lg:flex justify-end items-end'>
                        <img src="/img/Home/workflow _ reminder, pin, notes, memo, office, to do, tasks .webp" className='w-[50vh]' alt="" />
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection>
                <section className='grid grid-rows-2 px-7 lg:px-20 gap-y-10'>
                    <div className='flex flex-col lg:grid gap-y-20 lg:grid-cols-2 px-0 lg:px-10 gap-x-20'>
                        <div className='flex flex-col lg:flex-row gap-y-5 gap-x-10'>
                            <svg width="100" height="100" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle r="15.9" cx="50%" cy="50%" fill="none" stroke="#86cfa3" strokeWidth="10" strokeDasharray="40 60" />
                                <circle r="15.9" cx="50%" cy="50%" fill="none" stroke="#a2c6e0" strokeWidth="10" strokeDasharray="30 70" strokeDashoffset="40" />
                                <circle r="15.9" cx="50%" cy="50%" fill="none" stroke="#ffc7ec" strokeWidth="10" strokeDasharray="30 70" strokeDashoffset="70" />
                            </svg>
                            <div className='space-y-5'>
                                <p className='zag text-lg lg:text-4xl tracking-widest'>Отслеживайте своё настроение</p>
                            </div>
                        </div>
                        <div className='flex flex-col lg:flex-row gap-y-5 gap-x-10'>
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#a2c6e0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <div className='space-y-5'>
                                <p className='zag text-lg lg:text-4xl tracking-widest'>Ищите свои записи по дате</p>
                            </div>
                        </div>
     
                    </div>

                    <div className='flex flex-col lg:grid gap-y-20 lg:grid-cols-2 px-0 lg:px-10 gap-x-20'>
                        <div className='flex flex-col lg:flex-row gap-y-5 gap-x-10'>
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#86cfa3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <line x1="4" y1="9" x2="20" y2="9" />
                                <line x1="4" y1="15" x2="20" y2="15" />
                                <line x1="10" y1="3" x2="8" y2="21" />
                                <line x1="16" y1="3" x2="14" y2="21" />
                            </svg>
                            <div className='space-y-5'>
                                <p className='zag text-lg lg:text-4xl tracking-widest'>Ищите записи сообщества по хэштегам</p>
                            </div>
                        </div>
                        <div className='flex flex-col lg:flex-row gap-y-5 gap-x-10'>
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffc7ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                            </svg>
                            <div className='space-y-5'>
                                <p className='zag text-lg lg:text-4xl tracking-widest'>Создавайте приватные и публичные записи</p>
                            </div>
                        </div>
                    </div>
                </section>

            </FadeInSection>

            <FadeInSection>
                <section className='flex flex-col gap-y-5'>
                    <h2 className='zag text-4xl text-center'>Ваши данные под надежной защитой</h2>
                    <p className='text font-semibold text-2xl text-center'>Мы обеспечиваем высокий уровень безопасности, <br></br>шифруя все данные и защищая вашу информацию от посторонних.</p>
                </section>
            </FadeInSection>

            <FadeInSection>
                <section className="grid grid-cols-2 gap-x-10 px-7 py-10 lg:py-0 lg:px-20 card">
                    <div className="col-span-2 lg:col-span-1 lg:flex justify-center items-center">
                        <div className="lg:w-1/2">
                        <p className="text font-semibold text-2xl text-justify">
                            Установите короткий PIN-код для защиты своего дневника. Эта функция позволяет быстро и надежно ограничить доступ к вашим записям, сохраняя конфиденциальность личной информации.
                        </p>
                        </div>
                    </div>
                    <div className="hidden lg:flex justify-end items-end">
                        <img src="/img/Home/security, accounts _ lock, padlock, privacy, policy, shield, confirm, approve, complete.webp" className="w-[50vh]" alt=""/>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection>
                <section className='grid grid-cols-1 lg:grid-cols-2 gap-x-10 px-7 lg:px-20'>
                    <div className='flex justify-start'>
                        <img src="/img/Home/communication, social media _ confirm, share, sharing, image, photo, picture, checkmark.webp" className='w-[50vh]' alt="" />
                    </div>
                    <div className='flex justify-center items-center'>
                        <div className='lg:w-1/2'>
                            <p className='text font-semibold text-2xl text-justify'>В ТАЙМБУК вы можете легко обмениваться своими записями с друзьями и близкими, а также добавлять их в общую ленту сообщества. Эта функция позволяет делиться важными мыслями, идеями и моментами жизни, вдохновлять других и получать поддержку.</p>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection>
                <section className='flex flex-col gap-y-5'>
                    <h2 className='zag text-4xl text-center'>Отзывы пользователей</h2>
                    <p className='text font-semibold text-2xl text-center'>Тысячи людей уже выбрали ТАЙМБУК для личного роста <br></br> и организации жизни. Вот что они говорят:</p>
                    <Comments />
                </section>
            </FadeInSection>  

            <section className="relative overflow-visible card py-20 md:py-52 px-7 lg:px-20">
                <div className="flex flex-col gap-y-10 items-center md:relative">
                    <img src="/img/Home/accounts _ contract, document, profile, signature, policy, man, paper, page.webp" alt="" className='block md:hidden w-40' />
                    <img src="/img/Home/accounts _ contract, document, profile, signature, policy, man, paper, page.webp" alt="" className="hidden md:block absolute w-[20vh] bottom-[40vh] left-0 lg:w-[30vh] lg:top-[10vh] lg:left-[10vh] z-10"/>
                    <img src="/img/Home/business _ deal, contract, handshake, man, woman, agreement.webp" alt="" className="hidden md:block absolute w-[20vh] lg:w-[30vh] top-[40vh] right-0 lg:-top-[20vh] lg:right-[10vh] z-10"/>
                    <div className="lg:w-1/2 text-center text text-xl lg:text-2xl flex flex-col gap-y-5 items-center z-20 relative">
                        <p className='font-semibold'>Присоединяйтесь к ТАЙМБУК уже сегодня! Делитесь своими мыслями, обменивайтесь записями, вдохновляйтесь историями других и станьте частью дружного сообщества единомышленников!</p>
                        <button className='py-5 px-10 bg-[var(--color-green)] rounded-full text text-2xl pulse-button' onClick={() => navigate('/auth')}>Присоединиться</button>
                    </div>
                    <img src="/img/Home/business _ deal, contract, handshake, man, woman, agreement.webp" alt="" className='block md:hidden w-40' />
                </div>
            </section>  
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Home;
