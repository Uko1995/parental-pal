/**
 * Audit logging utility for security events
 */

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

  //Services events
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
}

/**
 * Log audit event to console (in production, send to logging service)
 */
export function logAuditEvent(log: AuditLog): void {
  const logEntry = {
    ...log,
    timestamp: log.timestamp.toISOString(),
  };

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[AUDIT] ${log.eventType} - ${log.success ? "SUCCESS" : "FAILURE"}`,
      logEntry
    );
  }

  // In production, you would send this to a logging service
  // Examples: Winston, Pino, Datadog, CloudWatch, etc.
  // For now, we'll keep it simple with console logs

  // TODO: Implement production logging service
  // - Store logs in MongoDB
  // - Send to external logging service
  // - Set up alerts for security events
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  eventType: AuditEventType,
  userId: string | undefined,
  email: string | undefined,
  ipAddress: string,
  success: boolean,
  message?: string
): void {
  logAuditEvent({
    timestamp: new Date(),
    eventType,
    userId,
    userEmail: email,
    ipAddress,
    success,
    message,
  });
}

/**
 * Log data modification event
 */
export function logDataEvent(
  eventType: AuditEventType,
  userId: string,
  resource: string,
  action: string,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    timestamp: new Date(),
    eventType,
    userId,
    resource,
    action,
    success,
    metadata,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(
  eventType: AuditEventType,
  userId: string | undefined,
  ipAddress: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  logAuditEvent({
    timestamp: new Date(),
    eventType,
    userId,
    ipAddress,
    success: false,
    message,
    metadata,
  });
}
