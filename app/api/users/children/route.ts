import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with children
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return children data
    return NextResponse.json({
      children: user.children || [],
    });
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const childData = await request.json();

    // Validate required fields
    if (!childData.name || !childData.age) {
      return NextResponse.json(
        { error: "Name and age are required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add child to user's children array
    const newChild = {
      name: childData.name,
      age: parseInt(childData.age),
      class: childData.class || undefined,
      schoolName: childData.schoolName || undefined,
      subjects: childData.subjects || [],
    };

    const currentChildren = user.children || [];
    const updatedChildren = [...currentChildren, newChild];

    // Update user with new children array
    const updatedUser = await UserRepository.updateUser(user._id!, {
      children: updatedChildren,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to add child" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Child added successfully",
      child: newChild,
    });
  } catch (error) {
    console.error("Error adding child:", error);
    return NextResponse.json({ error: "Failed to add child" }, { status: 500 });
  }
}
