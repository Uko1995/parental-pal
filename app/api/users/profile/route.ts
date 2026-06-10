import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { getSessionUser } from "@/lib/session-user";
import {
  sanitizeObject,
  sanitizeUserData,
  getClientIp,
  rateLimit,
} from "@/lib/security";
import {
  logAuthEvent,
  logDataEvent,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(ip, 30, 60000); // 30 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
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

    // Check authentication
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized profile access attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const user = await getSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return sanitized user profile data
    const profileData = {
      name: user.userData?.user?.name || "",
      email: user.userData?.user?.email || "",
      phone: user.phone || "",
      address: user.address || "",
      membershipType: user.membershipType || "basic",
      role: user.role || "parent",
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResult = rateLimit(ip, 10, 60000); // 10 updates per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
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

    // Check authentication
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized profile update attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and sanitize request body
    const rawData = await request.json();
    const updateData = sanitizeObject(rawData);

    // Get user first to get the ID
    const user = await getSessionUser(session);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rawEmail =
      typeof updateData.email === "string" ? updateData.email.trim() : "";
    const currentEmail = user.userData?.user?.email?.trim() || "";
    let nextEmail = currentEmail;

    if (rawEmail && rawEmail.toLowerCase() !== currentEmail.toLowerCase()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(rawEmail)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 },
        );
      }

      const existingUser = await UserRepository.findByEmail(rawEmail);
      if (
        existingUser &&
        existingUser._id!.toString() !== user._id!.toString()
      ) {
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 409 },
        );
      }

      nextEmail = rawEmail;
    }

    // Update user profile using UserRepository
    const updatedUser = await UserRepository.updateUser(user._id!, {
      userData: {
        ...user.userData,
        user: {
          ...user.userData.user,
          name: (updateData.name as string) || user.userData.user.name,
          email: nextEmail,
        },
      },
      phone: updateData.phone as string,
      address: updateData.address as string,
    });

    if (!updatedUser) {
      logDataEvent(
        AuditEventType.USER_UPDATED,
        user._id!.toString(),
        "user_profile",
        "update",
        false
      );
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Log successful update
    logDataEvent(
      AuditEventType.USER_UPDATED,
      user._id!.toString(),
      "user_profile",
      "update",
      true,
      { updatedFields: Object.keys(updateData) }
    );

    // Invalidate users cache immediately
    revalidateTag(CACHE_TAGS.USERS);

    const emailChanged =
      nextEmail.toLowerCase() !== currentEmail.toLowerCase();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: sanitizeUserData(updatedUser),
      emailChanged,
      userId: user._id!.toString(),
      email: nextEmail,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
