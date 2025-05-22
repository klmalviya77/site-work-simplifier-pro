
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

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && session.user) {
          // Get user profile data
          const fetchUserProfile = async () => {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('name, phone_number')
              .eq('id', session.user.id)
              .single();

            if (!error && profileData) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                role: 'contractor', // Default role
                name: profileData.name,
                isGuest: false,
              });
            } else {
              // If profile not found, set user with basic info
              setUser({
                id: session.user.id,
                email: session.user.email,
                role: 'contractor',
                isGuest: false,
              });
            }
          };

          fetchUserProfile();
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        // Get user profile data
        supabase
          .from('profiles')
          .select('name, phone_number')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData, error }) => {
            if (!error && profileData) {
              setUser({
                id: session.user.id,
                email: session.user.email,
                role: 'contractor', // Default role
                name: profileData.name,
                isGuest: false,
              });
            } else {
              // If profile not found, set user with basic info
              setUser({
                id: session.user.id,
                email: session.user.email,
                role: 'contractor',
                isGuest: false,
              });
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

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
      throw error;
    } finally {
      setIsLoading(false);
    }
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
