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

    // Get user profile
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user profile data
    return NextResponse.json({
      name: user.userData?.user?.name || "",
      email: user.userData?.user?.email || "",
      phone: user.phone || "",
      address: user.address || "",
      membershipType: user.membershipType || "basic",
      role: user.role || "parent",
    });
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
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const updateData = await request.json();

    // Get user first to get the ID
    const user = await UserRepository.findByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user profile using UserRepository
    const updatedUser = await UserRepository.updateUser(user._id!, {
      userData: {
        ...user.userData,
        user: {
          ...user.userData.user,
          name: updateData.name,
        },
      },
      phone: updateData.phone,
      address: updateData.address,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.userData?.user?.name || "",
        email: updatedUser.userData?.user?.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
