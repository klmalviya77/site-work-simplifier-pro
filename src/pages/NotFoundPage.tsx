
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import LogoImage from '@/components/LogoImage';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <LogoImage size="large" />
      
      <h1 className="text-4xl font-bold mt-6 mb-2">404</h1>
      <p className="text-xl mb-6">Page Not Found</p>
      
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <Button 
        onClick={() => navigate('/')}
        className="bg-mistryblue-500 hover:bg-mistryblue-600"
      >
        <Home size={16} className="mr-2" />
        Return to Home
      </Button>
    </div>
  );
};

export default NotFoundPage;
