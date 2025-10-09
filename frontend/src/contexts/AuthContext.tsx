import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';


export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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
  updatePreferences: (prefs: UserPreferences) => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar'>>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, updates: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  deleteAccount: () => Promise<void>;
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
      fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Token invalid or expired');
          }
          return res.json();
        })
        .then(data => {
          if (data && data.email) {
            setUser({
              id: data.userId || '',
              name: data.name || data.email.split('@')[0] || 'User',
              email: data.email,
              avatar: data.avatar || null,
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
          // Token invalid or expired - clear it and remain logged out
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
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('token', data.token);
    // After login, fetch complete profile to ensure latest persisted data
    try {
      const meRes = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      const me = await meRes.json();
      if (meRes.ok && me && me.email) {
        setUser({
          id: me.userId || data.userId || '',
          name: me.name || me.email?.split('@')[0] || 'User',
          email: me.email || email,
          avatar: me.avatar || null,
          preferences: me.preferences || {
            theme: 'system',
            language: 'en',
            currency: 'INR',
            notifications: { email: true, sms: true, push: true }
          },
          address: me.address || [],
        });
      } else {
        setUser({
          id: data.userId || '',
          name: data.name || email.split('@')[0] || 'User',
          email,
          avatar: data.avatar || null,
          preferences: data.preferences || {
            theme: 'system',
            language: 'en',
            currency: 'INR',
            notifications: { email: true, sms: true, push: true }
          },
          address: data.address || [],
        });
      }
    } finally {
      setIsLoading(false);
    }
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

  // Preferences and profile management (client-side; can be wired to backend later)
  const updatePreferences = (prefs: UserPreferences) => {
    setUser(prev => prev ? { ...prev, preferences: prefs } : prev);
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preferences: prefs })
      }).catch(() => {});
    }
  };

  const updateUser = (updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar'>>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      }).catch(() => {});
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    setUser(prev => {
      if (!prev) return prev;
      const newAddress: Address = { id: `addr_${Date.now()}`, ...address };
      const addresses = [...(prev.address || [])];
      if (newAddress.isDefault) {
        addresses.forEach(a => (a.isDefault = false));
      }
      addresses.push(newAddress);
      return { ...prev, address: addresses };
    });
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: `addr_${Date.now()}`, ...address })
      }).catch(() => {});
    }
  };

  const updateAddress = (id: string, updates: Omit<Address, 'id'>) => {
    setUser(prev => {
      if (!prev) return prev;
      const addresses = (prev.address || []).map(a => {
        if (a.id !== id) return a;
        return { ...a, ...updates };
      });
      if (updates.isDefault) {
        addresses.forEach(a => { if (a.id !== id) a.isDefault = false; });
      }
      return { ...prev, address: addresses };
    });
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      }).catch(() => {});
    }
  };

  const deleteAddress = (id: string) => {
    setUser(prev => prev ? { ...prev, address: (prev.address || []).filter(a => a.id !== id) } : prev);
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  const deleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch('/api/user/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete account');
    }
    // Clear local state after successful deletion
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updatePreferences,
      updateUser,
      addAddress,
      updateAddress,
      deleteAddress,
      deleteAccount
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
