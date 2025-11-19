import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    // 1. Lưu vào State
    setUser(userData);
    // 2. Lưu vào LocalStorage (để F5 không mất)
    localStorage.setItem('user_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user_data', JSON.stringify(newUserData));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);