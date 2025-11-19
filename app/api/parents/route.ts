import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/lib/UserRepository";
import { auth } from "@/auth";
import {
  rateLimit,
  getClientIp,
  sanitizeString,
  sanitizeObject,
} from "@/lib/security";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";

// Create new parent
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting
  const rateLimitResult = rateLimit(`parents-create:${ip}`, 10, 3600000);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authorization - only admins can create parents
  if (session.user.role !== "admin") {
    await logAuthEvent(
      AuditEventType.FORBIDDEN_ACCESS,
      session.user.id,
      session.user.email || undefined,
      ip,
      false,
      "Non-admin attempted to create parent"
    );
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);
    const name = sanitizeString(String(body.name || ""));
    const email = sanitizeString(String(body.email || ""));
    const phone = sanitizeString(String(body.phone || ""));
    const address = sanitizeString(String(body.address || ""));
    const children = (body.children || []) as Array<{
      name: string;
      age: number;
      gender: "male" | "female";
    }>;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if parent with this email already exists
    const existingParent = await UserRepository.findByEmail(email);
    if (existingParent) {
      return NextResponse.json(
        { success: false, error: "A parent with this email already exists" },
        { status: 400 }
      );
    }

    // Create parent data
    const parentData = {
      userData: {
        user: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          image: null,
        },
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days from now
      },
      phone: phone || "",
      address: address || "",
      role: "parent" as const,
      isActive: true,
      membershipType: "basic" as const,
      children: children || [],
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        preferredServices: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await UserRepository.createUser(parentData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating parent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create parent" },
      { status: 500 }
    );
  }
}

// Update parent
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentId, updateData } = body;

    if (!parentId || !updateData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await UserRepository.updateUser(parentId, updateData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating parent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update parent" },
      { status: 500 }
    );
  }
}

// Delete parent
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: "Missing parent ID" },
        { status: 400 }
      );
    }

    const result = await UserRepository.deleteUser(parentId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting parent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete parent" },
      { status: 500 }
    );
  }
}
