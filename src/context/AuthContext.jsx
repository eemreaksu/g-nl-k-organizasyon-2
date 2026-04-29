import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claims = tokenResult.claims;

          // ─── Firestore'dan rol bilgisini çek ──────────────────────────
          let role = claims.role || null;
          let name = claims.name || null;
          let isCaptain = claims.isCaptain || 0;

          if (!role) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              role = data.role || 'user';
              name = data.name || firebaseUser.email;
              isCaptain = data.isCaptain || 0;
            } else {
              // Eğer users koleksiyonunda kayıt yoksa ama e-posta admin ise
              if (firebaseUser.email === 'admin@mersin.local') {
                role = 'admin';
                name = 'Admin';
                // Admin dokümanını otomatik oluştur ki firestore.rules'ta isAdmin() çalışsın
                try {
                  await setDoc(doc(db, 'users', firebaseUser.uid), {
                    role: 'admin',
                    name: 'Admin',
                    email: firebaseUser.email,
                    isCaptain: 0
                  }, { merge: true });
                } catch (e) {
                  // Yazma hatası olursa sessizce devam et (rules henüz deploy edilmemiş olabilir)
                  console.warn('Admin user doc oluşturulamadı:', e.message);
                }
              } else {
                role = 'user';
                name = firebaseUser.email;
              }
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
    getIdToken,
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
