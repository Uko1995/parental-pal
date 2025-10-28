import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/lib/UserRepository";

// Update child within parent document
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      parentId,
      originalName,
      name,
      age,
      gender,
      class: childClass,
      schoolName,
      subjects,
    } = body;

    if (!parentId || !originalName || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the parent user
    const parent = await UserRepository.findById(parentId);
    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Parent not found" },
        { status: 404 }
      );
    }

    // Find the child index by matching the original name
    const children = parent.children || [];
    const childIndex = children.findIndex(
      (child) => child.name === originalName
    );

    if (childIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Child not found" },
        { status: 404 }
      );
    }

    // Update the specific child
    children[childIndex] = {
      ...children[childIndex],
      name,
      age,
      gender,
      class: childClass,
      schoolName,
      subjects,
    };

    // Update the parent document
    const result = await UserRepository.updateUser(parentId, {
      children,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update child" },
      { status: 500 }
    );
  }
}

// Delete child from parent document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const childName = searchParams.get("childName");

    if (!parentId || !childName) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the parent user
    const parent = await UserRepository.findById(parentId);
    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Parent not found" },
        { status: 404 }
      );
    }

    // Find and remove the specific child
    const children = parent.children || [];
    const childIndex = children.findIndex((child) => child.name === childName);

    if (childIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Child not found" },
        { status: 404 }
      );
    }

    children.splice(childIndex, 1);

    // Update the parent document
    const result = await UserRepository.updateUser(parentId, {
      children,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete child" },
      { status: 500 }
    );
  }
}

// Add new child to parent document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      parentId,
      name,
      age,
      gender,
      class: childClass,
      schoolName,
      subjects,
    } = body;

    if (!parentId || !name || !age || !gender) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the parent user
    const parent = await UserRepository.findById(parentId);
    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Parent not found" },
        { status: 404 }
      );
    }

    // Check if child with same name already exists
    const existingChild = parent.children?.find(
      (child) => child.name.toLowerCase() === name.toLowerCase()
    );

    if (existingChild) {
      return NextResponse.json(
        {
          success: false,
          error: "A child with this name already exists for this parent",
        },
        { status: 400 }
      );
    }

    // Create new child object
    const newChild = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      class: childClass?.trim() || "",
      schoolName: schoolName?.trim() || "",
      subjects: subjects || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add child to parent's children array
    const children = parent.children || [];
    children.push(newChild);

    // Update the parent document
    const result = await UserRepository.updateUser(parentId, {
      children,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error adding child:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add child" },
      { status: 500 }
    );
  }
}
