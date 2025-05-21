
import React, { useState, useEffect } from 'react';
import LogoImage from './LogoImage';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [showTagline, setShowTagline] = useState<boolean>(false);
  
  useEffect(() => {
    // Show tagline after a short delay
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 500);
    
    // Complete splash screen after delay
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);
    
    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 bg-mistryblue-500 flex flex-col items-center justify-center z-50">
      <div className="animate-pulse-slow">
        <LogoImage size="large" />
      </div>
      
      {showTagline && (
        <p className="text-white mt-4 text-xl animate-fade-in">
          Simplify Your Site Work
        </p>
      )}
    </div>
  );
};

export default SplashScreen;
