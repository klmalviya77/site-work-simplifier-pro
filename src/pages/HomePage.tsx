
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Plug, FileText, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import FeatureCard from '@/components/FeatureCard';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleCreateEstimate = (type: 'electrical' | 'plumbing') => {
    navigate('/create-estimate', { state: { estimateType: type } });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <LogoImage size="small" />
          {user && !user.isGuest && (
            <div className="text-sm">
              <p>Welcome, {user.name || 'Contractor'}</p>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Quick Estimate</h2>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard 
              title="Electrical Estimate" 
              icon={Plug}
              className="bg-gradient-to-br from-mistryblue-50 to-mistryblue-100 border-mistryblue-200 dark:bg-gradient-to-br dark:from-mistryblue-900/50 dark:to-mistryblue-800/50 dark:border-mistryblue-700"
              onClick={() => handleCreateEstimate('electrical')}
            />
            <FeatureCard 
              title="Plumbing Estimate" 
              icon={HardHat}
              className="bg-gradient-to-br from-mistryyellow-50 to-mistryyellow-100 border-mistryyellow-200 dark:bg-gradient-to-br dark:from-mistryyellow-900/50 dark:to-mistryyellow-800/50 dark:border-mistryyellow-700"
              onClick={() => handleCreateEstimate('plumbing')}
            />
          </div>
        </section>
        
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Tools & Resources</h2>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard 
              title="Saved Estimates" 
              icon={List}
              onClick={() => navigate('/saved')}
            />
            <FeatureCard 
              title="Material Guide" 
              icon={Search}
              onClick={() => navigate('/guide')}
            />
            <FeatureCard 
              title="Calculations" 
              icon={FileText}
              onClick={() => navigate('/calculator')}
            />
          </div>
        </section>
        
        {/* Call to Action */}
        {user?.isGuest && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-medium mb-2 dark:text-white">Save Your Work</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Create an account to save estimates and access all features.
            </p>
            <Button 
              className="w-full bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
              onClick={() => navigate('/login')}
            >
              Create Account
            </Button>
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default HomePage;
