
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', withText = true }) => {
  const sizeClasses = {
    small: 'h-10 w-10',
    medium: 'h-13 w-13',
    large: 'h-17 w-17',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-mistryyellow-500 rounded-t-full w-full h-[60%] translate-y-[-10%]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[40%] flex items-center justify-center">
          <div className="bg-white w-[60%] h-[80%] flex items-center">
            <div className="bg-mistryblue-500 h-[40%] w-[60%]" />
          </div>
        </div>
      </div>
      
      {withText && (
        <span className={`font-bold ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-3xl'}`}>
          MistryMate
        </span>
      )}
    </div>
  );
};

export default Logo;
