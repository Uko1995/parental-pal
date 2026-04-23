/**
 * Password reset utility
 * Stores OTP tokens in user document
 */

import { UserRepository } from "./UserRepository";
import crypto from "crypto";

/**
 * Generate a password reset token
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a 6-digit OTP code
 */
export function generatePasswordResetOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a password reset token and OTP for an email
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const token = generatePasswordResetToken();
  const otp = generatePasswordResetOtp();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await UserRepository.updateUser(user._id!.toString(), {
    passwordResetToken: {
      token,
      otp,
      expiresAt,
      used: false,
    },
  });

  return otp;
}

/**
 * Verify a reset code by email and return the email if valid
 */
export async function verifyPasswordResetCode(
  email: string,
  otp: string,
): Promise<string | null> {
  const user = await UserRepository.findByEmail(email);
  if (!user || !user.passwordResetToken) {
    return null;
  }

  if (new Date() > user.passwordResetToken.expiresAt) {
    await UserRepository.updateUser(user._id!.toString(), {
      passwordResetToken: undefined,
    });
    return null;
  }

  if (user.passwordResetToken.used) {
    return null;
  }

  if (user.passwordResetToken.otp !== otp) {
    return null;
  }

  return user.userData.user.email;
}

/**
 * Verify a token and return the email if valid
 */
export async function verifyPasswordResetToken(
  token: string,
): Promise<string | null> {
  const users = await UserRepository.getUsersWithTokens();
  const user = users.find((u) => u.passwordResetToken?.token === token);

  if (!user || !user.passwordResetToken) {
    return null;
  }

  if (new Date() > user.passwordResetToken.expiresAt) {
    await UserRepository.updateUser(user._id!.toString(), {
      passwordResetToken: undefined,
    });
    return null;
  }

  if (user.passwordResetToken.used) {
    return null;
  }

  return user.userData.user.email;
}

/**
 * Mark a token or email reset record as used
 */
export async function markPasswordResetTokenAsUsed(
  token: string,
): Promise<void> {
  const users = await UserRepository.getUsersWithTokens();
  const user = users.find((u) => u.passwordResetToken?.token === token);

  if (user && user.passwordResetToken) {
    await UserRepository.updateUser(user._id!.toString(), {
      passwordResetToken: { ...user.passwordResetToken, used: true },
    });
  }
}

/**
 * Mark a reset token as used by email
 */
export async function markPasswordResetTokenAsUsedByEmail(
  email: string,
): Promise<void> {
  const user = await UserRepository.findByEmail(email);
  if (user && user.passwordResetToken) {
    await UserRepository.updateUser(user._id!.toString(), {
      passwordResetToken: { ...user.passwordResetToken, used: true },
    });
  }
}

/**
 * Check if an email has a pending password reset token
 */
export async function hasPendingPasswordReset(email: string): Promise<boolean> {
  const user = await UserRepository.findByEmail(email);
  if (!user || !user.passwordResetToken) {
    return false;
  }
  return (
    new Date() < user.passwordResetToken.expiresAt &&
    !user.passwordResetToken.used
  );
}
