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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const uc = userCode.toUpperCase();
        
        const resolveUser = (id, role, name, isCaptain) => {
          const user = { id, role, name, isCaptain };
          setCurrentUser(user);
          localStorage.setItem('decathlonUser', JSON.stringify(user));
          resolve(user);
        };

        // Admins
        if (uc === 'ADM9X' && password === 'Deca_Master843!') {
          resolveUser('1', 'admin', 'Yönetici 1', 1);
        } else if (uc === 'KPTN7' && password === 'TurkSport_77$X') {
          resolveUser('2', 'admin', 'Yönetici 2', 1);
        } else if (uc === 'LDR4V' && password === 'Organizasyon_Lideri#9') {
          resolveUser('3', 'admin', 'Yönetici 3', 1);
        } 
        // Users
        else if (uc === 'MERSI' && password === 'mersi843') {
          resolveUser('4', 'user', 'Takım Arkadaşı 1', 0);
        } else if (uc === 'DECA2' && password === 'deca_spor843') {
          resolveUser('5', 'user', 'Takım Arkadaşı 2', 0);
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
