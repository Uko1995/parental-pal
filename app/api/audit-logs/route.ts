/**
 * API endpoint for viewing audit logs (admin only)
 * GET /api/audit-logs
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  queryAuditLogs,
  getRecentSecurityEvents,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";
import { rateLimit, getClientIp } from "@/lib/security";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting
  const rateLimitResult = rateLimit(ip, 30, 60000);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authorization check - admin only
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Get recent security events if requested
    if (type === "security") {
      const limit = parseInt(searchParams.get("limit") || "50");
      const events = await getRecentSecurityEvents(limit);
      return NextResponse.json({ events, count: events.length });
    }

    // Query audit logs with filters
    const filters: {
      userId?: string;
      eventType?: AuditEventType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {};

    if (searchParams.get("userId")) {
      filters.userId = searchParams.get("userId")!;
    }

    if (searchParams.get("eventType")) {
      filters.eventType = searchParams.get("eventType") as AuditEventType;
    }

    if (searchParams.get("startDate")) {
      filters.startDate = new Date(searchParams.get("startDate")!);
    }

    if (searchParams.get("endDate")) {
      filters.endDate = new Date(searchParams.get("endDate")!);
    }

    if (searchParams.get("limit")) {
      filters.limit = parseInt(searchParams.get("limit")!);
    }

    const logs = await queryAuditLogs(filters);

    return NextResponse.json({
      logs,
      count: logs.length,
      filters,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
