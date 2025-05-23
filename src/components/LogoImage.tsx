
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const LogoImage: React.FC<LogoProps> = ({ size = 'medium', withText = true }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
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
          src="/lovable-uploads/35511a98-cc51-4178-89a8-8e46825e2f27.png" 
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
