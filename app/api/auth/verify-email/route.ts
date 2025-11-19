/**
 * Email verification endpoint
 * POST /api/auth/verify-email
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/email-verification";
import { UserRepository } from "@/lib/UserRepository";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import { rateLimit, getClientIp } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting - 5 attempts per hour
  const rateLimitResult = rateLimit(ip, 5, 3600000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many verification attempts" },
      { status: 429 }
    );
  }

  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const email = await verifyToken(token);

    if (!email) {
      await logAuthEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        undefined,
        undefined,
        ip,
        false,
        "Invalid or expired verification token"
      );

      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's email verification status
    await UserRepository.updateUser(user._id!.toString(), {
      emailVerified: true,
    });

    // Log successful verification
    await logAuthEvent(
      AuditEventType.REGISTER,
      user._id!.toString(),
      email,
      ip,
      true,
      "Email verified successfully"
    );

    return NextResponse.json({
      message: "Email verified successfully",
      email,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
