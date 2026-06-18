/**
 * Audit logging utility with MongoDB persistence
 * Stores security events for forensics and monitoring
 */

import { getCollection } from "./mongodb";

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  REGISTER = "REGISTER",
  PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",

  // Authorization events
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  FORBIDDEN_ACCESS = "FORBIDDEN_ACCESS",

  // Services events
  SERVICE_CREATED = "SERVICE_CREATED",
  SERVICE_UPDATED = "SERVICE_UPDATED",
  SERVICE_DELETED = "SERVICE_DELETED",

  // Data events
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  BOOKING_CREATED = "BOOKING_CREATED",
  BOOKING_UPDATED = "BOOKING_UPDATED",
  BOOKING_DELETED = "BOOKING_DELETED",

  // Security events
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  FILE_UPLOADED = "FILE_UPLOADED",
  FILE_UPLOAD_REJECTED = "FILE_UPLOAD_REJECTED",

  // Admin events
  ADMIN_ACTION = "ADMIN_ACTION",
}

export interface AuditLog {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  success: boolean;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Get audit logs collection
 */
async function getAuditLogsCollection() {
  return getCollection<AuditLog>("auditLogs");
}

/**
 * Initialize indexes for the audit logs collection
 */
export async function initializeAuditLogsIndexes(): Promise<void> {
  try {
    const collection = await getAuditLogsCollection();

    // Index on timestamp for time-based queries
    await collection.createIndex({ timestamp: -1 });

    // Index on userId for user-specific audits
    await collection.createIndex({ userId: 1 });

    // Index on eventType for filtering by event
    await collection.createIndex({ eventType: 1 });

    // Index on ipAddress for IP-based analysis
    await collection.createIndex({ ipAddress: 1 });

    // Compound index for common queries
    await collection.createIndex({ userId: 1, timestamp: -1 });

    // TTL index to auto-delete logs older than 90 days
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 7776000 } // 90 days
    );

    console.log("✓ Audit logs indexes created");
  } catch (error) {
    console.error("Error creating audit logs indexes:", error);
  }
}

/**
 * Log audit event to MongoDB
 */
export async function logAuditEvent(log: AuditLog): Promise<void> {
  try {
    const collection = await getAuditLogsCollection();

    await collection.insertOne({
      ...log,
      createdAt: new Date(),
    } as AuditLog);

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[AUDIT] ${log.eventType} - ${log.success ? "SUCCESS" : "FAILURE"}`,
        {
          ...log,
          timestamp: log.timestamp.toISOString(),
        }
      );
    }
  } catch (error) {
    // Don't throw - we don't want audit logging to break the application
    console.error("Error logging audit event:", error);

    // Fallback to console logging
    console.log(`[AUDIT FALLBACK] ${log.eventType}`, {
      ...log,
      timestamp: log.timestamp.toISOString(),
    });
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  eventType: AuditEventType,
  userId: string | undefined,
  email: string | undefined,
  ipAddress: string,
  success: boolean,
  message?: string
): Promise<void> {
  await logAuditEvent({
    timestamp: new Date(),
    eventType,
    userId,
    userEmail: email,
    ipAddress,
    success,
    message,
    createdAt: new Date(),
  });
}

/**
 * Log data modification event
 */
export async function logDataEvent(
  eventType: AuditEventType,
  userId: string,
  resource: string,
  action: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    timestamp: new Date(),
    eventType,
    userId,
    resource,
    action,
    success,
    metadata,
    createdAt: new Date(),
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: AuditEventType,
  userId: string | undefined,
  ipAddress: string,
  message: string,
  metadata?: Record<string, unknown>,
  success: boolean = false,
): Promise<void> {
  await logAuditEvent({
    timestamp: new Date(),
    eventType,
    userId,
    ipAddress,
    success,
    message,
    metadata,
    createdAt: new Date(),
  });
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AuditLog[]> {
  try {
    const collection = await getAuditLogsCollection();

    const query: Record<string, unknown> = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.eventType) {
      query.eventType = filters.eventType;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        (query.timestamp as Record<string, unknown>).$gte = filters.startDate;
      }
      if (filters.endDate) {
        (query.timestamp as Record<string, unknown>).$lte = filters.endDate;
      }
    }

    return await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .toArray();
  } catch (error) {
    console.error("Error querying audit logs:", error);
    return [];
  }
}

/**
 * Get recent security events (for monitoring)
 */
export async function getRecentSecurityEvents(
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const collection = await getAuditLogsCollection();

    const securityEventTypes = [
      AuditEventType.LOGIN_FAILED,
      AuditEventType.ACCOUNT_LOCKED,
      AuditEventType.UNAUTHORIZED_ACCESS,
      AuditEventType.FORBIDDEN_ACCESS,
      AuditEventType.RATE_LIMIT_EXCEEDED,
      AuditEventType.SUSPICIOUS_ACTIVITY,
      AuditEventType.FILE_UPLOAD_REJECTED,
    ];

    return await collection
      .find({
        eventType: { $in: securityEventTypes },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error getting security events:", error);
    return [];
  }
}
