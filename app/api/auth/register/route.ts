import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRepository } from "@/lib/UserRepository";
import { UserInterface } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "parent" } = await request.json();

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

    // Create new user
    const newUser: Omit<UserInterface, "_id" | "createdAt" | "updatedAt"> = {
      userData: {
        expiresAt: new Date(
          Date.now() + 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        user: {
          name,
          email,
          image: null,
        },
      },
      password: hashedPassword,
      role: role as "admin" | "parent" | "tutor",
      isActive: true,
      lastLoginAt: new Date(),
      membershipType: "basic",
    };

    const createdUser = await UserRepository.createUser(newUser);

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
