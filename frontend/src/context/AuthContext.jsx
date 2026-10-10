import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('medinear_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('medinear_token');
      if (storedToken) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('medinear_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const authData = await api.login({ email, password });
    localStorage.setItem('medinear_token', authData.token);
    setToken(authData.token);
    const currentUser = {
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };
    setUser(currentUser);
    return currentUser;
  };

  const register = async (userData) => {
    const authData = await api.register(userData);
    localStorage.setItem('medinear_token', authData.token);
    setToken(authData.token);
    const currentUser = {
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };
    setUser(currentUser);
    return currentUser;
  };

  const logout = () => {
    localStorage.removeItem('medinear_token');
    setToken(null);
    setUser(null);
  };

  // Demo helpers for instant testing
  const loginAsDemo = async (roleType) => {
    let email = 'user@medinear.com';
    if (roleType === 'PHARMACY') email = 'apollo@medinear.com';
    if (roleType === 'ADMIN') email = 'admin@medinear.com';
    return await login(email, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
