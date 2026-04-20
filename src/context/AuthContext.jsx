import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock check for existing session
    const storedUser = localStorage.getItem('decathlonUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userCode, password) => {
    // Mock login logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userCode === 'ADMIN' && password === 'mersin843') {
          const user = { id: '1', role: 'admin', name: 'Admin', isCaptain: 1 };
          setCurrentUser(user);
          localStorage.setItem('decathlonUser', JSON.stringify(user));
          resolve(user);
        } else if (userCode === '12345' && password === 'decauser') {
          const user = { id: '2', role: 'user', name: 'Test User', isCaptain: 0 };
          setCurrentUser(user);
          localStorage.setItem('decathlonUser', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Kullanıcı kodu veya şifre hatalı.'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('decathlonUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
