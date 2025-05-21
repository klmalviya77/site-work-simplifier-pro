
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
      className={cn("feature-card", className)}
      onClick={onClick}
    >
      <Icon className="feature-card-icon" />
      <h3 className="font-medium text-center">{title}</h3>
    </div>
  );
};

export default FeatureCard;
