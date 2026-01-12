import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { rateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import {
  logDataEvent,
  logAuthEvent,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection("services");
    const service = await collection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Convert ObjectId to string for client components
    const serializedService = {
      ...service,
      _id: service._id.toString(),
    };

    return NextResponse.json({ success: true, data: serializedService });
  } catch (error) {
    console.error("Error fetching service details:", error);
    return NextResponse.json(
      { error: "Failed to fetch service details" },
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
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`service-update:${ip}`, 10, 60000);
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
        "Unauthorized service update attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can update services
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to update service"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const rawUpdateData = await request.json();
    const updateData = sanitizeObject(rawUpdateData);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection("services");

    // Add updated timestamp
    const updatedService = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedService }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    logDataEvent(
      AuditEventType.ADMIN_ACTION,
      currentUser._id!.toString(),
      "service",
      "update",
      true,
      { serviceId: id }
    );

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.SERVICES);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
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
    const rateLimitResult = rateLimit(`service-delete:${ip}`, 5, 60000);
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
        "Unauthorized service delete attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can delete services
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to delete service"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid service ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection("services");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    logDataEvent(
      AuditEventType.ADMIN_ACTION,
      currentUser._id!.toString(),
      "service",
      "delete",
      true,
      { serviceId: id }
    );

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.SERVICES);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
