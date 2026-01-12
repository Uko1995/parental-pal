import { ObjectId } from "mongodb";

// TypeScript interface for Review
export interface ReviewInterface {
  _id?: ObjectId;
  productId: ObjectId;
  userId: ObjectId;
  orderId: ObjectId; // Verify purchase before allowing review

  // Reviewer info
  reviewerName: string;
  reviewerEmail: string;

  // Review content
  rating: number; // 1-5 stars
  title: string;
  content: string;

  // Media (optional)
  images?: string[]; // Cloudinary URLs

  // Status
  status: "pending" | "approved" | "rejected" | "flagged";
  verifiedPurchase: boolean;

  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;

  // Admin response
  adminResponse?: {
    content: string;
    respondedAt: Date;
    respondedBy: ObjectId;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB schema validation for Review
export const ReviewSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "productId",
        "userId",
        "orderId",
        "reviewerName",
        "reviewerEmail",
        "rating",
        "title",
        "content",
        "status",
        "verifiedPurchase",
        "helpfulCount",
        "notHelpfulCount",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        productId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        orderId: { bsonType: "objectId" },
        reviewerName: { bsonType: "string" },
        reviewerEmail: { bsonType: "string" },
        rating: {
          bsonType: "int",
          minimum: 1,
          maximum: 5,
        },
        title: { bsonType: "string", maxLength: 200 },
        content: { bsonType: "string", maxLength: 2000 },
        images: { bsonType: "array" },
        status: {
          enum: ["pending", "approved", "rejected", "flagged"],
        },
        verifiedPurchase: { bsonType: "bool" },
        helpfulCount: { bsonType: "int", minimum: 0 },
        notHelpfulCount: { bsonType: "int", minimum: 0 },
        adminResponse: {
          bsonType: "object",
          properties: {
            content: { bsonType: "string" },
            respondedAt: { bsonType: "date" },
            respondedBy: { bsonType: "objectId" },
          },
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
};

// Client-side review type
export interface ClientReview {
  _id: string;
  productId: string;
  userId: string;
  orderId: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  status: "pending" | "approved" | "rejected" | "flagged";
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  adminResponse?: {
    content: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Review summary for product
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
