import { getCollection, getDb } from "./mongodb";
import { FeedbackInterface, FeedbackSchema } from "@/models/Feedback";

export class FeedbackRepository {
  private static collectionName = "feedback";

  static async initialize() {
    try {
      const db = await getDb();
      const collection = await getCollection<FeedbackInterface>(
        this.collectionName
      );

      await db
        .command({
          collMod: this.collectionName,
          validator: FeedbackSchema.validator,
        })
        .catch(() => {
          console.log("Creating feedback collection with validation...");
        });

      await collection.createIndex({ createdAt: -1 }, { name: "idx_createdAt" });
      await collection.createIndex(
        { interestLevel: 1 },
        { name: "idx_interestLevel" }
      );
      await collection.createIndex(
        { servicesInterested: 1 },
        { name: "idx_servicesInterested" }
      );
    } catch (error) {
      console.error("Error initializing feedback collection:", error);
      throw error;
    }
  }

  static async createFeedback(
    feedbackData: Omit<FeedbackInterface, "_id" | "createdAt">
  ): Promise<FeedbackInterface> {
    const collection = await getCollection<FeedbackInterface>(
      this.collectionName
    );
    const newFeedback: FeedbackInterface = {
      ...feedbackData,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newFeedback);
    return { ...newFeedback, _id: result.insertedId };
  }

  static async getFeedbackList(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ items: FeedbackInterface[]; total: number }> {
    const collection = await getCollection<FeedbackInterface>(
      this.collectionName
    );

    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      collection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments({}),
    ]);

    return { items, total };
  }
}

export default FeedbackRepository;
