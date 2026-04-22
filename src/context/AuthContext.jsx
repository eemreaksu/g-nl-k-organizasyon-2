import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

// Firebase ID Token'ları 1 saat geçerlidir.
// Her 50 dakikada bir yeniliyoruz ki oturum süresi dolmasın.
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRefreshTimer = useRef(null);

  /**
   * Kullanıcının güncel JWT ID Token'ını döndürür.
   * forceRefresh=true ile Firebase'den yeni token çeker.
   * Bu token sunucuya veya Firestore'a gönderildiğinde,
   * Firebase altyapısı imzayı doğrular — client-side manipülasyon imkânsızdır.
   */
  const getIdToken = async (forceRefresh = false) => {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  };

  /**
   * Token yenileme döngüsünü başlatır.
   * Her 50 dakikada bir çalışır.
   */
  const startTokenRefresh = () => {
    if (tokenRefreshTimer.current) clearInterval(tokenRefreshTimer.current);
    tokenRefreshTimer.current = setInterval(async () => {
      try {
        await getIdToken(true); // forceRefresh — yeni JWT al
      } catch {
        // Token yenilenemezse (örn. kullanıcı Firebase'den silinmiş),
        // oturumu kapat.
        await signOut(auth);
      }
    }, TOKEN_REFRESH_INTERVAL);
  };

  const stopTokenRefresh = () => {
    if (tokenRefreshTimer.current) {
      clearInterval(tokenRefreshTimer.current);
      tokenRefreshTimer.current = null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // ─── JWT ID Token'ı al ve decode et ───────────────────────────
          // getIdTokenResult() token'ı çözer; claims içindeki bilgiler
          // Firebase'in private key'iyle imzalandığı için manipüle edilemez.
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claims = tokenResult.claims; // custom claims (admin set ederse)

          // ─── Firestore'dan rol bilgisini çek ──────────────────────────
          // NOT: Custom Claims yoksa Firestore'a fallback yapıyoruz.
          // Gerçek prodüksiyonda Firebase Admin SDK ile Custom Claims set edin.
          let role = claims.role || null; // Cloud Function set ettiyse buradan gelir
          let name = claims.name || null;
          let isCaptain = claims.isCaptain || 0;

          if (!role) {
            // Custom claim yoksa Firestore'dan oku
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              role = data.role || 'user';
              name = data.name || firebaseUser.email;
              isCaptain = data.isCaptain || 0;
            } else {
              role = 'user';
              name = firebaseUser.email;
            }
          }

          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
            name,
            isCaptain,
          });

          startTokenRefresh();
        } catch {
          // Hata detayı sızdırma — loglama servisi kullanılabilir
          setCurrentUser(null);
          stopTokenRefresh();
        }
      } else {
        setCurrentUser(null);
        stopTokenRefresh();
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      stopTokenRefresh();
    };
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    stopTokenRefresh();
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    getIdToken, // Gerekirse component'lardan token alınabilir
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
