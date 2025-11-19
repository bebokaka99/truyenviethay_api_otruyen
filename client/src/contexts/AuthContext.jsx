import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Tạm thời để user là null (chưa đăng nhập)
  // Bạn có thể đổi thành object user để test giao diện đã đăng nhập
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);