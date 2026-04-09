import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LoginResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: LoginResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: LoginResponse) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const persistUser = (user: LoginResponse | null) => {
  if (user) {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('password-warning-shown');
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const updateUser = (nextUser: LoginResponse) => {
    persistUser(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    persistUser(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      const response = await authService.getMe();
      updateUser(response.data);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) {
      setUser(JSON.parse(saved));
      void refreshUser();
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      updateUser(response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
