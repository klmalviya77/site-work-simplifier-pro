
import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import LogoImage from '@/components/LogoImage';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  const handleCurrencyChange = (currency: string) => {
    toast({
      title: "Currency changed",
      description: `Currency set to ${currency}`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-mistryblue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto">
        {/* User Profile */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'Guest User'}</p>
                <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role || 'guest'}</p>
              </div>
              {!user?.isGuest && (
                <Button variant="outline" className="text-red-500" onClick={handleLogout}>
                  <LogOut size={16} className="mr-1" /> Logout
                </Button>
              )}
            </div>
            
            {user?.isGuest && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm mb-2">You're using MistryMate as a guest</p>
                <Button 
                  className="w-full bg-mistryblue-500 hover:bg-mistryblue-600"
                  onClick={() => window.location.href = '/login'}
                >
                  Create Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="INR" onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <LogoImage size="medium" />
              <p className="text-sm text-gray-500 mt-2">MistryMate v1.0.0</p>
              <p className="text-xs text-gray-400">Simplify Your Site Work</p>
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
