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
      { status: 429 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !validateEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
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
        "Password reset requested for non-existent email"
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
        { status: 400 }
      );
    }

    // Create password reset token
    const token = await createPasswordResetToken(email);

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your password - PARENTALPAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #90AC19;">Reset Your Password</h2>
          <p>Hello ${user.userData.user.name || "there"},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #90AC19; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          <p style="color: #666; font-size: 12px;">
            For security reasons, this link can only be used once.
          </p>
        </div>
      `,
    });

    // Log successful request
    await logAuthEvent(
      AuditEventType.PASSWORD_RESET_REQUEST,
      user._id!.toString(),
      email,
      ip,
      true,
      "Password reset email sent"
    );

    return NextResponse.json({
      message: "If an account exists, a password reset email has been sent",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
