"use client"; // Для Next.js 13+
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom';
import { getUserData } from '../../utils/authUtils';

const SideMenu = () => {
  const userData = getUserData();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(prev => !prev);

  return (
    <div className="relative">
      {/* Кнопка меню */}
      <button
        onClick={toggleMenu}
        className="p-3 text-2xl transition-transform duration-300 hover:scale-105 dark:text-white"
      >
        {isOpen ? "✖" : "☰"}
      </button>

      {/* Затемнение фона */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Выдвижное меню */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 p-6"
          >
            <h2 className="text-2xl font-bold mb-8 dark:text-white">Меню</h2>
            <ul className="space-y-4">
              <li>
                <Link 
                  to={`/profile/${userData.username}`} 
                  onClick={toggleMenu}
                  className="block text-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-white"
                >
                  Мой профиль
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="block text-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-white"
                >
                  Настройки
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="block text-xl p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-white"
                >
                  Выйти
                </a>
              </li>
            </ul>
            <div className="absolute bottom-4 w-auto">
              <div className="w-full p-20 rounded-3xl bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 zag">
                Сообщество
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideMenu;
