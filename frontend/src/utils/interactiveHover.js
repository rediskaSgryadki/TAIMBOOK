/**
 * Добавляет интерактивный эффект при наведении, заставляя элементы реагировать на движение мыши
 * 
 * @param {string} selector - CSS-селектор для целевых элементов
 */
export const initInteractiveHover = (selector = '.emotions-welcome-bg, .account-welcome-bg') => {
  // Выбираем все элементы, соответствующие селектору
  const elements = document.querySelectorAll(selector);
  
  // Для каждого найденного элемента
  elements.forEach(element => {
    // Добавляем класс 'interactive-hover' для стилизации
    element.classList.add('interactive-hover');
    
    // Добавляем обработчик события движения мыши по элементу
    element.addEventListener('mousemove', (e) => {
      // Получаем размеры и позицию элемента относительно окна
      const { left, top, width, height } = element.getBoundingClientRect();
      
      // Вычисляем позицию мыши относительно элемента в диапазоне от -0.5 до 0.5
      const x = ((e.clientX - left) / width) - 0.5;
      const y = ((e.clientY - top) / height) - 0.5;
      
      // Задаём максимальные значения наклона и смещения
      const tiltAmount = 5; // Максимальный наклон в градусах
      const moveAmount = 10; // Максимальное смещение в пикселях
      
      // Применяем CSS трансформацию с перспективой, наклоном и смещением
      element.style.transform = `
        perspective(1000px) 
        rotateX(${y * -tiltAmount}deg) 
        rotateY(${x * tiltAmount}deg)
        translateX(${x * moveAmount}px)
        translateY(${y * moveAmount}px)
      `;
    });
    
    // При уходе курсора с элемента сбрасываем трансформацию к исходному состоянию
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateX(0) translateY(0)';
    });
  });
};

// Экспортируем функцию для удаления эффекта, если это потребуется
export const removeInteractiveHover = (selector = '.emotions-welcome-bg, .account-welcome-bg') => {
  // Выбираем все элементы по селектору
  const elements = document.querySelectorAll(selector);
  
  // Для каждого элемента
  elements.forEach(element => {
    // Удаляем класс 'interactive-hover'
    element.classList.remove('interactive-hover');
    // Сбрасываем стиль трансформации
    element.style.transform = '';
    
    // Клонируем элемент, чтобы удалить все добавленные обработчики событий
    const newElement = element.cloneNode(true);
    // Заменяем старый элемент клоном в DOM
    element.parentNode.replaceChild(newElement, element);
  });
};
