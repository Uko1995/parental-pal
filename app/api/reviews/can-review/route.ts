import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import ReviewRepository from "@/lib/ReviewRepository";

// GET /api/reviews/can-review - Check if user can review a product
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        canReview: false,
        reason: "Please login to write a review",
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = await ReviewRepository.canUserReview(
      session.user.id,
      productId
    );

    return NextResponse.json({
      success: true,
      canReview: result.canReview,
      reason: result.reason,
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}
