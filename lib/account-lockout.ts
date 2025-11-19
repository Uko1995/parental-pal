/**
 * Account lockout utility to prevent brute force attacks
 */

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// In-memory store for login attempts (use Redis in production)
const loginAttempts = new Map<string, LoginAttempt>();

// Configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes window
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

// Periodic cleanup of old entries
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts.entries()) {
    // Remove entries older than 1 hour
    if (now - attempt.lastAttempt > CLEANUP_INTERVAL) {
      loginAttempts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
} {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    // First failed attempt
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS - 1,
    };
  }

  // Check if account is currently locked
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      locked: true,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    };
  }

  // Reset count if last attempt was outside the window
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
    return {
      locked: false,
      remainingAttempts: MAX_LOGIN_ATTEMPTS - 1,
    };
  }

  // Increment failed attempts
  attempt.count++;
  attempt.lastAttempt = now;

  // Lock account if max attempts reached
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(identifier, attempt);
    return {
      locked: true,
      remainingAttempts: 0,
      lockedUntil: attempt.lockedUntil,
    };
  }

  loginAttempts.set(identifier, attempt);
  return {
    locked: false,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.count,
  };
}

/**
 * Check if account is locked
 */
export function isAccountLocked(identifier: string): {
  locked: boolean;
  lockedUntil?: number;
  remainingTime?: number;
} {
  const attempt = loginAttempts.get(identifier);

  if (!attempt || !attempt.lockedUntil) {
    return { locked: false };
  }

  const now = Date.now();

  if (now < attempt.lockedUntil) {
    return {
      locked: true,
      lockedUntil: attempt.lockedUntil,
      remainingTime: attempt.lockedUntil - now,
    };
  }

  // Lockout period expired, clear it
  attempt.lockedUntil = undefined;
  attempt.count = 0;
  loginAttempts.set(identifier, attempt);

  return { locked: false };
}

/**
 * Reset login attempts (on successful login)
 */
export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(identifier: string): number {
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    return MAX_LOGIN_ATTEMPTS;
  }

  const now = Date.now();

  // Check if locked
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return 0;
  }

  // Reset if outside window
  if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
    loginAttempts.delete(identifier);
    return MAX_LOGIN_ATTEMPTS;
  }

  return Math.max(0, MAX_LOGIN_ATTEMPTS - attempt.count);
}
