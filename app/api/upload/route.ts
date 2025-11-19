import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { rateLimit, getClientIp, validateFileUpload } from "@/lib/security";
import {
  logDataEvent,
  logSecurityEvent,
  AuditEventType,
} from "@/lib/audit-logger-mongodb";

// Magic number validation for file types
const FILE_SIGNATURES: { [key: string]: number[][] } = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function validateMagicNumbers(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some((signature) => {
    return signature.every((byte, index) => buffer[index] === byte);
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limiting: 10 uploads per hour per IP
    const rateLimitResult = rateLimit(`upload:${ip}`, 10, 3600000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many upload requests" },
        { status: 429 }
      );
    }

    // Authentication required
    const session = await auth();
    if (!session?.user?.email) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        undefined,
        ip,
        "Unauthenticated upload attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins and tutors can upload files
    if (!["admin", "tutor"].includes(currentUser.role)) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        "Unauthorized role attempted upload"
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file received" },
        { status: 400 }
      );
    }

    // Validate with security utility
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        `Invalid file upload: ${validation.errors}`
      );
      return NextResponse.json(
        { success: false, error: validation.errors },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic number validation to prevent MIME type spoofing
    if (!validateMagicNumbers(buffer, file.type)) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        "File magic number mismatch - possible MIME spoofing"
      );
      return NextResponse.json(
        { success: false, error: "Invalid file format" },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const fileExtension = safeFilename.split(".").pop()?.toLowerCase();
    const filename = `service-${timestamp}-${currentUser._id}.${fileExtension}`;
    const filepath = join(process.cwd(), "public/images/services", filename);

    // Write file to public/images/services directory
    await writeFile(filepath, buffer);

    logDataEvent(
      AuditEventType.FILE_UPLOADED,
      currentUser._id!.toString(),
      "file",
      "create",
      true,
      {
        filename,
        size: file.size,
        type: file.type,
      }
    );

    return NextResponse.json({
      success: true,
      filename,
      url: `/images/services/${filename}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
