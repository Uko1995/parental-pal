import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const childData = await request.json();
    const childIndex = parseInt(id);

    // Get user
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const children = user.children || [];
    if (childIndex < 0 || childIndex >= children.length) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Update the child at the specified index
    children[childIndex] = {
      name: childData.name,
      age: parseInt(childData.age),
      gender: childData.gender || "male", // Default to male if not provided
      class: childData.class || undefined,
      schoolName: childData.schoolName || undefined,
      subjects: childData.subjects || [],
    };

    // Update user with modified children array
    const updatedUser = await UserRepository.updateUser(user._id!, {
      children: children,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update child" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Child updated successfully",
      child: children[childIndex],
    });
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Failed to update child" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childIndex = parseInt(id);

    // Get user
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const children = user.children || [];
    if (childIndex < 0 || childIndex >= children.length) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Remove the child at the specified index
    children.splice(childIndex, 1);

    // Update user with modified children array
    const updatedUser = await UserRepository.updateUser(user._id!, {
      children: children,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to delete child" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Child deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Failed to delete child" },
      { status: 500 }
    );
  }
}
