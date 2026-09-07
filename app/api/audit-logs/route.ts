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

const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  // Authentication check — admin session is enough; no rate limit on this read path
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
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const limit = Math.min(
      Math.max(
        parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10) ||
          DEFAULT_PAGE_SIZE,
        1,
      ),
      100,
    );
    const skip = (page - 1) * limit;

    // Get recent security events if requested
    if (type === "security") {
      const { events, total } = await getRecentSecurityEvents(limit, skip);
      const totalPages = Math.max(Math.ceil(total / limit), 1);
      return NextResponse.json({
        events,
        count: events.length,
        total,
        page,
        limit,
        totalPages,
      });
    }

    // Query audit logs with filters
    const filters: {
      userId?: string;
      userEmail?: string;
      eventType?: AuditEventType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      skip?: number;
    } = {
      limit,
      skip,
    };

    if (searchParams.get("userId")) {
      filters.userId = searchParams.get("userId")!;
    }

    if (searchParams.get("userEmail")) {
      filters.userEmail = searchParams.get("userEmail")!;
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

    const { logs, total } = await queryAuditLogs(filters);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json({
      logs,
      count: logs.length,
      total,
      page,
      limit,
      totalPages,
      filters,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
