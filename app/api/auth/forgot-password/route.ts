/**
 * Forgot password endpoint
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createPasswordResetToken,
  hasPendingPasswordReset,
} from "@/lib/password-reset";
import { UserRepository } from "@/lib/UserRepository";
import { sendEmail } from "@/lib/email-service";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import { rateLimit, getClientIp, validateEmail } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting - 3 attempts per hour per IP
  const rateLimitResult = rateLimit(`forgot-password:${ip}`, 3, 3600000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many password reset requests" },
      { status: 429 },
    );
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await UserRepository.findByEmail(email);

    // Don't reveal if user exists (security best practice)
    if (!user) {
      await logAuthEvent(
        AuditEventType.PASSWORD_RESET_REQUEST,
        undefined,
        email,
        ip,
        false,
        "Password reset requested for non-existent email",
      );

      return NextResponse.json({
        message: "If an account exists, a password reset email has been sent",
      });
    }

    // Check if user has OAuth account (Google)
    if (user.googleId && !user.password) {
      return NextResponse.json({
        message: "If an account exists, a password reset email has been sent",
      });
    }

    // Check if there's already a pending reset
    const hasPending = await hasPendingPasswordReset(email);
    if (hasPending) {
      return NextResponse.json(
        {
          error:
            "Password reset email already sent. Please check your inbox or wait before requesting again.",
        },
        { status: 400 },
      );
    }

    // Create password reset token and OTP
    const otp = await createPasswordResetToken(email);
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetPageUrl = `${appUrl}/auth/reset-password?email=${encodeURIComponent(email)}`;

    const emailResult = await sendEmail({
      to: email,
      subject: "Your ParentalPal OTP code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #90AC19;">Password Reset OTP</h2>
          <p>Hello ${user.userData.user.name || "there"},</p>
          <p>Use the code below to reset your ParentalPal password. It expires in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #f4f7f9; padding: 20px 30px; border-radius: 8px; letter-spacing: 6px; font-size: 24px; font-weight: bold;">${otp}</div>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            <a href="${resetPageUrl}" style="color: #90AC19; text-decoration: none;">Click here to go to the password reset page</a>
          </p>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            You can also visit this URL and enter your email, OTP code, and new password:
          </p>
          <p style="color: #666; word-break: break-all;">${resetPageUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this message.
          </p>
        </div>
      `,
    });

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return NextResponse.json(
        { error: emailResult.error || "Failed to send password reset email" },
        { status: 500 },
      );
    }

    // Log successful request
    await logAuthEvent(
      AuditEventType.PASSWORD_RESET_REQUEST,
      user._id!.toString(),
      email,
      ip,
      true,
      "Password reset email sent",
    );

    return NextResponse.json({
      message: "If an account exists, a password reset email has been sent",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 },
    );
  }
}
