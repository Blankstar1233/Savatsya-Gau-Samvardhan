import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address[];
  preferences: UserPreferences;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'mr';
  currency: 'INR';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // On mount, check for JWT and fetch user info
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoading(true);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.email) {
            setUser({
              id: data.userId || '',
              name: data.name || data.email.split('@')[0] || 'User',
              email: data.email,
              preferences: data.preferences || {
                theme: 'system',
                language: 'en',
                currency: 'INR',
                notifications: { email: true, sms: true, push: true }
              },
              address: data.address || [],
            });
          } else {
            setUser(null);
            localStorage.removeItem('token');
          }
          setIsLoading(false);
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('token');
          setIsLoading(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('token', data.token);
    setUser({
      id: data.userId || '',
      name: data.name || email.split('@')[0] || 'User',
      email,
      preferences: data.preferences || {
        theme: 'system',
        language: 'en',
        currency: 'INR',
        notifications: { email: true, sms: true, push: true }
      },
      address: data.address || [],
    });
  };

  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userData.email, password })
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) throw new Error(data.error || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };


  // Address and preferences management would be implemented with backend endpoints

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
