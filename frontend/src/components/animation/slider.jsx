import { motion } from "framer-motion";

const MobilePhotoMarquee = () => {
  const photos = [
    "/img/Home/emotion.webp",
    "/img/Home/kalendar.webp",
    "/img/Home/lenta.webp",
    "/img/Home/tegi.webp",
  ];

  // Рассчитываем общую ширину всех фото + зазоры
  const itemWidth = 200; // Ширина одного фото в px
  const gap = 20; // 1.25rem ≈ 20px (gap-5 в Tailwind)
  const totalWidth = photos.length * (itemWidth + gap);

  return (
    <div className="md:hidden h-[200px] overflow-hidden relative">
      <motion.div
        className="flex absolute top-0 left-0 h-full gap-5"
        initial={{ x: 0 }}
        animate={{
          x: -totalWidth, // Смещаем ровно на ширину одного набора
        }}
        transition={{
          duration: 10, // Регулируйте скорость здесь
          repeat: Infinity,
          repeatType: "loop", // Ключевой параметр
          ease: "linear",
        }}
      >
        {/* Дублируем фото 3 раза для плавного перехода */}
        {[...photos, ...photos, photos[0]].map((src, index) => (
          <div 
            key={`${src}-${index}`} 
            className="relative h-full w-[200px] flex-shrink-0"
          >
            <img
              src={src}
              className="h-full w-full object-cover"
              alt={`Бегущее фото ${index % photos.length + 1}`}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default MobilePhotoMarquee;
