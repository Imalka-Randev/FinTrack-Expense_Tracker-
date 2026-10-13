import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { getStoredToken } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user from token if available
  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (err) {
      console.warn('Authentication token invalid or expired:', err.message);
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for global 401 unauthorized events emitted by Axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('fintrack:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('fintrack:unauthorized', handleUnauthorized);
    };
  }, [checkAuth]);

  const login = async (email, password, remember = true) => {
    const { user: loggedInUser } = await authService.login({ email, password }, remember);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, email, password) => {
    return await authService.register({ name, email, password });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
