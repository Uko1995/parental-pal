import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ServiceInterface } from "@/models/Service";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { rateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import {
  logDataEvent,
  logAuthEvent,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";

export async function GET() {
  try {
    const collection = await getCollection("services");
    const services = (await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()) as ServiceInterface[];

    // Convert ObjectIds to strings for client components
    const serializedServices = services.map((service) => ({
      ...service,
      _id: service._id?.toString(),
    }));

    return NextResponse.json({ success: true, data: serializedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`service-create:${ip}`, 10, 60000);
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
        "Unauthorized service create attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can create services
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to create service"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const rawServiceData = await request.json();
    const serviceData = sanitizeObject(rawServiceData);
    const collection = await getCollection("services");

    // Add timestamps
    const newService = {
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newService);

    logDataEvent(
      AuditEventType.SERVICE_CREATED,
      currentUser._id!.toString(),
      "service",
      "create",
      true,
      { serviceId: result.insertedId }
    );

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newService },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, serviceData } = body;

    if (!serviceId || !serviceData) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const collection = await getCollection("services");
    const { ObjectId } = await import("mongodb");

    const updateData = {
      ...serviceData,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(serviceId) },
      { $set: updateData }
    );

    if (result.matchedCount > 0) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Service not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update service" },
      { status: 500 }
    );
  }
}
