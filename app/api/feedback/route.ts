import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import { auth } from "@/auth";
import FeedbackRepository from "@/lib/FeedbackRepository";
import { InterestLevel } from "@/models/Feedback";
import { getCollection } from "@/lib/mongodb";

const ALLOWED_INTEREST_LEVELS: InterestLevel[] = [
  "very-interested",
  "somewhat-interested",
  "just-exploring",
];

function cleanOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = validator.escape(value.trim());
  return normalized || undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = cleanOptionalString(body.name);
    const email = cleanOptionalString(body.email);
    const phone = cleanOptionalString(body.phone);
    const childAgeRange = cleanOptionalString(body.childAgeRange);
    const customService = cleanOptionalString(body.customService);
    const feedback = cleanOptionalString(body.feedback);
    const consent = body.consent === true;

    const servicesInterested = Array.isArray(body.servicesInterested)
      ? body.servicesInterested
          .filter((item: unknown): item is string => typeof item === "string")
          .map((item: string) => item.trim().toLowerCase())
      : [];

    const interestLevel =
      typeof body.interestLevel === "string"
        ? (body.interestLevel.trim().toLowerCase() as InterestLevel)
        : undefined;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Parent name is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone is required" },
        { status: 400 }
      );
    }

    if (!childAgeRange) {
      return NextResponse.json(
        { success: false, error: "Child age range is required" },
        { status: 400 }
      );
    }

    if (!servicesInterested.length) {
      return NextResponse.json(
        { success: false, error: "Please select at least one service" },
        { status: 400 }
      );
    }

    const servicesCollection = await getCollection("services");
    const existingServices = await servicesCollection
      .find({ status: "active" }, { projection: { name: 1 } })
      .toArray();
    const allowedServices = new Set(
      existingServices
        .map((service) =>
          typeof service.name === "string" ? service.name.trim().toLowerCase() : ""
        )
        .filter(Boolean)
    );
    allowedServices.add("other");

    const invalidService = servicesInterested.some(
      (service: string) => !allowedServices.has(service)
    );
    if (invalidService) {
      return NextResponse.json(
        { success: false, error: "Invalid service selection" },
        { status: 400 }
      );
    }

    if (!interestLevel || !ALLOWED_INTEREST_LEVELS.includes(interestLevel)) {
      return NextResponse.json(
        { success: false, error: "Please select your interest level" },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, error: "Consent is required before submitting" },
        { status: 400 }
      );
    }

    if (email && !validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (phone && !validator.isMobilePhone(phone, "any")) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (servicesInterested.includes("other") && !customService) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide details for the Other service option",
        },
        { status: 400 }
      );
    }

    await FeedbackRepository.createFeedback({
      name,
      email,
      phone,
      childAgeRange,
      servicesInterested,
      customService,
      interestLevel,
      feedback,
      consent,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you. Your feedback has been submitted successfully.",
    });
  } catch (error) {
    console.error("Error creating feedback submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");

    const { items, total } = await FeedbackRepository.getFeedbackList({
      page,
      limit,
    });

    const normalizedPage = Math.max(1, page || 1);
    const normalizedLimit = Math.min(100, Math.max(1, limit || 20));
    const totalPages = Math.max(1, Math.ceil(total / normalizedLimit));

    const data = items.map((item) => ({
      ...item,
      _id: item._id?.toString(),
      createdAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feedback submissions" },
      { status: 500 }
    );
  }
}
