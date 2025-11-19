import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/UserRepository";
import { UserInterface } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      role = "parent",
      tutorData,
    } = await request.json();

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
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
          image: tutorData?.profileImage || null,
        },
      },
      phone: tutorData?.phone || undefined,
      address: tutorData?.address || undefined,
      password: hashedPassword,
      role: role as "admin" | "parent" | "tutor",
      isActive: true,
      lastLoginAt: new Date(),
      membershipType: "basic",
      // Include tutor profile if tutorData is provided
      ...(tutorData?.tutorProfile && {
        tutorProfile: {
          ...tutorData.tutorProfile,
          rating: 0,
          totalReviews: 0,
          isVerified: true,
        },
      }),
      // Include preferences if provided
      ...(tutorData?.preferences && {
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          ...tutorData.preferences,
        },
      }),
    };

    const createdUser = await UserRepository.createUser(newUser);

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
        emailData.data = {
          tutorId: createdUser._id?.toString(),
          specialty: tutorData.tutorProfile?.specialty || "General",
          subjects: tutorData.tutorProfile?.subjects || [],
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

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
