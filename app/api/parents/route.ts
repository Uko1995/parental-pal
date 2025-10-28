import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/lib/UserRepository";

// Create new parent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, children } = body;

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
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
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
