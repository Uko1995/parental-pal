import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { UserRepository } from "@/lib/UserRepository";
import {
  BOOKING_PROMO_SERVICE_TYPES,
  type CouponInterface,
} from "@/models/Coupon";

export async function requireAdminUser(): Promise<
  { ok: true; userId: ObjectId } | { ok: false; status: 401 | 403; error: string }
> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  const user = await UserRepository.findByEmail(session.user.email);
  if (!user?._id || user.role !== "admin") {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true, userId: user._id };
}

type CouponInput = Partial<
  Omit<CouponInterface, "_id" | "usedCount" | "createdAt" | "updatedAt" | "createdBy">
>;

function toObjectIds(value: unknown, field: string): ObjectId[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${field} must be a list`);
  return value.map((id) => {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      throw new Error(`${field} contains an invalid id`);
    }
    return new ObjectId(id);
  });
}

function toNonNegativeInt(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${field} must be 0 or more`);
  return Math.floor(n);
}

function toDate(value: unknown, field: string): Date {
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) throw new Error(`${field} is not a valid date`);
  return d;
}

/**
 * Whitelists and validates admin coupon fields. `partial` skips required-field
 * checks (PATCH). Throws an Error with a user-facing message on bad input.
 */
export function parseCouponInput(
  body: Record<string, unknown>,
  options: { partial: boolean; existing?: CouponInterface | null },
): CouponInput {
  const out: CouponInput = {};
  const has = (key: string) => body[key] !== undefined;

  if (has("code") || !options.partial) {
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9'_-]{2,40}$/.test(code)) {
      throw new Error(
        "Code must be 2-40 characters: letters, numbers, dashes or underscores",
      );
    }
    out.code = code;
  }
  if (has("description")) out.description = String(body.description ?? "").trim();
  else if (!options.partial) out.description = "";

  if (has("target") || !options.partial) {
    const target = body.target ?? "products";
    if (target !== "products" && target !== "bookings") {
      throw new Error("Applies to must be bookings or products");
    }
    out.target = target;
  }
  if (has("autoApply") || !options.partial) out.autoApply = Boolean(body.autoApply);

  if (has("applicableServiceTypes") || !options.partial) {
    const services = Array.isArray(body.applicableServiceTypes)
      ? body.applicableServiceTypes.map(String)
      : [];
    const invalid = services.filter(
      (s) => !(BOOKING_PROMO_SERVICE_TYPES as readonly string[]).includes(s),
    );
    if (invalid.length) throw new Error(`Unknown service: ${invalid.join(", ")}`);
    out.applicableServiceTypes = services;
  }
  if (has("tutoringLocation")) {
    const location = body.tutoringLocation;
    if (location === "" || location === null || location === "any") {
      out.tutoringLocation = undefined;
    } else if (location === "virtual" || location === "physical") {
      out.tutoringLocation = location;
    } else {
      throw new Error("Tutoring location must be any, virtual or physical");
    }
  }

  if (has("discountType") || !options.partial) {
    if (body.discountType !== "percentage" && body.discountType !== "fixed") {
      throw new Error("Discount type must be percentage or fixed");
    }
    out.discountType = body.discountType;
  }
  if (has("discountValue") || !options.partial) {
    const value = Number(body.discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Discount value must be greater than 0");
    }
    out.discountValue = value;
  }
  const discountType = out.discountType ?? options.existing?.discountType;
  const discountValue = out.discountValue ?? options.existing?.discountValue;
  if (discountType === "percentage" && discountValue !== undefined) {
    if (discountValue < 1 || discountValue > 100) {
      throw new Error("Percentage discounts must be between 1 and 100");
    }
  }

  if (has("maxUses") || !options.partial) out.maxUses = toNonNegativeInt(body.maxUses ?? 0, "Total uses");
  if (has("maxUsesPerUser") || !options.partial) {
    out.maxUsesPerUser = toNonNegativeInt(body.maxUsesPerUser ?? 0, "Uses per customer");
  }
  if (has("minimumOrderAmount") || !options.partial) {
    out.minimumOrderAmount = toNonNegativeInt(body.minimumOrderAmount ?? 0, "Minimum amount");
  }
  if (has("maximumDiscount")) {
    const max = body.maximumDiscount;
    out.maximumDiscount =
      max === null || max === "" || Number(max) === 0
        ? undefined
        : toNonNegativeInt(max, "Maximum discount");
  }

  if (has("applicableProducts") || !options.partial) {
    out.applicableProducts = toObjectIds(body.applicableProducts, "Products");
  }
  if (has("excludedProducts") || !options.partial) {
    out.excludedProducts = toObjectIds(body.excludedProducts, "Excluded products");
  }
  if (has("applicableUsers") || !options.partial) {
    out.applicableUsers = toObjectIds(body.applicableUsers, "Customers");
  }
  if (has("applicableCategories") || !options.partial) {
    out.applicableCategories = Array.isArray(body.applicableCategories)
      ? body.applicableCategories.map(String)
      : [];
  }
  if (has("firstTimeOnly") || !options.partial) out.firstTimeOnly = Boolean(body.firstTimeOnly);
  if (has("isActive") || !options.partial) out.isActive = body.isActive !== false;

  if (has("validFrom") || !options.partial) {
    out.validFrom = toDate(body.validFrom ?? new Date().toISOString(), "Start date");
  }
  if (has("validUntil") || !options.partial) {
    out.validUntil = toDate(
      body.validUntil ?? new Date(Date.now() + 30 * 86_400_000).toISOString(),
      "End date",
    );
  }
  const validFrom = out.validFrom ?? options.existing?.validFrom;
  const validUntil = out.validUntil ?? options.existing?.validUntil;
  if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
    throw new Error("End date must be after the start date");
  }

  return out;
}

export function serializeCoupon(coupon: CouponInterface) {
  return {
    ...coupon,
    _id: coupon._id?.toString(),
    target: coupon.target ?? "products",
    autoApply: Boolean(coupon.autoApply),
    applicableServiceTypes: coupon.applicableServiceTypes ?? [],
    applicableProducts: (coupon.applicableProducts ?? []).map((p) => p.toString()),
    excludedProducts: (coupon.excludedProducts ?? []).map((p) => p.toString()),
    applicableUsers: (coupon.applicableUsers ?? []).map((u) => u.toString()),
    createdBy: coupon.createdBy?.toString(),
    validFrom: new Date(coupon.validFrom).toISOString(),
    validUntil: new Date(coupon.validUntil).toISOString(),
    createdAt: new Date(coupon.createdAt).toISOString(),
    updatedAt: new Date(coupon.updatedAt).toISOString(),
  };
}
