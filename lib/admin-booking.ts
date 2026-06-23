import { ObjectId } from "mongodb";
import { UserRepository } from "@/lib/UserRepository";
import {
  parseFormDataToBooking,
  type BookingFormEntries,
} from "@/app/booking/action";
import { BookingRepository } from "@/lib/BookingRepository";
import { ensureHtrDriveFolderForBooking } from "@/lib/htr-drive-folder";
import type { BookingInterface } from "@/models/Booking";
import type { UserInterface } from "@/models/User";

const PARENT_NOT_FOUND_MESSAGE =
  "No parent account found for this email. Create the parent in Dashboard → Parents first.";

export async function resolveParentUserForAdminBooking(
  parentEmail: string,
): Promise<
  | { ok: true; parent: UserInterface }
  | { ok: false; status: number; error: string }
> {
  const trimmed = parentEmail.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, status: 400, error: "Parent email is required" };
  }

  const parent = await UserRepository.findByEmail(trimmed);
  if (!parent?._id || parent.role !== "parent") {
    return { ok: false, status: 404, error: PARENT_NOT_FOUND_MESSAGE };
  }

  return { ok: true, parent };
}

function parentSessionUser(parent: UserInterface) {
  return {
    name: parent.userData?.user?.name ?? null,
    email: parent.userData?.user?.email ?? null,
    image: parent.userData?.user?.image ?? null,
  };
}

export async function previewAdminBookingPrice(
  formEntries: BookingFormEntries,
): Promise<
  | { ok: true; totalAmount: number; currency: string }
  | { ok: false; status: number; error: string }
> {
  const parentEmail =
    formEntries.parentEmail?.trim() || formEntries.parentEmail;
  if (!parentEmail) {
    return { ok: false, status: 400, error: "Parent email is required" };
  }

  const parentResult = await resolveParentUserForAdminBooking(parentEmail);
  if (!parentResult.ok) {
    return {
      ok: false,
      status: parentResult.status,
      error: parentResult.error,
    };
  }

  try {
    const bookingData = await parseFormDataToBooking(
      formEntries,
      parentResult.parent._id!,
      parentSessionUser(parentResult.parent),
    );

    return {
      ok: true,
      totalAmount: bookingData.pricing?.totalAmount || 0,
      currency: bookingData.pricing?.currency || "NGN",
    };
  } catch (error) {
    return {
      ok: false,
      status: 400,
      error: error instanceof Error ? error.message : "Could not calculate price",
    };
  }
}

export async function createAdminBookingFromEntries(
  formEntries: BookingFormEntries,
): Promise<
  | { ok: true; booking: BookingInterface }
  | { ok: false; status: number; error: string }
> {
  const parentEmail = formEntries.parentEmail?.trim();
  if (!parentEmail) {
    return { ok: false, status: 400, error: "Parent email is required" };
  }

  const parentResult = await resolveParentUserForAdminBooking(parentEmail);
  if (!parentResult.ok) {
    return {
      ok: false,
      status: parentResult.status,
      error: parentResult.error,
    };
  }

  const parent = parentResult.parent;

  try {
    const bookingData = await parseFormDataToBooking(
      formEntries,
      parent._id!,
      parentSessionUser(parent),
    );

    bookingData.userId = new ObjectId(parent._id!);
    bookingData.status = "pending";

    const booking = await BookingRepository.createBooking(bookingData);

    try {
      await ensureHtrDriveFolderForBooking(booking, parent);
    } catch (driveError) {
      console.error("HTR Drive folder provisioning failed:", {
        driveError,
        bookingId: booking._id?.toString(),
      });
    }

    return { ok: true, booking };
  } catch (error) {
    return {
      ok: false,
      status: 400,
      error: error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}
