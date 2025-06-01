
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole, name?: string, phoneNumber?: string) => Promise<void>;
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

// Define a type for the profile data we expect from Supabase
interface ProfileData {
  name?: string | null;
  phone_number?: string | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Set up auth state listener
  React.useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && session.user) {
          // Set user immediately with basic info to prevent UI blocks
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: 'contractor', // Default role
            isGuest: false,
          });
          
          // Then fetch profile data asynchronously without blocking UI
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('name, phone_number')
                .eq('id', session.user.id)
                .single();
  
              if (!error && profileData) {
                const profile = profileData as ProfileData;
                
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                  role: 'contractor', // Default role
                  name: profile.name || undefined,
                  isGuest: false,
                });
              }
            } catch (error) {
              console.error("Error fetching profile:", error);
              // Keep the basic user info we already set
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          // Set user immediately with basic info
          setUser({
            id: session.user.id,
            email: session.user.email,
            role: 'contractor', // Default role
            isGuest: false,
          });
          
          // Fetch profile data asynchronously
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('name, phone_number')
            .eq('id', session.user.id)
            .single();

          if (!error && profileData) {
            const profile = profileData as ProfileData;
            
            setUser({
              id: session.user.id,
              email: session.user.email,
              role: 'contractor',
              name: profile.name || undefined,
              isGuest: false,
            });
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false); // Ensure loading state is reset on error
      throw error;
    }
    // Don't set isLoading to false here - the auth state listener will handle that
  };

  const signup = async (email: string, password: string, role: UserRole, name?: string, phoneNumber?: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
            phone_number: phoneNumber || null,
            role,
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Signup failed:', error);
      setIsLoading(false); // Ensure loading state is reset on error
      throw error;
    }
    // Don't set isLoading to false here - the auth state listener will handle that
  };

  const continueAsGuest = () => {
    setUser({
      id: 'guest-' + Date.now().toString(),
      role: 'guest',
      isGuest: true,
    });
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
