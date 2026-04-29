/**
 * Client-side rate limiter for login attempts.
 * Uses MODULE-LEVEL MEMORY so it CANNOT be bypassed via console/sessionStorage.
 * Key: attempt count + lockout timestamp.
 * NOTE: This resets on page reload. Firebase Auth's own server-side rate limiting
 * provides the real protection; this is UX-layer defence only.
 */

const MAX_ATTEMPTS = 5;          // 5 başarısız deneme
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 dakika kilit

// Module-level state — NOT accessible from browser console
let attemptCount = 0;
let lockedUntil = null;

function getAttemptData() {
  return { count: attemptCount, lockedUntil };
}

function saveAttemptData(data) {
  attemptCount = data.count ?? 0;
  lockedUntil = data.lockedUntil ?? null;
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
  saveAttemptData({ count: 0, lockedUntil: null });
}

export function getRemainingAttempts() {
  const data = getAttemptData();
  return Math.max(0, MAX_ATTEMPTS - (data.count || 0));
}
