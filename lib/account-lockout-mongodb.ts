/**
 * Account lockout utility with MongoDB persistence
 * Prevents brute force attacks with persistent storage
 */

import { getCollection } from "./mongodb";

interface LoginAttempt {
  email: string;
  attempts: number;
  lockedUntil?: Date;
  lastAttempt: Date;
  createdAt: Date;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Get login attempts collection
 */
async function getLoginAttemptsCollection() {
  return getCollection<LoginAttempt>("loginAttempts");
}

/**
 * Initialize indexes for the collection
 */
export async function initializeLoginAttemptsIndexes(): Promise<void> {
  try {
    const collection = await getLoginAttemptsCollection();

    // Index on email for fast lookups
    await collection.createIndex({ email: 1 }, { unique: true });

    // TTL index to auto-delete old attempts after 24 hours
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 86400 }
    );
  } catch (error) {
    console.error("Error creating login attempts indexes:", error);
  }
}

/**
 * Record a failed login attempt
 */
export async function recordFailedLogin(email: string): Promise<void> {
  try {
    const collection = await getLoginAttemptsCollection();
    const now = new Date();

    const existing = await collection.findOne({ email });

    if (!existing) {
      // First failed attempt
      await collection.insertOne({
        email,
        attempts: 1,
        lastAttempt: now,
        createdAt: now,
      } as LoginAttempt);
    } else {
      // Check if lockout period has expired
      if (existing.lockedUntil && now > existing.lockedUntil) {
        // Reset attempts after lockout expires
        await collection.updateOne(
          { email },
          {
            $set: {
              attempts: 1,
              lastAttempt: now,
            },
            $unset: { lockedUntil: "" },
          }
        );
      } else {
        // Increment attempts
        const newAttempts = existing.attempts + 1;
        const updateData: Record<string, unknown> = {
          attempts: newAttempts,
          lastAttempt: now,
        };

        // Lock account if max attempts reached
        if (newAttempts >= MAX_ATTEMPTS) {
          updateData.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION);
        }

        await collection.updateOne({ email }, { $set: updateData });
      }
    }
  } catch (error) {
    console.error("Error recording failed login:", error);
    // Don't throw - degrade gracefully to not block legitimate users
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  try {
    const collection = await getLoginAttemptsCollection();
    const record = await collection.findOne({ email });

    if (!record || !record.lockedUntil) {
      return false;
    }

    const now = new Date();

    // Check if lockout has expired
    if (now > record.lockedUntil) {
      // Clean up expired lockout
      await collection.updateOne(
        { email },
        {
          $set: { attempts: 0 },
          $unset: { lockedUntil: "" },
        }
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking account lock:", error);
    // Fail open - don't block legitimate users due to system errors
    return false;
  }
}

/**
 * Reset login attempts after successful login
 */
export async function resetLoginAttempts(email: string): Promise<void> {
  try {
    const collection = await getLoginAttemptsCollection();
    await collection.deleteOne({ email });
  } catch (error) {
    console.error("Error resetting login attempts:", error);
    // Don't throw - degrade gracefully
  }
}

/**
 * Get remaining lockout time in seconds
 */
export async function getRemainingLockoutTime(
  email: string
): Promise<number | null> {
  try {
    const collection = await getLoginAttemptsCollection();
    const record = await collection.findOne({ email });

    if (!record || !record.lockedUntil) {
      return null;
    }

    const now = new Date();
    if (now > record.lockedUntil) {
      return null;
    }

    return Math.ceil((record.lockedUntil.getTime() - now.getTime()) / 1000);
  } catch (error) {
    console.error("Error getting lockout time:", error);
    return null;
  }
}

/**
 * Get login attempt information
 */
export async function getLoginAttempts(email: string): Promise<{
  attempts: number;
  locked: boolean;
  remainingTime?: number;
} | null> {
  try {
    const collection = await getLoginAttemptsCollection();
    const record = await collection.findOne({ email });

    if (!record) {
      return null;
    }

    const now = new Date();
    const locked = record.lockedUntil ? now < record.lockedUntil : false;
    const remainingTime = record.lockedUntil
      ? Math.ceil((record.lockedUntil.getTime() - now.getTime()) / 1000)
      : undefined;

    return {
      attempts: record.attempts,
      locked,
      remainingTime: locked ? remainingTime : undefined,
    };
  } catch (error) {
    console.error("Error getting login attempts:", error);
    return null;
  }
}

/**
 * Cleanup expired login attempts manually (optional - TTL index handles this)
 */
export async function cleanupExpiredAttempts(): Promise<void> {
  try {
    const collection = await getLoginAttemptsCollection();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await collection.deleteMany({
      createdAt: { $lt: oneDayAgo },
    });
  } catch (error) {
    console.error("Error cleaning up login attempts:", error);
  }
}
