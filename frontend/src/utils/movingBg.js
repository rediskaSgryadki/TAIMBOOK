import { useRef, useState, useEffect } from 'react';

export function useMovingBg() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const animationRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xMove = (x / rect.width - 0.5) * 20;
    const yMove = (y / rect.height - 0.5) * 20;
    setTargetPosition({ x: xMove, y: yMove });
  };

  const handleMouseLeave = () => setTargetPosition({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      setMousePosition(prevPos => ({
        x: prevPos.x + (targetPosition.x - prevPos.x) * 0.2,
        y: prevPos.y + (targetPosition.y - prevPos.y) * 0.2
      }));
      animationRef.current = requestAnimationFrame(updatePosition);
    };
    animationRef.current = requestAnimationFrame(updatePosition);
    return () => animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [targetPosition]);

  return { ref, mousePosition, handleMouseMove, handleMouseLeave };
} 