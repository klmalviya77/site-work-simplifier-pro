
import React, { useEffect, useState } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure theme is only accessed after component mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    toast({
      title: "Theme changed",
      description: `Switched to ${checked ? 'dark' : 'light'} mode`,
    });
  };
  
  const handleCurrencyChange = (currency: string) => {
    toast({
      title: "Currency changed",
      description: `Currency set to ${currency}`,
    });
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 dark:bg-mistryblue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        {/* User Profile */}
        <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Profile</CardTitle>
            <CardDescription className="dark:text-gray-300">Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Guest User'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">{user?.role || 'guest'}</p>
              </div>
              {!user?.isGuest && (
                <Button variant="outline" className="text-red-500 dark:border-gray-600" onClick={handleLogout}>
                  <LogOut size={16} className="mr-1" /> Logout
                </Button>
              )}
            </div>
            
            {user?.isGuest && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm mb-2 dark:text-gray-300">You're using MistryMate as a guest</p>
                <Button 
                  className="w-full bg-mistryblue-500 hover:bg-mistryblue-600 dark:bg-mistryblue-600 dark:hover:bg-mistryblue-700"
                  onClick={() => window.location.href = '/login'}
                >
                  Create Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Appearance</CardTitle>
            <CardDescription className="dark:text-gray-300">Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun size={18} className="text-gray-700 dark:text-gray-300" />
                <Label htmlFor="theme-mode" className="dark:text-gray-300">Dark Mode</Label>
                <Moon size={18} className="text-gray-700 dark:text-white" />
              </div>
              <Switch 
                id="theme-mode" 
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency" className="dark:text-white">Currency</Label>
              <Select defaultValue="INR" onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="INR" className="dark:text-white dark:focus:bg-gray-700">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD" className="dark:text-white dark:focus:bg-gray-700">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR" className="dark:text-white dark:focus:bg-gray-700">Euro (€)</SelectItem>
                  <SelectItem value="GBP" className="dark:text-white dark:focus:bg-gray-700">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language" className="dark:text-white">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="en" className="dark:text-white dark:focus:bg-gray-700">English</SelectItem>
                  <SelectItem value="hi" className="dark:text-white dark:focus:bg-gray-700">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* About */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <LogoImage size="medium" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">MistryMate v1.0.0</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Simplify Your Site Work</p>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  );
};

export default SettingsPage;
