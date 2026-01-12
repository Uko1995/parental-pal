import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { UserRepository } from "@/lib/UserRepository";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import {
  getClientIp,
  rateLimit,
  sanitizeUserData,
  sanitizeObject,
} from "@/lib/security";
import {
  logAuthEvent,
  logDataEvent,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`user-read:${ip}`, 30, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized user access attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Users can only access their own data, admins can access any
    if (currentUser._id?.toString() !== id && currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "User tried to access another user's data"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await UserRepository.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sanitize response - remove sensitive data
    return NextResponse.json(sanitizeUserData(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`user-update:${ip}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized user update attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Users can only update their own data, admins can update any
    if (currentUser._id?.toString() !== id && currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "User tried to update another user's data"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    // Prevent privilege escalation
    if (body.role && currentUser.role !== "admin") {
      delete body.role;
    }
    if (body.isActive !== undefined && currentUser.role !== "admin") {
      delete body.isActive;
    }
    if (body.password) {
      delete body.password; // Prevent direct password changes
    }

    const result = await UserRepository.updateUser(id, body);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logDataEvent(
      AuditEventType.USER_UPDATED,
      currentUser._id!.toString(),
      "user",
      "update",
      true,
      { userId: id }
    );

    // Invalidate users cache immediately
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({ success: true, user: sanitizeUserData(result) });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`user-delete:${ip}`, 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized user delete attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can delete users
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to delete user"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const result = await UserRepository.deleteUser(id);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logDataEvent(
      AuditEventType.USER_DELETED,
      currentUser._id!.toString(),
      "user",
      "delete",
      true,
      { userId: id }
    );

    // Invalidate users cache immediately
    revalidateTag(CACHE_TAGS.USERS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
