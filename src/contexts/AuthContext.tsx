
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  continueAsGuest: () => {},
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for user data
    const storedUser = localStorage.getItem('mistryMateUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Store user in local storage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mistryMateUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('mistryMateUser');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Placeholder for actual login logic
    // In a real app, this would connect to a backend service
    setIsLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      setUser({
        id: 'user-' + Date.now().toString(),
        email,
        role: 'contractor',
        isGuest: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole, name?: string) => {
    // Placeholder for actual signup logic
    setIsLoading(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful signup
      setUser({
        id: 'user-' + Date.now().toString(),
        email,
        role,
        name,
        isGuest: false,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = () => {
    setUser({
      id: 'guest-' + Date.now().toString(),
      role: 'guest',
      isGuest: true,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
