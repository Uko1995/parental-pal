import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/lib/UserRepository";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { rateLimit, getClientIp } from "@/lib/security";
import {
  logDataEvent,
  logAuthEvent,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";

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
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`tutor-delete:${ip}`, 5, 60000);
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
        "Unauthorized tutor delete attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can delete tutors
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to delete tutor"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tutor ID" }, { status: 400 });
    }

    const result = await UserRepository.deleteUser(id);

    logDataEvent(
      AuditEventType.USER_DELETED,
      currentUser._id!.toString(),
      "tutor",
      "delete",
      true,
      { tutorId: id }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting tutor:", error);
    return NextResponse.json(
      { error: "Failed to delete tutor" },
      { status: 500 }
    );
  }
}
