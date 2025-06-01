
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Settings, List, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Create', path: '/create-estimate', icon: FileText },
    { name: 'Saved', path: '/saved', icon: List },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  // Get current path to highlight active nav item
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-1.5 px-3 flex justify-around">
      {navItems.map((item) => (
        <Link 
          key={item.name} 
          to={item.path}
          className={cn(
            "flex flex-col items-center text-xs py-1 px-2 rounded-lg",
            currentPath === item.path 
              ? "text-mistryblue-500 dark:text-mistryblue-400" 
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          <item.icon size={18} />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
