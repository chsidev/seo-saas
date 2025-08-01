"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '@/lib/api';
import { getToken, setToken, removeToken } from '@/lib/auth';
import toast from 'react-hot-toast';
import { User, RegisterData, AuthContextType } from '@/lib/types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api.get('/auth/me')
      .then(res => {
        console.log('[AuthProvider] Loaded user:', res.data);
        if (isMounted) setUser(res.data);
      })
      .catch((err) => {
        console.error('[AuthProvider] Failed to load user:', err);
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);
    
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const userRes = await api.get('/auth/me');      
      // setToken(access_token);
      setUser(userRes.data);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register', data);
      // const { access_token, user } = response.data;      
      // setToken(access_token);
      // setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // removeToken();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post('/auth/reset-password', { email });
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('[AuthProvider] Failed to refresh user:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      resetPassword,
      refreshUser,
      isAuthenticated: !!user && !loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}