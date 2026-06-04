const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** Normalize MongoDB ids for reliable string comparison (client + server safe). */
export function normalizeMongoId(value: unknown): string | null {
  if (value == null) return null;

  let raw: string;
  if (typeof value === "string") {
    raw = value.trim();
  } else if (typeof value === "object" && "toString" in value) {
    raw = String((value as { toString(): string }).toString()).trim();
  } else {
    raw = String(value).trim();
  }

  if (!raw) return null;
  if (OBJECT_ID_RE.test(raw)) return raw.toLowerCase();
  return raw;
}

function normalizeEmail(email?: string | null): string | null {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
}

export function bookingBelongsToUser(
  booking: {
    userId?: unknown;
    parentEmail?: string | null;
  },
  user: {
    _id?: unknown;
    userData?: { user?: { email?: string | null } };
  },
  session?: {
    id?: string;
    email?: string | null;
  },
): boolean {
  const ownerIds = new Set<string>();
  const dbUserId = normalizeMongoId(user._id);
  const sessionUserId = session?.id ? normalizeMongoId(session.id) : null;
  if (dbUserId) ownerIds.add(dbUserId);
  if (sessionUserId) ownerIds.add(sessionUserId);

  const bookingUserId = normalizeMongoId(booking.userId);
  if (bookingUserId && ownerIds.has(bookingUserId)) {
    return true;
  }

  const ownerEmails = new Set<string>();
  const dbEmail = normalizeEmail(user.userData?.user?.email);
  const sessionEmail = normalizeEmail(session?.email);
  if (dbEmail) ownerEmails.add(dbEmail);
  if (sessionEmail) ownerEmails.add(sessionEmail);

  const bookingEmail = normalizeEmail(booking.parentEmail);
  if (bookingEmail && ownerEmails.has(bookingEmail)) {
    return true;
  }

  return false;
}
