import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import CouponRepository from "@/lib/CouponRepository";
import { CACHE_TAGS } from "@/lib/cache-config";
import {
  parseCouponInput,
  requireAdminUser,
  serializeCoupon,
} from "@/lib/coupon-admin";

// GET /api/coupons/[id] - Get coupon by ID (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin.ok) {
      return NextResponse.json(
        { success: false, error: admin.error },
        { status: admin.status }
      );
    }

    const { id } = await params;
    const coupon = await CouponRepository.getCouponById(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    const stats = await CouponRepository.getCouponStats(id);

    return NextResponse.json({
      success: true,
      data: { ...serializeCoupon(coupon), stats },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PATCH /api/coupons/[id] - Update coupon (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin.ok) {
      return NextResponse.json(
        { success: false, error: admin.error },
        { status: admin.status }
      );
    }

    const { id } = await params;
    const existing = await CouponRepository.getCouponById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    let input;
    try {
      input = parseCouponInput(body, { partial: true, existing });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: (validationError as Error).message },
        { status: 400 }
      );
    }

    if (input.code && input.code !== existing.code) {
      const duplicate = await CouponRepository.getCouponByCode(input.code);
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Coupon code already exists" },
          { status: 400 }
        );
      }
    }

    const coupon = await CouponRepository.updateCoupon(id, input);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    revalidateTag(CACHE_TAGS.COUPONS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: serializeCoupon(coupon),
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    if (!admin.ok) {
      return NextResponse.json(
        { success: false, error: admin.error },
        { status: admin.status }
      );
    }

    const { id } = await params;
    const deleted = await CouponRepository.deleteCoupon(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    revalidateTag(CACHE_TAGS.COUPONS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
