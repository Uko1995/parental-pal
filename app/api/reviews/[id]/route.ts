import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import ReviewRepository from "@/lib/ReviewRepository";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/reviews/[id] - Get review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await ReviewRepository.getReviewById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...review,
        _id: review._id?.toString(),
        productId: review.productId.toString(),
        userId: review.userId.toString(),
        orderId: review.orderId.toString(),
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Update review (status, admin response, vote)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle vote (public action)
    if (body.action === "vote") {
      const review = await ReviewRepository.voteHelpful(id, body.isHelpful);

      if (!review) {
        return NextResponse.json(
          { success: false, error: "Review not found" },
          { status: 404 }
        );
      }

      // Invalidate reviews cache immediately
      revalidateTag(CACHE_TAGS.REVIEWS);

      return NextResponse.json({
        success: true,
        message: "Vote recorded",
        data: {
          helpfulCount: review.helpfulCount,
          notHelpfulCount: review.notHelpfulCount,
        },
      });
    }

    // Admin actions require auth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update status
    if (body.status) {
      const review = await ReviewRepository.updateReviewStatus(id, body.status);

      if (!review) {
        return NextResponse.json(
          { success: false, error: "Review not found" },
          { status: 404 }
        );
      }

      // Invalidate reviews and products cache immediately
      revalidateTag(CACHE_TAGS.REVIEWS);
      revalidateTag(CACHE_TAGS.PRODUCTS);

      return NextResponse.json({
        success: true,
        message: `Review ${body.status}`,
        data: {
          _id: review._id?.toString(),
          status: review.status,
        },
      });
    }

    // Add admin response
    if (body.adminResponse) {
      const review = await ReviewRepository.addAdminResponse(
        id,
        body.adminResponse,
        new ObjectId(session.user.id)
      );

      if (!review) {
        return NextResponse.json(
          { success: false, error: "Review not found" },
          { status: 404 }
        );
      }

      // Invalidate reviews cache immediately
      revalidateTag(CACHE_TAGS.REVIEWS);

      return NextResponse.json({
        success: true,
        message: "Response added",
      });
    }

    return NextResponse.json(
      { success: false, error: "No valid action specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user owns the review or is admin
    const review = await ReviewRepository.getReviewById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // For now, allow only admin to delete (add role check when auth is expanded)
    const deleted = await ReviewRepository.deleteReview(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete review" },
        { status: 500 }
      );
    }

    // Invalidate reviews and products cache immediately
    revalidateTag(CACHE_TAGS.REVIEWS);
    revalidateTag(CACHE_TAGS.PRODUCTS);

    return NextResponse.json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
