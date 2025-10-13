import {
  Collection,
  ObjectId,
  InsertOneResult,
  DeleteResult,
  IndexSpecification,
  Filter,
} from "mongodb";
import { getCollection } from "./mongodb";
import {
  PostInterface,
  PostStatus,
  PostCategory,
  PostValidationSchema,
  PostIndexes,
  PostUtils,
  PostComputed,
  POST_COLLECTION,
} from "../models/Post";

export class PostRepository {
  private collection: Collection<PostInterface> | null = null;

  async ensureConnection(): Promise<Collection<PostInterface>> {
    if (!this.collection) {
      this.collection = await getCollection<PostInterface>(POST_COLLECTION);
    }
    return this.collection;
  }

  // Initialize collection with validation schema and indexes
  static async initialize(): Promise<void> {
    console.log("🔄 Initializing Posts collection...");

    try {
      const collection = await getCollection<PostInterface>(POST_COLLECTION);

      // Create collection with JSON Schema validation
      try {
        await collection.drop();
        console.log("  📦 Dropped existing collection");
      } catch {
        // Collection doesn't exist, which is fine
      }

      // Create collection with validation
      const db = collection.db;
      await db.createCollection(POST_COLLECTION, {
        validator: PostValidationSchema,
      });
      console.log("  📋 Applied JSON Schema validation");

      // Create indexes
      const newCollection = await getCollection<PostInterface>(POST_COLLECTION);
      for (const index of PostIndexes) {
        await newCollection.createIndex(index as unknown as IndexSpecification);
      }
      console.log(`  🔍 Created ${PostIndexes.length} indexes`);

      console.log("✅ Posts collection initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Posts collection:", error);
      throw error;
    }
  }

  // Create a new post
  async create(
    postData: Omit<PostInterface, "_id" | "createdAt" | "updatedAt">
  ): Promise<PostInterface> {
    const collection = await this.ensureConnection();
    const post = PostUtils.prepareForInsert(postData);

    const result: InsertOneResult<PostInterface> = await collection.insertOne(
      post
    );

    const createdPost = await collection.findOne({ _id: result.insertedId });
    if (!createdPost) {
      throw new Error("Failed to retrieve created post");
    }

    return createdPost;
  }

  // Find post by ID
  async findById(id: string | ObjectId): Promise<PostInterface | null> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    return await collection.findOne({ _id: objectId });
  }

  // Find post by slug
  async findBySlug(slug: string): Promise<PostInterface | null> {
    const collection = await this.ensureConnection();
    return await collection.findOne({ slug });
  }

  // Update post by ID
  async update(
    id: string | ObjectId,
    updates: Partial<PostInterface>
  ): Promise<PostInterface | null> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const updateData = PostUtils.prepareForUpdate(updates);

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return result || null;
  }

  // Delete post by ID
  async delete(id: string | ObjectId): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result: DeleteResult = await collection.deleteOne({ _id: objectId });
    return result.deletedCount === 1;
  }

  // Find all published posts
  async findPublished(
    skip: number = 0,
    limit: number = 10
  ): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find({
        status: "published",
        publishedAt: { $lte: new Date() },
      } as Filter<PostInterface>)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Find posts by category
  async findByCategory(
    category: PostCategory,
    skip: number = 0,
    limit: number = 10
  ): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find({
        status: "published",
        category,
        publishedAt: { $lte: new Date() },
      } as Filter<PostInterface>)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Find posts by tag
  async findByTag(
    tag: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find({
        status: "published",
        tags: { $in: [tag] },
        publishedAt: { $lte: new Date() },
      } as Filter<PostInterface>)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Find featured posts
  async findFeatured(limit: number = 3): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find({
        status: "published",
        isFeatured: true,
        publishedAt: { $lte: new Date() },
      } as Filter<PostInterface>)
      .sort({ displayOrder: 1, publishedAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Find popular posts
  async findPopular(limit: number = 5): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find({
        status: "published",
        publishedAt: { $lte: new Date() },
      } as Filter<PostInterface>)
      .sort({ views: -1, likes: -1, publishedAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Search posts
  async searchPosts(
    query: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find({
        status: "published",
        publishedAt: { $lte: new Date() },
        $or: [
          { title: { $regex: query, $options: "i" } },
          { excerpt: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
          { keywords: { $in: [new RegExp(query, "i")] } },
        ],
      } as Filter<PostInterface>)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  // Get recent posts
  async getRecentPosts(limit: number = 10): Promise<Partial<PostInterface>[]> {
    const collection = await this.ensureConnection();

    return await collection
      .find(
        {
          status: "published",
          publishedAt: { $lte: new Date() },
        } as Filter<PostInterface>,
        {
          projection: {
            title: 1,
            slug: 1,
            excerpt: 1,
            featuredImage: 1,
            authorName: 1,
            publishedAt: 1,
            readTime: 1,
            category: 1,
          },
        }
      )
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Get related posts
  async getRelatedPosts(
    postId: string | ObjectId,
    tags: string[],
    category: string,
    limit: number = 3
  ): Promise<PostInterface[]> {
    const collection = await this.ensureConnection();
    const objectId = typeof postId === "string" ? new ObjectId(postId) : postId;

    return await collection
      .find({
        _id: { $ne: objectId },
        status: "published",
        publishedAt: { $lte: new Date() },
        $or: [{ tags: { $in: tags } }, { category }],
      } as Filter<PostInterface>)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Get post analytics
  async getPostAnalytics(): Promise<
    {
      _id: string;
      totalPosts: number;
      totalViews: number;
      totalLikes: number;
      totalShares: number;
      averageReadTime: number;
    }[]
  > {
    const collection = await this.ensureConnection();

    const result = await collection
      .aggregate([
        { $match: { status: "published" } },
        {
          $group: {
            _id: "$category",
            totalPosts: { $sum: 1 },
            totalViews: { $sum: "$views" },
            totalLikes: { $sum: "$likes" },
            totalShares: { $sum: "$shares" },
            averageReadTime: { $avg: "$readTime" },
          },
        },
        { $sort: { totalViews: -1 } },
      ])
      .toArray();

    return result as {
      _id: string;
      totalPosts: number;
      totalViews: number;
      totalLikes: number;
      totalShares: number;
      averageReadTime: number;
    }[];
  }

  // Increment views
  async incrementViews(id: string | ObjectId): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.updateOne(
      { _id: objectId },
      { $inc: { views: 1 }, $set: { updatedAt: new Date() } }
    );

    return result.modifiedCount === 1;
  }

  // Add like
  async addLike(id: string | ObjectId): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.updateOne(
      { _id: objectId },
      { $inc: { likes: 1 }, $set: { updatedAt: new Date() } }
    );

    return result.modifiedCount === 1;
  }

  // Add share
  async addShare(id: string | ObjectId): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.updateOne(
      { _id: objectId },
      { $inc: { shares: 1 }, $set: { updatedAt: new Date() } }
    );

    return result.modifiedCount === 1;
  }

  // Add comment
  async addComment(
    id: string | ObjectId,
    commentData: {
      authorName: string;
      authorEmail?: string;
      content: string;
    }
  ): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const comment = {
      _id: new ObjectId(),
      ...commentData,
      isApproved: false,
      createdAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: objectId },
      {
        $push: { comments: comment },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount === 1;
  }

  // Approve comment
  async approveComment(
    postId: string | ObjectId,
    commentId: string | ObjectId
  ): Promise<boolean> {
    const collection = await this.ensureConnection();
    const postObjectId =
      typeof postId === "string" ? new ObjectId(postId) : postId;
    const commentObjectId =
      typeof commentId === "string" ? new ObjectId(commentId) : commentId;

    const result = await collection.updateOne(
      { _id: postObjectId, "comments._id": commentObjectId },
      {
        $set: {
          "comments.$.isApproved": true,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount === 1;
  }

  // Publish post
  async publish(id: string | ObjectId): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const updateData: Partial<PostInterface> = {
      status: "published" as PostStatus,
      updatedAt: new Date(),
    };

    // Set publishedAt if not already set
    const post = await this.findById(objectId);
    if (post && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    return result.modifiedCount === 1;
  }

  // Archive post
  async archive(id: string | ObjectId): Promise<boolean> {
    const collection = await this.ensureConnection();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { status: "archived", updatedAt: new Date() } }
    );

    return result.modifiedCount === 1;
  }

  // Get post with computed fields
  async findByIdWithComputed(id: string | ObjectId): Promise<
    | (PostInterface & {
        formattedDate: string;
        engagementScore: number;
        commentCount: number;
        ageGroupDisplay: string;
      })
    | null
  > {
    const post = await this.findById(id);
    return post ? PostComputed.addComputedFields(post) : null;
  }

  // Find posts with computed fields
  async findWithComputed(
    filter: Partial<PostInterface>,
    skip: number = 0,
    limit: number = 10
  ): Promise<
    (PostInterface & {
      formattedDate: string;
      engagementScore: number;
      commentCount: number;
      ageGroupDisplay: string;
    })[]
  > {
    const collection = await this.ensureConnection();
    const posts = await collection
      .find(filter as Filter<PostInterface>)
      .skip(skip)
      .limit(limit)
      .toArray();

    return posts.map((post) => PostComputed.addComputedFields(post));
  }

  // Count posts
  async count(filter: Partial<PostInterface> = {}): Promise<number> {
    const collection = await this.ensureConnection();
    return await collection.countDocuments(filter as Filter<PostInterface>);
  }

  // Count published posts
  async countPublished(): Promise<number> {
    const collection = await this.ensureConnection();
    return await collection.countDocuments({
      status: "published",
      publishedAt: { $lte: new Date() },
    } as Filter<PostInterface>);
  }
}

// Export singleton instance
export const postRepository = new PostRepository();
