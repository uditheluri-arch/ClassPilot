import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('classpilot_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on app initialization
  const initializeAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('classpilot_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setToken(storedToken);
    } catch {
      localStorage.removeItem('classpilot_token');
      localStorage.removeItem('classpilot_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async ({ role, identifier, password }) => {
    const data = await authService.login({ role, identifier, password });
    localStorage.setItem('classpilot_token', data.access_token);
    localStorage.setItem('classpilot_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    role: user?.role || null,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    refreshUser: initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
