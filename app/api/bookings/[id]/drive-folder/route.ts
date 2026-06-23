import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import { BookingRepository } from "@/lib/BookingRepository";
import { logSecurityEvent, AuditEventType } from "@/lib/audit-logger-mongodb";
import { isHtrSummerCampBooking } from "@/lib/camper-id";
import {
  ensureHtrDriveFolderForBooking,
  getExistingDriveFolder,
} from "@/lib/htr-drive-folder";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const admin = await UserRepository.findByEmail(session.user.email);
  if (!admin || admin.role !== "admin") {
    logSecurityEvent(
      AuditEventType.UNAUTHORIZED_ACCESS,
      admin?._id?.toString(),
      "",
      "Non-admin attempted to manage booking drive folder",
    );
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin };
}

function buildFolderStatus(booking: Awaited<ReturnType<typeof BookingRepository.findById>>) {
  const existing = booking ? getExistingDriveFolder(booking) : null;
  return {
    driveFolderId: existing?.folderId ?? booking?.driveFolderId ?? null,
    driveFolderUrl: existing?.folderUrl ?? booking?.driveFolderUrl ?? null,
    driveFolderName: existing?.folderName ?? booking?.driveFolderName ?? null,
    missing: !existing?.folderUrl && !booking?.driveFolderUrl,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult && authResult.error) {
      return authResult.error;
    }

    const { id: bookingId } = await params;
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      !isHtrSummerCampBooking(
        booking.serviceType,
        booking.serviceData?.campSeasonId,
      )
    ) {
      return NextResponse.json(
        { error: "Drive folders are only available for Holidays That Rock bookings" },
        { status: 400 },
      );
    }

    return NextResponse.json(buildFolderStatus(booking));
  } catch (error) {
    console.error("Error fetching booking drive folder status:", error);
    return NextResponse.json(
      { error: "Failed to fetch drive folder status" },
      { status: 500 },
    );
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAdmin();
    if ("error" in authResult && authResult.error) {
      return authResult.error;
    }

    const { id: bookingId } = await params;
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      !isHtrSummerCampBooking(
        booking.serviceType,
        booking.serviceData?.campSeasonId,
      )
    ) {
      return NextResponse.json(
        { error: "Drive folders are only available for Holidays That Rock bookings" },
        { status: 400 },
      );
    }

    const existing = getExistingDriveFolder(booking);
    if (existing) {
      return NextResponse.json({
        ...existing,
        alreadyExists: true,
      });
    }

    const user = await UserRepository.findById(booking.userId.toString());
    if (!user) {
      return NextResponse.json({ error: "Booking user not found" }, { status: 404 });
    }

    const folder = await ensureHtrDriveFolderForBooking(booking, user);
    if (!folder) {
      return NextResponse.json(
        {
          error:
            "Failed to create drive folder. Check Google Drive configuration and logs.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      folderId: folder.folderId,
      folderUrl: folder.folderUrl,
      folderName: folder.folderName,
      alreadyExists: false,
    });
  } catch (error) {
    console.error("Error creating booking drive folder:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create drive folder",
      },
      { status: 502 },
    );
  }
}
