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
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "@/lib/cloudinary";

// Upload types and their configurations
type UploadType = "thumbnail" | "pdf" | "service" | "profile";

interface UploadConfig {
  folder: string;
  resourceType: "image" | "raw" | "auto";
  useCloudinary: boolean;
  allowedMimeTypes: string[];
  maxSize: number; // in bytes
}

const UPLOAD_CONFIGS: Record<UploadType, UploadConfig> = {
  thumbnail: {
    folder: CLOUDINARY_FOLDERS.PRODUCT_THUMBNAILS,
    resourceType: "image",
    useCloudinary: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  pdf: {
    folder: CLOUDINARY_FOLDERS.PRODUCT_PDFS,
    resourceType: "raw",
    useCloudinary: true,
    allowedMimeTypes: ["application/pdf"],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  service: {
    folder: CLOUDINARY_FOLDERS.SERVICES,
    resourceType: "image",
    useCloudinary: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  profile: {
    folder: CLOUDINARY_FOLDERS.TUTOR_PROFILES,
    resourceType: "image",
    useCloudinary: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
};

// Magic number validation for file types
const FILE_SIGNATURES: { [key: string]: number[][] } = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
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
        { status: 429 },
      );
    }

    // Authentication required
    const session = await auth();
    if (!session?.user?.email) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        undefined,
        ip,
        "Unauthenticated upload attempt",
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
        "Unauthorized role attempted upload",
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const uploadType = (data.get("type") as UploadType) || "service";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file received" },
        { status: 400 },
      );
    }

    // Get upload configuration
    const config = UPLOAD_CONFIGS[uploadType] || UPLOAD_CONFIGS.service;

    // Validate file size
    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${
            config.maxSize / (1024 * 1024)
          }MB`,
        },
        { status: 400 },
      );
    }

    // Validate MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    // Validate with security utility using upload-specific rules
    const validation = validateFileUpload(
      file,
      config.maxSize,
      config.allowedMimeTypes,
    );
    if (!validation.valid) {
      logSecurityEvent(
        AuditEventType.SUSPICIOUS_ACTIVITY,
        currentUser._id?.toString(),
        ip,
        `Invalid file upload: ${validation.errors}`,
      );
      return NextResponse.json(
        { success: false, error: validation.errors },
        { status: 400 },
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
        "File magic number mismatch - possible MIME spoofing",
      );
      return NextResponse.json(
        { success: false, error: "Invalid file format" },
        { status: 400 },
      );
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const fileExtension = safeFilename.split(".").pop()?.toLowerCase();

    // Upload to Cloudinary or local storage based on config
    if (config.useCloudinary) {
      const publicId = `${uploadType}-${timestamp}-${currentUser._id}`;

      const result = await uploadToCloudinary(buffer, {
        folder: config.folder,
        publicId,
        resourceType: config.resourceType,
      });

      logDataEvent(
        AuditEventType.FILE_UPLOADED,
        currentUser._id!.toString(),
        "file",
        "create",
        true,
        {
          publicId: result.publicId,
          size: file.size,
          type: file.type,
          folder: config.folder,
          storage: "cloudinary",
        },
      );

      return NextResponse.json({
        success: true,
        url: result.secureUrl,
        public_id: result.publicId,
        secure_url: result.secureUrl,
      });
    } else {
      // Local storage (backward compatibility for service images)
      const filename = `service-${timestamp}-${currentUser._id}.${fileExtension}`;
      const filepath = join(process.cwd(), "public/images/services", filename);

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
          storage: "local",
        },
      );

      return NextResponse.json({
        success: true,
        filename,
        url: `/images/services/${filename}`,
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
