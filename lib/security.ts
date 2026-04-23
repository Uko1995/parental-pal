import validator from "validator";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { UserInterface } from "@/models";

/**
 * Rate limiting store (in-memory, consider Redis for production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter function
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Sanitize string input to prevent NoSQL injection
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  // Remove any potential MongoDB operators
  return input.replace(/[\${}]/g, "");
}

/**
 * Sanitize object recursively to prevent NoSQL injection
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj === "string" ? { value: sanitizeString(obj) } : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      sanitizeObject(item as Record<string, unknown>),
    ) as unknown as Record<string, unknown>;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove keys that start with $
    if (key.startsWith("$")) continue;

    sanitized[sanitizeString(key)] =
      typeof value === "object" && value !== null
        ? sanitizeObject(value as Record<string, unknown>)
        : typeof value === "string"
          ? sanitizeString(value)
          : value;
  }

  return sanitized;
}
/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  return validator.isMobilePhone(phone, "any");
}

/**
 * Check if user has required role
 */
export async function checkRole(
  allowedRoles: ("admin" | "parent" | "tutor")[],
): Promise<{ authorized: boolean; user: unknown; error?: string }> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        authorized: false,
        user: null,
        error: "Unauthorized - Please sign in",
      };
    }

    const userRole = session.user.role;

    if (!allowedRoles.includes(userRole as "admin" | "parent" | "tutor")) {
      return {
        authorized: false,
        user: session.user,
        error: `Forbidden - ${userRole} role not allowed`,
      };
    }

    return {
      authorized: true,
      user: session.user,
    };
  } catch {
    return {
      authorized: false,
      user: null,
      error: "Authentication error",
    };
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  maxSize: number = 50 * 1024 * 1024,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/x-pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (file.size > maxSize) {
    errors.push(
      `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    );
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push("File type not allowed");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, "_")
    .substring(0, 255);
}

/**
 * Check resource ownership
 */
export async function checkOwnership(
  resourceUserId: string,
  allowAdmin: boolean = true,
): Promise<{ authorized: boolean; error?: string }> {
  const session = await auth();

  if (!session || !session.user) {
    return {
      authorized: false,
      error: "Unauthorized - Please sign in",
    };
  }

  const currentUserId = session.user.id;
  const userRole = session.user.role;

  // Admin can access everything if allowed
  if (allowAdmin && userRole === "admin") {
    return { authorized: true };
  }

  // Check if user owns the resource
  if (currentUserId !== resourceUserId) {
    return {
      authorized: false,
      error: "Forbidden - You don't have permission to access this resource",
    };
  }

  return { authorized: true };
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Remove sensitive fields from user object
 */
export function sanitizeUserData(user: UserInterface): UserInterface {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.googleId;

  return sanitized as UserInterface;
}
