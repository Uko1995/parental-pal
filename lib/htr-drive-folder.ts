import { isHtrSummerCampBooking } from "@/lib/camper-id";
import {
  createBookingFolder,
  isGoogleDriveConfigured,
  normalizeFolderName,
  buildFolderUrl,
} from "@/lib/google-drive";
import { BookingRepository } from "@/lib/BookingRepository";
import type { BookingInterface } from "@/models/Booking";
import type { UserInterface } from "@/models/User";

export interface HtrDriveFolderResult {
  folderId: string;
  folderUrl: string;
  folderName: string;
}

function formatChildNamesPart(
  booking: Pick<BookingInterface, "children" | "serviceData">,
): string {
  const children = (booking.children ?? []).map((child) =>
    normalizeFolderName(child.name),
  );

  if (children.length === 0) {
    return "Camper";
  }
  if (children.length <= 2) {
    return children.join(" & ");
  }
  return `${children.slice(0, -1).join(", ")} & ${children.at(-1)}`;
}

function formatChildNamesWithCamperIds(
  booking: Pick<BookingInterface, "children" | "serviceData">,
): string {
  const childrenData = booking.serviceData?.childrenData ?? [];

  return (booking.children ?? [])
    .map((child, index) => {
      const name = normalizeFolderName(child.name);
      const camperId = (
        childrenData[index] as { camperId?: string } | undefined
      )?.camperId;
      return camperId ? `${name} (${camperId})` : name;
    })
    .join(", ");
}

export function buildHtrFolderName(
  booking: Pick<BookingInterface, "parentName" | "children" | "serviceData">,
  user?: Pick<UserInterface, "userData">,
): string {
  const parent = normalizeFolderName(
    booking.parentName ?? user?.userData?.user?.name ?? "Parent",
  );

  const useCamperIdStyle =
    process.env.GOOGLE_DRIVE_FOLDER_NAME_STYLE === "camper-id";
  const childPart = useCamperIdStyle
    ? formatChildNamesWithCamperIds(booking)
    : formatChildNamesPart(booking);

  return `${parent} - ${childPart}`;
}

function buildFolderDescription(
  booking: BookingInterface,
  user: UserInterface,
): string {
  const bookingId = booking._id?.toString() ?? "unknown";
  const userId = user._id?.toString() ?? booking.userId?.toString() ?? "unknown";
  const parentEmail = booking.parentEmail ?? user.userData?.user?.email ?? "";
  const camperIds =
    booking.serviceData?.childrenData
      ?.map((entry) => (entry as { camperId?: string }).camperId)
      .filter(Boolean)
      .join(", ") ?? "";

  return [
    `userId: ${userId}`,
    `bookingId: ${bookingId}`,
    `parentEmail: ${parentEmail}`,
    camperIds ? `camperIds: ${camperIds}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function ensureHtrDriveFolderForBooking(
  booking: BookingInterface,
  user: UserInterface,
): Promise<HtrDriveFolderResult | null> {
  const campSeasonId = booking.serviceData?.campSeasonId;

  if (!isHtrSummerCampBooking(booking.serviceType, campSeasonId)) {
    return null;
  }

  if (!isGoogleDriveConfigured()) {
    console.warn("Google Drive is not configured; skipping folder creation");
    return null;
  }

  if (booking.driveFolderId && booking.driveFolderUrl) {
    return {
      folderId: booking.driveFolderId,
      folderUrl: booking.driveFolderUrl,
      folderName:
        booking.driveFolderName ??
        buildHtrFolderName(booking, user),
    };
  }

  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!parentFolderId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID is not set");
  }

  const folderName = buildHtrFolderName(booking, user);
  const description = buildFolderDescription(booking, user);
  const childNames = (booking.children ?? []).map((child) => child.name);

  const folder = await createBookingFolder(folderName, parentFolderId, {
    childNames,
    description,
  });

  const bookingId = booking._id?.toString();
  if (!bookingId) {
    throw new Error("Booking id is required to persist drive folder");
  }

  const updated = await BookingRepository.updateDriveFolderIfAbsent(bookingId, {
    driveFolderId: folder.folderId,
    driveFolderUrl: folder.folderUrl,
    driveFolderName: folder.folderName,
  });

  if (updated?.driveFolderId && updated.driveFolderUrl) {
    return {
      folderId: updated.driveFolderId,
      folderUrl: updated.driveFolderUrl,
      folderName: updated.driveFolderName ?? folder.folderName,
    };
  }

  return {
    folderId: folder.folderId,
    folderUrl: folder.folderUrl,
    folderName: folder.folderName,
  };
}

export function getExistingDriveFolder(
  booking: Pick<
    BookingInterface,
    "driveFolderId" | "driveFolderUrl" | "driveFolderName" | "parentName" | "children" | "serviceData"
  >,
  user?: UserInterface,
): HtrDriveFolderResult | null {
  if (!booking.driveFolderId || !booking.driveFolderUrl) {
    return null;
  }

  return {
    folderId: booking.driveFolderId,
    folderUrl: booking.driveFolderUrl,
    folderName:
      booking.driveFolderName ?? buildHtrFolderName(booking, user),
  };
}

export { buildFolderUrl };
