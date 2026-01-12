import { ObjectId } from "mongodb";
import { getCollection, getDb } from "./mongodb";
import { ReviewInterface, ReviewSchema, ReviewSummary } from "../models/Review";

export class ReviewRepository {
  private static collectionName = "reviews";

  // Initialize collection with schema and indexes
  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection(this.collectionName);

      // Create schema validation
      await db
        .command({
          collMod: this.collectionName,
          validator: ReviewSchema.validator,
        })
        .catch(() => {
          console.log("Creating reviews collection with validation...");
        });

      // Create indexes
      try {
        await collection.createIndex(
          { productId: 1, status: 1 },
          { name: "idx_review_product_status" }
        );
      } catch {
        console.log("Review product index may already exist");
      }

      try {
        await collection.createIndex(
          { userId: 1 },
          { name: "idx_review_userId" }
        );
      } catch {
        console.log("Review userId index may already exist");
      }

      try {
        await collection.createIndex(
          { orderId: 1 },
          { unique: true, name: "idx_review_orderId" }
        );
      } catch {
        console.log("Review orderId index may already exist");
      }

      try {
        await collection.createIndex(
          { createdAt: -1 },
          { name: "idx_review_createdAt" }
        );
      } catch {
        console.log("Review createdAt index may already exist");
      }

      console.log("✅ Reviews collection initialized with schema and indexes");
    } catch (error) {
      console.error("❌ Error initializing reviews collection:", error);
      throw error;
    }
  }

  // Create a new review
  static async createReview(
    reviewData: Omit<
      ReviewInterface,
      | "_id"
      | "status"
      | "helpfulCount"
      | "notHelpfulCount"
      | "createdAt"
      | "updatedAt"
    >
  ): Promise<ReviewInterface> {
    const collection = await getCollection(this.collectionName);

    const newReview: ReviewInterface = {
      ...reviewData,
      status: "pending", // Reviews start as pending for moderation
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newReview);
    return { ...newReview, _id: result.insertedId };
  }

  // Get review by ID
  static async getReviewById(
    reviewId: string | ObjectId
  ): Promise<ReviewInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof reviewId === "string" ? new ObjectId(reviewId) : reviewId;

    const review = await collection.findOne({ _id: id });
    return review as ReviewInterface | null;
  }

  // Get reviews by product ID
  static async getReviewsByProductId(
    productId: string | ObjectId,
    options?: {
      status?: ReviewInterface["status"];
      sortBy?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
      limit?: number;
      skip?: number;
    }
  ): Promise<ReviewInterface[]> {
    const collection = await getCollection(this.collectionName);
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const query: Record<string, unknown> = { productId: pid };
    if (options?.status) {
      query.status = options.status;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (options?.sortBy) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest":
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1, createdAt: -1 };
        break;
      case "helpful":
        sortOption = { helpfulCount: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    let cursor = collection.find(query).sort(sortOption);

    if (options?.skip) {
      cursor = cursor.skip(options.skip);
    }
    if (options?.limit) {
      cursor = cursor.limit(options.limit);
    }

    const reviews = await cursor.toArray();
    return reviews as ReviewInterface[];
  }

  // Get reviews by user ID
  static async getReviewsByUserId(
    userId: string | ObjectId
  ): Promise<ReviewInterface[]> {
    const collection = await getCollection(this.collectionName);
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;

    const reviews = await collection
      .find({ userId: uid })
      .sort({ createdAt: -1 })
      .toArray();

    return reviews as ReviewInterface[];
  }

  // Check if user can review a product (must have purchased)
  static async canUserReview(
    userId: string | ObjectId,
    productId: string | ObjectId
  ): Promise<{ canReview: boolean; orderId?: ObjectId; reason?: string }> {
    const ordersCollection = await getCollection("orders");
    const uid = typeof userId === "string" ? new ObjectId(userId) : userId;
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    // Find a paid order for this product
    const order = await ordersCollection.findOne({
      userId: uid,
      productId: pid,
      "payment.status": "success",
    });

    if (!order) {
      return {
        canReview: false,
        reason: "You must purchase this product to review it",
      };
    }

    // Check if user already reviewed this order
    const existingReview = await this.getReviewByOrderId(order._id);
    if (existingReview) {
      return {
        canReview: false,
        reason: "You have already reviewed this product",
      };
    }

    return { canReview: true, orderId: order._id };
  }

  // Get review by order ID
  static async getReviewByOrderId(
    orderId: string | ObjectId
  ): Promise<ReviewInterface | null> {
    const collection = await getCollection(this.collectionName);
    const oid = typeof orderId === "string" ? new ObjectId(orderId) : orderId;

    const review = await collection.findOne({ orderId: oid });
    return review as ReviewInterface | null;
  }

  // Update review status (for moderation)
  static async updateReviewStatus(
    reviewId: string | ObjectId,
    status: ReviewInterface["status"]
  ): Promise<ReviewInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof reviewId === "string" ? new ObjectId(reviewId) : reviewId;

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    // Update product average rating if review is approved
    if (status === "approved") {
      const review = result as ReviewInterface | null;
      if (review) {
        await this.updateProductRating(review.productId);
      }
    }

    return result as ReviewInterface | null;
  }

  // Add admin response to review
  static async addAdminResponse(
    reviewId: string | ObjectId,
    content: string,
    adminId: ObjectId
  ): Promise<ReviewInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof reviewId === "string" ? new ObjectId(reviewId) : reviewId;

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          adminResponse: {
            content,
            respondedAt: new Date(),
            respondedBy: adminId,
          },
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result as ReviewInterface | null;
  }

  // Vote on review helpfulness
  static async voteHelpful(
    reviewId: string | ObjectId,
    isHelpful: boolean
  ): Promise<ReviewInterface | null> {
    const collection = await getCollection(this.collectionName);
    const id = typeof reviewId === "string" ? new ObjectId(reviewId) : reviewId;

    const updateField = isHelpful ? "helpfulCount" : "notHelpfulCount";

    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $inc: { [updateField]: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result as ReviewInterface | null;
  }

  // Get review summary for a product
  static async getReviewSummary(
    productId: string | ObjectId
  ): Promise<ReviewSummary> {
    const collection = await getCollection(this.collectionName);
    const pid =
      typeof productId === "string" ? new ObjectId(productId) : productId;

    const stats = await collection
      .aggregate([
        { $match: { productId: pid, status: "approved" } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            rating1: {
              $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
            },
            rating2: {
              $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
            },
            rating3: {
              $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
            },
            rating4: {
              $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
            },
            rating5: {
              $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const result = stats[0] as {
      averageRating: number;
      totalReviews: number;
      rating1: number;
      rating2: number;
      rating3: number;
      rating4: number;
      rating5: number;
    };

    return {
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      ratingBreakdown: {
        1: result.rating1,
        2: result.rating2,
        3: result.rating3,
        4: result.rating4,
        5: result.rating5,
      },
    };
  }

  // Update product's average rating (called after review status change)
  static async updateProductRating(productId: ObjectId): Promise<void> {
    const productsCollection = await getCollection("products");
    const summary = await this.getReviewSummary(productId);

    await productsCollection.updateOne(
      { _id: productId },
      {
        $set: {
          "metrics.averageRating": summary.averageRating,
          "metrics.totalReviews": summary.totalReviews,
          updatedAt: new Date(),
        },
      }
    );
  }

  // Get all reviews (for admin)
  static async getAllReviews(filters?: {
    status?: ReviewInterface["status"];
    productId?: string;
  }): Promise<ReviewInterface[]> {
    const collection = await getCollection(this.collectionName);

    const query: Record<string, unknown> = {};
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.productId) {
      query.productId = new ObjectId(filters.productId);
    }

    const reviews = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return reviews as ReviewInterface[];
  }

  // Delete review
  static async deleteReview(reviewId: string | ObjectId): Promise<boolean> {
    const collection = await getCollection(this.collectionName);
    const id = typeof reviewId === "string" ? new ObjectId(reviewId) : reviewId;

    // Get review to update product rating after deletion
    const review = await this.getReviewById(id);

    const result = await collection.deleteOne({ _id: id });

    // Update product rating if review was approved
    if (result.deletedCount === 1 && review && review.status === "approved") {
      await this.updateProductRating(review.productId);
    }

    return result.deletedCount === 1;
  }
}

export default ReviewRepository;
