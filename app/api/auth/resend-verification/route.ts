/**
 * Resend email verification
 * POST /api/auth/resend-verification
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createVerificationToken,
  hasPendingVerification,
} from "@/lib/email-verification";
import { UserRepository } from "@/lib/UserRepository";
import { sendEmail } from "@/lib/email-service";
import { rateLimit, getClientIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting - 3 attempts per hour
  const rateLimitResult = rateLimit(ip, 3, 3600000);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        message: "If an account exists, a verification email has been sent",
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Check if there's already a pending verification
    const hasPending = await hasPendingVerification(email);
    if (hasPending) {
      return NextResponse.json(
        { error: "Verification email already sent. Please check your inbox." },
        { status: 400 }
      );
    }

    // Create verification token
    const token = await createVerificationToken(email);

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Verify your email - PARENTALPAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #90AC19;">Verify Your Email</h2>
          <p>Hello ${user?.userData?.user?.name || "there"},</p>
          <p>Thank you for registering with PARENTALPAL. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #90AC19; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Error resending verification:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
