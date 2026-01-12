import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import CouponRepository from "@/lib/CouponRepository";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/coupons/[id] - Get coupon by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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

    // Get usage stats
    const stats = await CouponRepository.getCouponStats(id);

    return NextResponse.json({
      success: true,
      data: {
        ...coupon,
        _id: coupon._id?.toString(),
        applicableProducts: coupon.applicableProducts.map((p) => p.toString()),
        excludedProducts: coupon.excludedProducts.map((p) => p.toString()),
        applicableUsers: coupon.applicableUsers.map((u) => u.toString()),
        createdBy: coupon.createdBy.toString(),
        validFrom: coupon.validFrom.toISOString(),
        validUntil: coupon.validUntil.toISOString(),
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PATCH /api/coupons/[id] - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Handle date conversions
    if (body.validFrom) {
      body.validFrom = new Date(body.validFrom);
    }
    if (body.validUntil) {
      body.validUntil = new Date(body.validUntil);
    }

    const coupon = await CouponRepository.updateCoupon(id, body);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: {
        ...coupon,
        _id: coupon._id?.toString(),
        createdBy: coupon.createdBy.toString(),
        validFrom: coupon.validFrom.toISOString(),
        validUntil: coupon.validUntil.toISOString(),
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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

    // Invalidate cache immediately
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
