import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/lib/UserRepository";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    const tutor = await UserRepository.findById(id);

    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tutor });
  } catch (error) {
    console.error("Error fetching tutor details:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    const result = await UserRepository.updateUser(id, updateData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating tutor:", error);
    return NextResponse.json(
      { error: "Failed to update tutor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    const result = await UserRepository.deleteUser(id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting tutor:", error);
    return NextResponse.json(
      { error: "Failed to delete tutor" },
      { status: 500 }
    );
  }
}
