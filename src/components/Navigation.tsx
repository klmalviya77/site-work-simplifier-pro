
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Settings, List, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Estimates', path: '/estimates', icon: FileText },
    { name: 'Saved', path: '/saved', icon: List },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  // Get current path to highlight active nav item
  const currentPath = window.location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around">
      {navItems.map((item) => (
        <Link 
          key={item.name} 
          to={item.path}
          className={cn(
            "flex flex-col items-center text-sm py-1 px-3 rounded-lg",
            currentPath === item.path ? "text-mistryblue-500" : "text-gray-500"
          )}
        >
          <item.icon size={20} />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
