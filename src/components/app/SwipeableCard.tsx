
import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  className?: string;
}

const SwipeableCard = ({ children, onDelete, className = '' }: SwipeableCardProps) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === 0) return;
    
    const currentX = e.touches[0].clientX;
    const distance = startX - currentX;
    
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 80));
    }
  };

  const handleTouchEnd = () => {
    if (swipeDistance > 40 && onDelete) {
      onDelete();
    }
    setSwipeDistance(0);
    setStartX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {swipeDistance > 0 && onDelete && (
        <div 
          className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center text-white"
          style={{ width: `${swipeDistance}px` }}
        >
          <Trash2 size={20} />
        </div>
      )}
      
      <div
        ref={cardRef}
        className={`transition-transform duration-200 ${className}`}
        style={{ transform: `translateX(-${swipeDistance}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
