import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import ReviewRepository from "@/lib/ReviewRepository";
import { ObjectId } from "mongodb";
import { CACHE_TAGS } from "@/lib/cache-config";

// GET /api/reviews - Get reviews (with filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const status = searchParams.get("status") as
      | "pending"
      | "approved"
      | "rejected"
      | "flagged"
      | null;
    const sortBy = searchParams.get("sortBy") as
      | "newest"
      | "oldest"
      | "highest"
      | "lowest"
      | "helpful"
      | null;
    const limit = searchParams.get("limit");
    const skip = searchParams.get("skip");

    // If no productId, require auth (admin viewing all reviews)
    if (!productId) {
      const session = await auth();
      if (!session?.user?.email) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const reviews = await ReviewRepository.getAllReviews({
        status: status || undefined,
      });

      const serializedReviews = reviews.map((review) => ({
        ...review,
        _id: review._id?.toString(),
        productId: review.productId.toString(),
        userId: review.userId.toString(),
        orderId: review.orderId.toString(),
        adminResponse: review.adminResponse
          ? {
              ...review.adminResponse,
              respondedAt: review.adminResponse.respondedAt.toISOString(),
              respondedBy: review.adminResponse.respondedBy.toString(),
            }
          : undefined,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: serializedReviews,
      });
    }

    // Get reviews for a product (public - only approved)
    const options = {
      status: status || ("approved" as const),
      sortBy: sortBy || ("newest" as const),
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    };

    const reviews = await ReviewRepository.getReviewsByProductId(
      productId,
      options
    );
    const summary = await ReviewRepository.getReviewSummary(productId);

    const serializedReviews = reviews.map((review) => ({
      ...review,
      _id: review._id?.toString(),
      productId: review.productId.toString(),
      userId: review.userId.toString(),
      orderId: review.orderId.toString(),
      reviewerEmail: undefined, // Don't expose email
      adminResponse: review.adminResponse
        ? {
            content: review.adminResponse.content,
            respondedAt: review.adminResponse.respondedAt.toISOString(),
          }
        : undefined,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedReviews,
      summary,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Please login to write a review" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.productId || !body.rating || !body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID, rating, title, and content are required",
        },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user can review this product
    const canReview = await ReviewRepository.canUserReview(
      session.user.id,
      body.productId
    );

    if (!canReview.canReview) {
      return NextResponse.json(
        { success: false, error: canReview.reason },
        { status: 400 }
      );
    }

    const reviewData = {
      productId: new ObjectId(body.productId),
      userId: new ObjectId(session.user.id),
      orderId: canReview.orderId!,
      reviewerName: session.user.name || "Anonymous",
      reviewerEmail: session.user.email,
      rating: body.rating,
      title: body.title.slice(0, 200),
      content: body.content.slice(0, 2000),
      images: body.images || [],
      verifiedPurchase: true,
    };

    const review = await ReviewRepository.createReview(reviewData);

    // Invalidate reviews and products cache immediately
    revalidateTag(CACHE_TAGS.REVIEWS);
    revalidateTag(CACHE_TAGS.PRODUCTS);

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted! It will be visible after approval.",
        data: {
          ...review,
          _id: review._id?.toString(),
          productId: review.productId.toString(),
          userId: review.userId.toString(),
          orderId: review.orderId.toString(),
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
