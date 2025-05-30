import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const LogoImage: React.FC<LogoProps> = ({ size = 'medium', withText = false }) => {
  const sizeClasses = {
    small: 'h-16',  // Increased from h-8
    medium: 'h-20', // Increased from h-12
    large: 'h-28',  // Increased from h-16
  };

  const textClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={sizeClasses[size]}>
        <img 
          src="/lovable-uploads/IMG_20250531_011258.png" 
          alt="MistryMate Logo" 
          className="h-full" 
        />
      </div>
      
      {withText && (
        <span className={`font-bold ${textClasses[size]} text-white`}>
          MistryMate
        </span>
      )}
    </div>
  );
};

export default LogoImage;
