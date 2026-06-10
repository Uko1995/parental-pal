import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/UserRepository";
import { UserInterface } from "@/models/User";
import {
  validateEmail,
  validatePassword,
  sanitizeString,
  sanitizeObject,
  getClientIp,
  rateLimit,
} from "@/lib/security";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import { createVerificationToken } from "@/lib/email-verification";
import { sendEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    // Rate limiting - 5 registration attempts per 15 minutes per IP
    const rateLimitResult = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);

    if (!rateLimitResult.success) {
      logAuthEvent(
        AuditEventType.RATE_LIMIT_EXCEEDED,
        undefined,
        undefined,
        ip,
        false,
        "Registration rate limit exceeded"
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many registration attempts. Please try again in 15 minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const rawData = await request.json();
    const {
      name: rawName,
      email: rawEmail,
      password,
      role = "parent",
      tutorData: rawTutorData,
    } = rawData;

    // Sanitize inputs
    const name = sanitizeString(rawName);
    const email = sanitizeString(rawEmail);
    const tutorData = rawTutorData ? sanitizeObject(rawTutorData) : undefined;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Validate email with enhanced security
    if (!validateEmail(email)) {
      logAuthEvent(
        AuditEventType.REGISTER,
        undefined,
        email,
        ip,
        false,
        "Invalid email format"
      );
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength with enhanced validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      logAuthEvent(
        AuditEventType.REGISTER,
        undefined,
        email,
        ip,
        false,
        `Weak password: ${passwordValidation.errors.join(", ")}`
      );
      return NextResponse.json(
        {
          success: false,
          error: passwordValidation.errors[0],
        },
        { status: 400 }
      );
    }

    // Old validation logic kept for backwards compatibility
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one uppercase letter",
        },
        { status: 400 }
      );
    }

    if (!hasLowercase) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one lowercase letter",
        },
        { status: 400 }
      );
    }

    if (!hasNumber) {
      return NextResponse.json(
        { success: false, error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    if (!hasSpecialChar) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain at least one special character",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      logAuthEvent(
        AuditEventType.REGISTER,
        undefined,
        email,
        ip,
        false,
        "User with email already exists"
      );
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password with stronger work factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with tutor data if provided
    const newUser: Omit<UserInterface, "_id" | "createdAt" | "updatedAt"> = {
      userData: {
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days OAuth session
        user: {
          name,
          email,
          image: (tutorData?.profileImage as string) || null,
        },
      },
      phone: (tutorData?.phone as string) || undefined,
      address: (tutorData?.address as string) || undefined,
      password: hashedPassword,
      role: role as "admin" | "parent" | "tutor",
      isActive: true,
      lastLoginAt: new Date(),
      membershipType: "basic",
    };

    // Include tutor profile if tutorData is provided
    if (tutorData?.tutorProfile) {
      newUser.tutorProfile = {
        ...(tutorData.tutorProfile as Record<string, unknown>),
        rating: 0,
        totalReviews: 0,
        isVerified: true,
      } as UserInterface["tutorProfile"];
    }

    // Include preferences if provided
    if (tutorData?.preferences) {
      newUser.preferences = {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        ...(tutorData.preferences as Record<string, unknown>),
      } as UserInterface["preferences"];
    }

    const createdUser = await UserRepository.createUser(newUser);

    // Log successful registration
    await logAuthEvent(
      AuditEventType.REGISTER,
      createdUser._id?.toString(),
      email,
      ip,
      true,
      `User registered successfully with role: ${role}`
    );

    // Send verification email
    try {
      const token = await createVerificationToken(email);
      const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

      await sendEmail({
        to: email,
        subject: "Verify your email - PARENTALPAL",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #90AC19;">Welcome to PARENTALPAL!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering. Please verify your email address to activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #90AC19; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Or copy and paste this link:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              This link expires in 24 hours.
            </p>
          </div>
        `,
      });
      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error(" Error sending verification email:", emailError);
      // Don't fail registration if email fails
    }

    // Send welcome email (tutor-specific or general welcome)
    try {
      const emailType =
        role === "tutor" && tutorData ? "tutor-registration" : "welcome";
      const emailData: Record<string, unknown> = {
        type: emailType,
        to: email,
        userName: name,
        apiKey: process.env.EMAIL_API_KEY,
      };

      // Add tutor-specific data if applicable
      if (emailType === "tutor-registration" && tutorData) {
        const tutorProfile = tutorData.tutorProfile as Record<string, unknown>;
        emailData.data = {
          tutorId: createdUser._id?.toString(),
          specialty: (tutorProfile?.specialty as string) || "",
          subjects: (tutorProfile?.subjects as string[]) || [],
        };
      }

      const emailResponse = await fetch(
        `${process.env.NEXTAUTH_URL}/api/email` ||
          "http://localhost:3000/api/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        }
      );

      if (emailResponse.ok) {
        console.log("✅ Welcome email sent successfully");
      } else {
        console.error(
          "❌ Failed to send welcome email:",
          await emailResponse.text()
        );
      }
    } catch (emailError) {
      console.error("❌ Error sending welcome email:", emailError);
      // Don't fail registration if email fails
    }

    // Remove password from response
    const userResponse = { ...createdUser };
    delete userResponse.password;
    delete userResponse.googleId;

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    logAuthEvent(
      AuditEventType.REGISTER,
      undefined,
      undefined,
      ip,
      false,
      `Registration error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
