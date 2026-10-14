import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import CouponRepository from "@/lib/CouponRepository";
import { CACHE_TAGS } from "@/lib/cache-config";
import {
  parseCouponInput,
  requireAdminUser,
  serializeCoupon,
} from "@/lib/coupon-admin";
import type { CouponInterface } from "@/models/Coupon";

// GET /api/coupons - Get all coupons (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (!admin.ok) {
      return NextResponse.json(
        { success: false, error: admin.error },
        { status: admin.status }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get("isActive");
    const validOnly = searchParams.get("validOnly") === "true";

    const filters: { isActive?: boolean; validOnly?: boolean } = {};
    if (isActive !== null) {
      filters.isActive = isActive === "true";
    }
    if (validOnly) {
      filters.validOnly = true;
    }

    const coupons = await CouponRepository.getAllCoupons(filters);

    return NextResponse.json({
      success: true,
      data: coupons.map(serializeCoupon),
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create a new coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (!admin.ok) {
      return NextResponse.json(
        { success: false, error: admin.error },
        { status: admin.status }
      );
    }

    const body = await request.json();

    let input;
    try {
      input = parseCouponInput(body, { partial: false });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: (validationError as Error).message },
        { status: 400 }
      );
    }

    const existingCoupon = await CouponRepository.getCouponByCode(input.code!);
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await CouponRepository.createCoupon({
      ...(input as Omit<
        CouponInterface,
        "_id" | "usedCount" | "createdAt" | "updatedAt" | "createdBy"
      >),
      createdBy: admin.userId,
    });

    revalidateTag(CACHE_TAGS.COUPONS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: serializeCoupon(coupon),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
