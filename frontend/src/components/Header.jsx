import React from 'react'
import SideMenu from '../components/animation/menu';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className='md:px-20 top-0 flex flex-row justify-between w-full fixed bg-white/75 dark:bg-neutral-800/75 z-50 shadow-[0px_4px_46px_8px_rgba(0,_0,_0,_0.1)] items-center'>
        <a href='/' className='zag text-xl md:text-3xl text-neutral-900 dark:text-neutral-100'>ТАЙМБУК</a>
        <div className="flex items-center gap-x-4">
          <ThemeToggle />
          <SideMenu />
        </div>
    </header>
  )
}

export default Header