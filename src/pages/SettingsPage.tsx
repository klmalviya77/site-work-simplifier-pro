
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Moon, Sun, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <LogoImage size="small" />
          <div className="text-sm">
            Settings
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account and app preferences
          </p>
        </div>
        
        {/* Profile Section */}
        {user && !user.isGuest && (
          <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <User size={20} className="mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium dark:text-white">Name</label>
                  <p className="text-gray-600 dark:text-gray-300">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-white">Email</label>
                  <p className="text-gray-600 dark:text-gray-300">{user.email || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* App Settings */}
        <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">App Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="mr-2 dark:text-white" />
                <span className="dark:text-white">Notifications</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? <Moon size={20} className="mr-2 dark:text-white" /> : <Sun size={20} className="mr-2 dark:text-white" />}
                <span className="dark:text-white">Dark Mode</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Support & Legal */}
        <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Support & Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <HelpCircle size={20} className="mr-2 dark:text-white" />
              <span className="dark:text-white">Help & Support</span>
            </button>
            
            <button className="flex items-center w-full text-left p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <Shield size={20} className="mr-2 dark:text-white" />
              <span className="dark:text-white">Privacy Policy</span>
            </button>
          </CardContent>
        </Card>
        
        {/* Account Actions */}
        {user && !user.isGuest ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
              >
                <User size={16} className="mr-2" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default SettingsPage;
