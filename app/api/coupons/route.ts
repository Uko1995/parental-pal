import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import CouponRepository from "@/lib/CouponRepository";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/coupons - Get all coupons (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
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

    // Serialize for client
    const serializedCoupons = coupons.map((coupon) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: serializedCoupons,
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.code || !body.discountType || body.discountValue === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Code, discount type, and discount value are required",
        },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCoupon = await CouponRepository.getCouponByCode(body.code);
    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const couponData = {
      code: body.code.toUpperCase(),
      description: body.description || "",
      discountType: body.discountType,
      discountValue: body.discountValue,
      maxUses: body.maxUses || 0,
      maxUsesPerUser: body.maxUsesPerUser || 1,
      minimumOrderAmount: body.minimumOrderAmount || 0,
      maximumDiscount: body.maximumDiscount,
      applicableProducts: (body.applicableProducts || []).map(
        (p: string) => new ObjectId(p)
      ),
      applicableCategories: body.applicableCategories || [],
      excludedProducts: (body.excludedProducts || []).map(
        (p: string) => new ObjectId(p)
      ),
      applicableUsers: (body.applicableUsers || []).map(
        (u: string) => new ObjectId(u)
      ),
      firstTimeOnly: body.firstTimeOnly || false,
      validFrom: new Date(body.validFrom || Date.now()),
      validUntil: new Date(
        body.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      isActive: body.isActive !== false,
      createdBy: new ObjectId(session.user.id),
    };

    const coupon = await CouponRepository.createCoupon(couponData);

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.COUPONS);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        data: {
          ...coupon,
          _id: coupon._id?.toString(),
          createdBy: coupon.createdBy.toString(),
          validFrom: coupon.validFrom.toISOString(),
          validUntil: coupon.validUntil.toISOString(),
          createdAt: coupon.createdAt.toISOString(),
          updatedAt: coupon.updatedAt.toISOString(),
        },
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
