import React from 'react'
import Header from '../components/Header'
import FadeInSection from "../components/animation/FadeInSection";
import Comments from '../components/Comments';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
const About = () => {
  return (
    <>
    <Helmet>
        <title>ТАЙМБУК - о нас</title>
    </Helmet>
    <div className="App min-h-screen ">
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
                    </div>
                </div>
                <img src="/img/Home/education, hobby _ library, read, book, notebook, woman.webp" alt="" className="absolute w-[20vh] left-2/3 top-[75vh] lg:w-[30vh] lg:top-[50vh] lg:left-[10vh] z-40"/>
            </section>

            <FadeInSection>
                <section className='grid grid-cols-1 md:grid-cols-2 gap-x-10 px-7 md:px-20 card'>
                    <div className='flex justify-center items-center'>
                        <div className='w-full md:w-1/2'>
                            <p className='text font-semibold text-2xl text-justify'>Мы верим, что каждый человек может управлять своим временем и достигать большего. Наша миссия - помочь вам организовать жизнь, сохранить важные моменты и поддерживать баланс между делами и отдыхом</p>
                        </div>
                    </div>
                    <div className='flex justify-end items-end'>
                        <img src="/img/Home/holidays _ vacation, sea, ocean, water, pool, floating, drink.webp" className='w-[50vh]' alt="" />
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection>
                <section className='grid grid-cols-1 md:grid-cols-2 gap-x-10 px-7 md:px-20'>
                    <div className='flex justify-start'>
                        <img src="/img/Home/web development _ website, webpage, browser, customization, team, design.webp" className='w-[50vh]' alt="" />
                    </div>
                    <div className='flex justify-center items-center'>
                        <div className='w-full md:w-1/2'>
                            <p className='text font-semibold text-2xl text-justify'>Открытость, забота о пользователях и стремление к развитию - вот что лежит в основе ТАЙМБУК. Мы уделяем внимание деталям, чтобы сделать ваш опыт максимально простым и вдохновляющим</p>
                        </div>
                    </div>
                </section>
            </FadeInSection>

            <FadeInSection>
                <section className='grid grid-cols-1 md:grid-cols-2 gap-x-10 px-7 md:px-20 card'>
                    <div className='flex justify-center items-center'>
                        <div className='w-full md:w-1/2'>
                            <p className='text font-semibold text-2xl text-justify'>Мы - команда энтузиастов, объединённых идеей сделать планирование легким и приятным. Каждый из нас - пользователь ТАЙМБУК, поэтому мы знаем, что важно для вас</p>
                        </div>
                    </div>
                    <div className='flex justify-end items-end'>
                        <img src="/img/Home/support _ people, team, group, man, woman, support team, service (1).webp" className='w-[50vh]' alt="" />
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

            <Footer />
        </div>
    </div>
    </>
  )
}

export default About