
import { useState, useEffect } from 'react';

export const useAppBehavior = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const pullToRefresh = async (refreshCallback: () => Promise<void>) => {
    setIsRefreshing(true);
    triggerHaptic('light');
    try {
      await refreshCallback();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isOnline,
    isRefreshing,
    triggerHaptic,
    pullToRefresh
  };
};
