/**
 * Email verification utility
 * Stores tokens in user document
 */

import { UserRepository } from "./UserRepository";
import crypto from "crypto";

/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a verification token for an email
 */
export async function createVerificationToken(email: string): Promise<string> {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }

  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await UserRepository.updateUser(user._id!.toString(), {
    verificationToken: { token, expiresAt },
  });

  return token;
}

/**
 * Verify a token and return the email if valid
 */
export async function verifyToken(token: string): Promise<string | null> {
  const users = await UserRepository.getUsersWithTokens();
  const user = users.find((u) => u.verificationToken?.token === token);

  if (!user || !user.verificationToken) {
    return null;
  }

  if (new Date() > user.verificationToken.expiresAt) {
    await UserRepository.updateUser(user._id!.toString(), {
      verificationToken: undefined,
    });
    return null;
  }

  await UserRepository.updateUser(user._id!.toString(), {
    emailVerified: true,
    verificationToken: undefined,
  });

  return user.userData.user.email;
}

/**
 * Check if an email has a pending verification token
 */
export async function hasPendingVerification(email: string): Promise<boolean> {
  const user = await UserRepository.findByEmail(email);
  if (!user || !user.verificationToken) {
    return false;
  }
  return new Date() < user.verificationToken.expiresAt;
}
