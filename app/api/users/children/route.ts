import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";

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

    // Get children from user profile
    const profileChildren = user.children || [];

    // Get children from bookings
    const bookings = await BookingRepository.findByUserId(user._id!);

    // Extract unique children from bookings
    interface ChildWithServices {
      name: string;
      age: number;
      gender?: "male" | "female";
      class?: string;
      schoolName?: string;
      subjects?: string[];
      services: Array<{
        serviceType: string;
        status: string;
        bookingId: string;
        createdAt: Date;
      }>;
    }

    const childrenMap = new Map<string, ChildWithServices>();

    bookings.forEach((booking) => {
      (booking.children || []).forEach((child) => {
        const key = `${child.name.toLowerCase()}_${child.age}`;

        if (!childrenMap.has(key)) {
          childrenMap.set(key, {
            name: child.name,
            age: child.age,
            class: child.class,
            schoolName: child.schoolName,
            subjects:
              "subjects" in child && Array.isArray(child.subjects)
                ? (child.subjects as string[])
                : [],
            services: [],
          });
        }

        // Add service information
        const existingChild = childrenMap.get(key);
        if (existingChild) {
          existingChild.services.push({
            serviceType: booking.serviceType,
            status: booking.status,
            bookingId: booking._id!.toString(),
            createdAt: booking.createdAt,
          });
        }
      });
    });

    // Merge profile children with booking children
    const allChildren: Array<ChildWithServices> = profileChildren.map(
      (child) => ({
        ...child,
        services: [],
      })
    );

    childrenMap.forEach((bookingChild) => {
      const exists = allChildren.some(
        (profileChild) =>
          profileChild.name.toLowerCase() === bookingChild.name.toLowerCase() &&
          profileChild.age === bookingChild.age
      );

      if (!exists) {
        allChildren.push(bookingChild);
      } else {
        // Merge services into existing profile child
        const existingChild = allChildren.find(
          (profileChild) =>
            profileChild.name.toLowerCase() ===
              bookingChild.name.toLowerCase() &&
            profileChild.age === bookingChild.age
        );
        if (existingChild) {
          existingChild.services = bookingChild.services;
        }
      }
    });

    // Return children data with services
    return NextResponse.json({
      children: allChildren,
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
      gender: childData.gender || "male", // Default to male if not provided
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
