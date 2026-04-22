import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight, LockIcon, UserIcon, AlertTriangle } from 'lucide-react';
import { checkRateLimit, recordFailedAttempt, clearAttempts, getRemainingAttempts } from '../utils/rateLimiter';

export default function Login() {
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Sayfa açılınca mevcut kısıtlamayı kontrol et
  useEffect(() => {
    setRemainingAttempts(getRemainingAttempts());
    try {
      checkRateLimit(); // Kilitli değilse hata atmaz
      setIsLocked(false);
    } catch {
      setIsLocked(true);
      setError('Hesap geçici olarak kilitlendi. Lütfen bekleyin.');
    }
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (currentUser && !isLoading) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [currentUser, isLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // ── Brute-force koruma: Kilitli mi? ──────────────────────────
    try {
      checkRateLimit();
    } catch (lockErr) {
      setError(lockErr.message);
      setIsLocked(true);
      return;
    }

    setIsLoading(true);

    try {
      const email = `${userCode.toLowerCase()}@mersin.local`;
      await login(email, password);
      clearAttempts(); // Başarılı girişte sayacı sıfırla
      // Yönlendirme useEffect ile yapılıyor
    } catch {
      // ── Hata detayını sızdırma ────────────────────────────────
      // Firebase hata kodunu (auth/wrong-password vs.) asla gösterme.
      const remaining = recordFailedAttempt();
      setRemainingAttempts(remaining);

      if (remaining <= 0) {
        setIsLocked(true);
        setError('Çok fazla başarısız giriş. Hesap 5 dakika kilitlendi.');
      } else {
        setError(`Kullanıcı kodu veya şifre hatalı. (${remaining} hak kaldı)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black font-sans">
      {/* Background Video/Image Layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity duration-1000"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            filter: 'contrast(1.2)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Typography and Motivation */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:flex flex-col text-white"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <Activity className="w-10 h-10 text-[#c2ff00]" />
            <span className="text-xl font-bold tracking-widest text-[#c2ff00] uppercase">Mersin Turksport</span>
          </motion.div>
          
          <h1 className="text-6xl font-black uppercase italic leading-none mb-4 drop-shadow-lg tracking-tighter">
            Sporun <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c2ff00] to-white">Gücünü</span> <br/>
            Keşfet.
          </h1>
          
          <p className="text-xl text-gray-300 max-w-lg font-medium leading-relaxed mb-8">
            Günlük organizasyonunu planla, hedeflerine ulaş ve mağazanın enerjisini zirveye taşı. Senin sahan, senin kuralların.
          </p>

          <div className="flex gap-4">
            <div className="p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="text-3xl font-black text-white">843</div>
              <div className="text-sm text-[#c2ff00] font-bold uppercase tracking-wider">Mağaza Kodu</div>
            </div>
            <div className="p-4 border border-white/20 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-sm text-[#c2ff00] font-bold uppercase tracking-wider">Efor</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-md mx-auto lg:ml-auto"
        >
          <div className="bg-[#1e2b6e]/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Geometric accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c2ff00]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <div 
                  className="text-4xl font-black uppercase italic tracking-tighter text-white inline-block mb-2"
                  style={{ transform: 'skewX(-2deg)' }}
                >
                  DECATHLON
                </div>
                <h2 className="text-[#c2ff00] font-semibold tracking-widest text-sm uppercase">Organizasyon Portalı</h2>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-wider ml-1">Kullanıcı Kodu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#c2ff00] transition-colors">
                      <UserIcon size={20} />
                    </div>
                    <input
                      type="text"
                      maxLength={5}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={isLocked || isLoading}
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#c2ff00] focus:ring-1 focus:ring-[#c2ff00] transition-all font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="5 Haneli Kod"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-wider ml-1">Pin / Şifre</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[#c2ff00] transition-colors">
                      <LockIcon size={20} />
                    </div>
                    <input
                      type="password"
                      autoComplete="current-password"
                      disabled={isLocked || isLoading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[#c2ff00] focus:ring-1 focus:ring-[#c2ff00] transition-all font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  whileTap={{ scale: isLocked ? 1 : 0.98 }}
                  disabled={isLoading || isLocked}
                  type="submit"
                  className="w-full bg-[#c2ff00] hover:bg-[#a8e600] text-[#1e2b6e] font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(194,255,0,0.3)] hover:shadow-[0_0_30px_rgba(194,255,0,0.5)] transition-all flex items-center justify-center gap-2 group mt-8 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <span className="relative z-10">
                    {isLocked ? '🔒 Kilitli' : isLoading ? 'Giriş Yapılıyor...' : 'Sisteme Gir'}
                  </span>
                  {!isLoading && !isLocked && (
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  )}
                  {/* Button shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                </motion.button>
              </form>
              
              <div className="mt-8 text-center text-white/40 text-xs font-medium leading-relaxed">
                Bu sistem sadece yetkili Mersin Turksport personeli içindir.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
