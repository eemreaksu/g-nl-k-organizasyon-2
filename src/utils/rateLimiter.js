/**
 * Client-side rate limiter for login attempts.
 * Uses sessionStorage so it resets if the tab is closed.
 * Key: attempt count + lockout timestamp.
 */

const MAX_ATTEMPTS = 5;          // 5 başarısız deneme
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 dakika kilit
const STORAGE_KEY = 'deca_login_attempts';

function getAttemptData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveAttemptData(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function checkRateLimit() {
  const data = getAttemptData();
  const now = Date.now();

  if (data.lockedUntil && now < data.lockedUntil) {
    const remainingMs = data.lockedUntil - now;
    const remainingMin = Math.ceil(remainingMs / 1000 / 60);
    throw new Error(`Çok fazla başarısız giriş. ${remainingMin} dakika bekleyin.`);
  }

  // Kilit süresi geçtiyse sıfırla
  if (data.lockedUntil && now >= data.lockedUntil) {
    saveAttemptData({ count: 0, lockedUntil: null });
  }
}

export function recordFailedAttempt() {
  const data = getAttemptData();
  const newCount = (data.count || 0) + 1;

  if (newCount >= MAX_ATTEMPTS) {
    saveAttemptData({ count: newCount, lockedUntil: Date.now() + LOCKOUT_DURATION });
  } else {
    saveAttemptData({ count: newCount, lockedUntil: null });
  }

  return MAX_ATTEMPTS - newCount;
}

export function clearAttempts() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getRemainingAttempts() {
  const data = getAttemptData();
  return Math.max(0, MAX_ATTEMPTS - (data.count || 0));
}
