import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ServiceInterface } from "@/models/Service";

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
    const serviceData = await request.json();
    const collection = await getCollection("services");

    // Add timestamps
    const newService = {
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newService);

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
