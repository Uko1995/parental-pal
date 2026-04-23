/**
 * Reset password endpoint
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  verifyPasswordResetCode,
  verifyPasswordResetToken,
  markPasswordResetTokenAsUsed,
  markPasswordResetTokenAsUsedByEmail,
} from "@/lib/password-reset";
import { UserRepository } from "@/lib/UserRepository";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import { rateLimit, getClientIp, validatePassword } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting - 5 attempts per hour per IP
  const rateLimitResult = rateLimit(`reset-password:${ip}`, 5, 3600000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many password reset attempts" },
      { status: 429 },
    );
  }

  try {
    const { token, email, otp, password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 },
      );
    }

    if (
      !token &&
      (!email || typeof email !== "string" || !otp || typeof otp !== "string")
    ) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 },
      );
    }

    let resolvedEmail: string | null = null;

    if (token && typeof token === "string") {
      resolvedEmail = await verifyPasswordResetToken(token);
    } else if (email && otp) {
      resolvedEmail = await verifyPasswordResetCode(email, otp);
    }

    if (!resolvedEmail) {
      await logAuthEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        undefined,
        email || undefined,
        ip,
        false,
        "Invalid or expired password reset credentials",
      );

      return NextResponse.json(
        { error: "Invalid or expired reset token or OTP" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await UserRepository.findByEmail(resolvedEmail);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password
    await UserRepository.updateUser(user._id!.toString(), {
      password: hashedPassword,
    });

    // Mark reset credential as used
    if (token) {
      await markPasswordResetTokenAsUsed(token);
    } else {
      await markPasswordResetTokenAsUsedByEmail(resolvedEmail);
    }

    // Log successful password reset
    await logAuthEvent(
      AuditEventType.PASSWORD_RESET_SUCCESS,
      user._id!.toString(),
      resolvedEmail,
      ip,
      true,
      "Password reset successfully",
    );

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
