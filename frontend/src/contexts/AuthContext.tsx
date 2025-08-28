import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
  updateUser: (userData: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, phone, preferences')
          .eq('id', session.user.id)
          .single();
        const loadedUser: User = {
          id: session.user.id,
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: profile?.phone || undefined,
          address: [],
          preferences: profile?.preferences || {
            theme: 'system',
            language: 'en',
            currency: 'INR',
            notifications: { email: true, sms: true, push: true }
          }
        };
        setUser(loadedUser);
        localStorage.setItem('user', JSON.stringify(loadedUser));
      }
      setIsLoading(false);
    };
    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, phone, preferences')
          .eq('id', session.user.id)
          .single();
        const loadedUser: User = {
          id: session.user.id,
          name: profile?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: profile?.phone || undefined,
          address: [],
          preferences: profile?.preferences || {
            theme: 'system',
            language: 'en',
            currency: 'INR',
            notifications: { email: true, sms: true, push: true }
          }
        };
        setUser(loadedUser);
        localStorage.setItem('user', JSON.stringify(loadedUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) throw new Error(error.message);
  };

  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: userData.email || '',
      password,
      options: {
        data: { name: userData.name || '' }
      }
    });
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: userData.name || '',
        preferences: {
          theme: 'system',
          language: 'en',
          currency: 'INR',
          notifications: { email: true, sms: true, push: true }
        }
      });
    }
    setIsLoading(false);
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      supabase.from('profiles').upsert({ id: user.id, name: updatedUser.name, preferences: updatedUser.preferences, phone: updatedUser.phone }).then(() => {});
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    if (user) {
      const newAddress: Address = {
        ...address,
        id: Date.now().toString()
      };
      const updatedUser = {
        ...user,
        address: [...(user.address || []), newAddress]
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      supabase.from('addresses').insert({
        user_id: user.id,
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.isDefault
      }).then(() => {});
    }
  };

  const updateAddress = (id: string, addressData: Partial<Address>) => {
    if (user && user.address) {
      const updatedAddresses = user.address.map(addr =>
        addr.id === id ? { ...addr, ...addressData } : addr
      );
      const updatedUser = { ...user, address: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      supabase.from('addresses').update({
        label: addressData.label,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        is_default: addressData.isDefault
      }).eq('user_id', user.id).then(() => {});
    }
  };

  const deleteAddress = (id: string) => {
    if (user && user.address) {
      const updatedAddresses = user.address.filter(addr => addr.id !== id);
      const updatedUser = { ...user, address: updatedAddresses };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      supabase.from('addresses').delete().eq('user_id', user.id).then(() => {});
    }
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (user) {
      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...preferences }
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      supabase.from('profiles').upsert({ id: user.id, preferences: updatedUser.preferences }).then(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      addAddress,
      updateAddress,
      deleteAddress,
      updatePreferences
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
