
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  icon: Icon, 
  onClick, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-5 bg-white border rounded-lg shadow-sm cursor-pointer transition-transform hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <Icon className="h-8 w-8 mb-3 text-mistryblue-500" />
      <h3 className="font-medium text-center">{title}</h3>
    </div>
  );
};

export default FeatureCard;
