
import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

const OfflineIndicator = ({ isOnline }: OfflineIndicatorProps) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-sm z-50 animate-slide-down">
      <div className="flex items-center justify-center">
        <WifiOff size={16} className="mr-2" />
        You're offline. Some features may not work.
      </div>
    </div>
  );
};

export default OfflineIndicator;
