import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ImageStack = () => {
  const [activeId, setActiveId] = useState(null);
  const images = [
    { id: 1, src: "/img/Home/emotion.webp", description: "Отслеживание эмоций 😃" },
    { id: 2, src: "/img/Home/kalendar.webp", description: "Поиск записей по дате 🗓" },
    { id: 3, src: "/img/Home/lenta.webp", description: "Общая лента записей 📱" },
    { id: 4, src: "/img/Home/tegi.webp", description: "Поиск в ленте по хештегам #️⃣" }
  ];

  const imageSize = 400;
  const offset = 30;

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      padding: "50px 0",
      position: "relative",
      height: imageSize + offset * (images.length - 1) + 100,
      width: imageSize,
      margin: "0 auto"
    }}>
      <div style={{ position: "relative", width: imageSize, height: "100%" }}>
        {images.map((img, index) => (
          <motion.div
            key={img.id}
            style={{
              position: "absolute",
              zIndex: activeId === img.id ? 100 : images.length - index,
              cursor: "pointer",
              top: offset * index,
              left: offset * index,
              display: "inline-block",
              width: imageSize,
              boxSizing: "border-box"
            }}
            animate={{
              y: activeId === img.id ? -50 : 0,
            }}
            transition={{ type: "spring", stiffness: 300 }}
            onHoverStart={() => setActiveId(img.id)}
            onHoverEnd={() => setActiveId(null)}
          >
            <div style={{ position: "relative", width: "100%" }}>
              <img
                src={img.src}
                alt={`Image ${img.id}`}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  userSelect: "none"
                }}
              />

              <AnimatePresence>
                {activeId === img.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: "absolute",
                      right: "100%",
                      top: "0%",
                      transform: "translateX(40px) translateY(50%)",
                      width: "300px",
                      padding: "20px",
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      pointerEvents: "auto",
                      userSelect: "text",
                      textAlign: "center"
                    }}
                  >
                    {img.description}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ImageStack;
