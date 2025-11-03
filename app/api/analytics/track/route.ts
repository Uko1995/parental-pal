import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import {
  AnalyticsEventInterface,
  AnalyticsSessionInterface,
} from "@/models/Analytics";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

// Helper to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent
    )
  ) {
    deviceType = "mobile";
  }

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("edge")) browser = "Edge";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("opera")) browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    os = "iOS";

  return { deviceType, browser, os };
}

// POST /api/analytics/track - Track analytics events
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const userAgent = request.headers.get("user-agent") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "";

    const {
      eventType,
      eventName,
      sessionId,
      path,
      referrer,
      metadata,
      duration,
    } = body;

    // Validate required fields
    if (!eventType || !eventName || !sessionId || !path) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse user agent
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Get collections
    const sessionsCollection = await getCollection<AnalyticsSessionInterface>(
      "analyticssessions"
    );
    const eventsCollection = await getCollection<AnalyticsEventInterface>(
      "analyticsevents"
    );

    // Create or update session
    const existingSession = await sessionsCollection.findOne({ sessionId });

    let analyticsSessionId: ObjectId;

    if (!existingSession) {
      const newSession: Omit<AnalyticsSessionInterface, "_id"> = {
        sessionId,
        userId: session?.user?.id ? new ObjectId(session.user.id) : undefined,
        startTime: new Date(),
        pageViews: eventType === "page_view" ? 1 : 0,
        events: 1,
        referrer,
        userAgent,
        deviceType,
        browser,
        os,
        ip,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await sessionsCollection.insertOne(
        newSession as AnalyticsSessionInterface
      );
      analyticsSessionId = result.insertedId;
    } else {
      analyticsSessionId = existingSession._id!;

      // Update session
      await sessionsCollection.updateOne(
        { sessionId },
        {
          $inc: {
            pageViews: eventType === "page_view" ? 1 : 0,
            events: 1,
          },
          $set: {
            endTime: new Date(),
            updatedAt: new Date(),
            ...(session?.user?.id &&
              !existingSession.userId && {
                userId: new ObjectId(session.user.id),
              }),
          },
        }
      );
    }

    // Create analytics event
    const newEvent: Omit<AnalyticsEventInterface, "_id"> = {
      eventType,
      eventName,
      userId: session?.user?.id ? new ObjectId(session.user.id) : undefined,
      sessionId,
      path,
      referrer,
      userAgent,
      deviceType,
      browser,
      os,
      ip,
      metadata,
      duration,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const eventResult = await eventsCollection.insertOne(
      newEvent as AnalyticsEventInterface
    );

    return NextResponse.json(
      {
        success: true,
        eventId: eventResult.insertedId.toString(),
        sessionId: analyticsSessionId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to track event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/analytics/track - Get analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const eventType = searchParams.get("eventType");

    // Get collections
    const eventsCollection = await getCollection<AnalyticsEventInterface>(
      "analyticsevents"
    );
    const sessionsCollection = await getCollection<AnalyticsSessionInterface>(
      "analyticssessions"
    );

    // Build query
    interface QueryFilter {
      timestamp?: {
        $gte?: Date;
        $lte?: Date;
      };
      eventType?:
        | "page_view"
        | "signup"
        | "login"
        | "booking"
        | "payment"
        | "click"
        | "form_submit"
        | "custom";
    }

    const query: QueryFilter = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (eventType) {
      query.eventType = eventType as QueryFilter["eventType"];
    }

    // Get counts
    const totalEvents = await eventsCollection.countDocuments(query);

    interface SessionQueryFilter {
      startTime?: {
        $gte?: Date;
        $lte?: Date;
      };
    }

    const sessionQuery: SessionQueryFilter = {};
    if (startDate || endDate) {
      sessionQuery.startTime = {};
      if (startDate) sessionQuery.startTime.$gte = new Date(startDate);
      if (endDate) sessionQuery.startTime.$lte = new Date(endDate);
    }

    const totalSessions = await sessionsCollection.countDocuments(sessionQuery);

    // Get events by type
    const eventsByType = await eventsCollection
      .aggregate([
        { $match: query },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Get top pages
    const topPages = await eventsCollection
      .aggregate([
        { $match: { ...query, eventType: "page_view" } },
        { $group: { _id: "$path", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Get device breakdown
    const deviceBreakdown = await eventsCollection
      .aggregate([
        { $match: query },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      ])
      .toArray();

    return NextResponse.json({
      totalEvents,
      totalSessions,
      eventsByType,
      topPages,
      deviceBreakdown,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
