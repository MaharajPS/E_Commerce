import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const login = (authData) => {
    setToken(authData.token);
    setUser({
      userId: authData.userId,
      email: authData.email,
      name: authData.name,
      role: authData.role,
    });
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify({
      userId: authData.userId,
      email: authData.email,
      name: authData.name,
      role: authData.role,
    }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ROLE_SUPER_ADMIN': return '/superadmin';
      case 'ROLE_ADMIN': return '/admin';
      case 'ROLE_SELLER': return '/seller';
      case 'ROLE_CUSTOMER': return '/';
      default: return '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);