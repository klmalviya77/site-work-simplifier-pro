
import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppBehavior } from '@/hooks/useAppBehavior';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const AppHeader = ({ title, showBack = false, onBack, actions, className = '' }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { triggerHaptic } = useAppBehavior();

  const handleBack = () => {
    triggerHaptic('light');
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBack && (
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="text-white p-2 mr-2 hover:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
