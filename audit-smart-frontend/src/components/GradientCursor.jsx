import { useEffect, useState } from 'react';
import './GradientCursor.css';

export default function GradientCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isInteractiveElement, setIsInteractiveElement] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if element is clickable or should be ignored
      const target = e.target;
      const isClickable = (
        window.getComputedStyle(target).getPropertyValue('cursor') === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button'
      );
      
      // Check if it's a star rating element
      const isStarRating = target.closest('.star-rating') !== null;
      
      setIsPointer(isClickable && !isStarRating);
      setIsInteractiveElement(isClickable || isStarRating);

      // Create new particles on movement (only when not over interactive elements)
      if (!isInteractiveElement && Math.random() > 0.7) {
        setParticles(prev => [
          ...prev.slice(-4),
          {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 4 + 2,
            color: `hsla(${Math.random() * 60 + 200}, 80%, 60%, 0.7)`
          }
        ]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isInteractiveElement]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.filter(p => Date.now() - p.id < 300));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div 
        className={`cursor ${isPointer ? 'pointer' : ''}`}
        style={{
          display: isInteractiveElement ? 'none' : 'block',
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: isPointer 
            ? 'linear-gradient(135deg, #6e48aa, #9d50bb)'
            : 'radial-gradient(circle, rgba(110,72,170,0.2) 0%, rgba(157,80,187,0) 70%)'
        }}
      />
      
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="cursor-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            transform: `translate(-50%, -50%)`,
            opacity: 0.6 - ((Date.now() - particle.id) / 1000)
          }}
        />
      ))}
    </>
  );
}