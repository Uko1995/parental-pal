import { ObjectId } from "mongodb";

export type PostStatus = "draft" | "published" | "archived";
export type PostCategory =
  | "Education Tips"
  | "Success Stories"
  | "Parenting Tips"
  | "Child Development"
  | "Technology"
  | "Early Learning"
  | "STEM Education"
  | "General";

export type ServiceType =
  | "childcare"
  | "tutoring"
  | "homeschooling"
  | "holiday-camps"
  | "space-rental"
  | "kiddies-enrichment";

// Post interface for blog articles - MongoDB native
export interface PostInterface {
  _id?: ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  // Author Information
  authorId?: ObjectId; // Reference to User
  authorName: string;
  authorImage?: string;
  authorBio?: string;

  // Publication Details
  status: PostStatus;
  publishedAt?: Date;
  scheduledFor?: Date;

  // Categorization and SEO
  category: PostCategory;
  tags: string[];
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;

  // Media
  featuredImage?: string;
  images?: string[];
  videos?: string[];

  // Engagement Metrics
  views: number;
  likes: number;
  shares: number;
  comments: {
    _id?: ObjectId;
    authorName: string;
    authorEmail?: string;
    content: string;
    isApproved: boolean;
    createdAt: Date;
  }[];

  // Reading and Display
  readTime: number; // in minutes
  displayOrder: number;
  isFeatured: boolean;
  isPopular: boolean;

  // Related Content
  relatedServices?: ServiceType[];
  targetAgeGroup?: {
    min?: number;
    max?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

// MongoDB JSON Schema validation for Post collection
export const PostValidationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "title",
      "slug",
      "excerpt",
      "content",
      "authorName",
      "category",
      "readTime",
    ],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      title: {
        bsonType: "string",
        maxLength: 200,
        description: "Post title - required, max 200 characters",
      },
      slug: {
        bsonType: "string",
        pattern: "^[a-z0-9-]+$",
        description: "URL-friendly slug - lowercase with hyphens only",
      },
      excerpt: {
        bsonType: "string",
        maxLength: 500,
        description: "Post excerpt - required, max 500 characters",
      },
      content: {
        bsonType: "string",
        maxLength: 50000,
        description: "Post content - required, max 50k characters",
      },

      // Author Information
      authorId: {
        bsonType: ["objectId", "null"],
        description: "Reference to User document",
      },
      authorName: {
        bsonType: "string",
        maxLength: 100,
        description: "Author name - required, max 100 characters",
      },
      authorImage: {
        bsonType: ["string", "null"],
        pattern: "^(https?:\\/\\/.+|\\/.+)?$",
        description: "Author image URL or path",
      },
      authorBio: {
        bsonType: ["string", "null"],
        maxLength: 500,
        description: "Author bio - max 500 characters",
      },

      // Publication Details
      status: {
        bsonType: "string",
        enum: ["draft", "published", "archived"],
        description: "Publication status",
      },
      publishedAt: {
        bsonType: ["date", "null"],
        description: "Publication date",
      },
      scheduledFor: {
        bsonType: ["date", "null"],
        description: "Scheduled publication date",
      },

      // Categorization and SEO
      category: {
        bsonType: "string",
        enum: [
          "Education Tips",
          "Success Stories",
          "Parenting Tips",
          "Child Development",
          "Technology",
          "Early Learning",
          "STEM Education",
          "General",
        ],
        description: "Post category - required",
      },
      tags: {
        bsonType: "array",
        items: {
          bsonType: "string",
          maxLength: 50,
        },
        description: "Post tags array",
      },
      keywords: {
        bsonType: ["array", "null"],
        items: {
          bsonType: "string",
          maxLength: 50,
        },
        description: "SEO keywords array",
      },
      metaTitle: {
        bsonType: ["string", "null"],
        maxLength: 60,
        description: "SEO meta title",
      },
      metaDescription: {
        bsonType: ["string", "null"],
        maxLength: 160,
        description: "SEO meta description",
      },

      // Media
      featuredImage: {
        bsonType: ["string", "null"],
        pattern: "^(https?:\\/\\/.+|\\/.+)?$",
        description: "Featured image URL or path",
      },
      images: {
        bsonType: ["array", "null"],
        items: {
          bsonType: "string",
          pattern: "^(https?:\\/\\/.+|\\/.+)$",
        },
        description: "Additional images array",
      },
      videos: {
        bsonType: ["array", "null"],
        items: {
          bsonType: "string",
          pattern: "^https?:\\/\\/.+$",
        },
        description: "Video URLs array",
      },

      // Engagement Metrics
      views: {
        bsonType: "int",
        minimum: 0,
        description: "View count",
      },
      likes: {
        bsonType: "int",
        minimum: 0,
        description: "Like count",
      },
      shares: {
        bsonType: "int",
        minimum: 0,
        description: "Share count",
      },
      comments: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["authorName", "content", "isApproved", "createdAt"],
          properties: {
            _id: {
              bsonType: "objectId",
            },
            authorName: {
              bsonType: "string",
              maxLength: 100,
            },
            authorEmail: {
              bsonType: ["string", "null"],
              pattern: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$",
            },
            content: {
              bsonType: "string",
              maxLength: 1000,
            },
            isApproved: {
              bsonType: "bool",
            },
            createdAt: {
              bsonType: "date",
            },
          },
        },
        description: "Comments array",
      },

      // Reading and Display
      readTime: {
        bsonType: "int",
        minimum: 1,
        maximum: 60,
        description: "Estimated read time in minutes",
      },
      displayOrder: {
        bsonType: "int",
        minimum: 0,
        description: "Display order for featured posts",
      },
      isFeatured: {
        bsonType: "bool",
        description: "Whether post is featured",
      },
      isPopular: {
        bsonType: "bool",
        description: "Whether post is marked as popular",
      },

      // Related Content
      relatedServices: {
        bsonType: ["array", "null"],
        items: {
          bsonType: "string",
          enum: [
            "childcare",
            "tutoring",
            "homeschooling",
            "holiday-camps",
            "space-rental",
            "kiddies-enrichment",
          ],
        },
        description: "Related service types",
      },
      targetAgeGroup: {
        bsonType: ["object", "null"],
        properties: {
          min: {
            bsonType: ["int", "null"],
            minimum: 0,
            maximum: 18,
          },
          max: {
            bsonType: ["int", "null"],
            minimum: 0,
            maximum: 18,
          },
        },
        description: "Target age range",
      },

      createdAt: {
        bsonType: "date",
        description: "Creation timestamp",
      },
      updatedAt: {
        bsonType: "date",
        description: "Last update timestamp",
      },
    },
  },
};

// Database indexes for performance optimization
export const PostIndexes = [
  // Single field indexes
  { title: 1 },
  { slug: 1 },
  { status: 1 },
  { category: 1 },
  { tags: 1 },
  { publishedAt: -1 },
  { views: -1 },
  { likes: -1 },
  { isFeatured: 1 },
  { isPopular: 1 },
  { createdAt: -1 },
  { authorId: 1 },

  // Compound indexes for common queries
  { status: 1, publishedAt: -1 },
  { category: 1, status: 1 },
  { isFeatured: 1, status: 1 },
  { tags: 1, status: 1 },
];

// Utility functions for post operations
export class PostUtils {
  // Generate slug from title
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  // Calculate read time based on content length (average 200 words per minute)
  static calculateReadTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  // Validate age group constraints
  static validateAgeGroup(targetAgeGroup?: {
    min?: number;
    max?: number;
  }): void {
    if (
      targetAgeGroup?.min !== undefined &&
      targetAgeGroup?.max !== undefined &&
      targetAgeGroup.min > targetAgeGroup.max
    ) {
      throw new Error("Minimum age cannot be greater than maximum age");
    }
  }

  // Generate meta fields
  static generateMetaFields(post: Partial<PostInterface>): {
    metaTitle: string;
    metaDescription: string;
  } {
    return {
      metaTitle: post.metaTitle || post.title?.slice(0, 60) || "",
      metaDescription:
        post.metaDescription || post.excerpt?.slice(0, 160) || "",
    };
  }

  // Prepare post data for database insertion
  static prepareForInsert(
    postData: Omit<PostInterface, "_id" | "createdAt" | "updatedAt">
  ): PostInterface {
    const now = new Date();
    const slug = this.generateSlug(postData.title);
    const readTime = this.calculateReadTime(postData.content);
    const { metaTitle, metaDescription } = this.generateMetaFields(postData);

    // Validate age group
    this.validateAgeGroup(postData.targetAgeGroup);

    // Auto-set published date when status is published
    let publishedAt = postData.publishedAt;
    if (postData.status === "published" && !publishedAt) {
      publishedAt = now;
    }

    return {
      ...postData,
      slug,
      readTime,
      metaTitle,
      metaDescription,
      publishedAt,
      views: postData.views || 0,
      likes: postData.likes || 0,
      shares: postData.shares || 0,
      comments: postData.comments || [],
      displayOrder: postData.displayOrder || 0,
      isFeatured: postData.isFeatured || false,
      isPopular: postData.isPopular || false,
      status: postData.status || "draft",
      tags: postData.tags || [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // Prepare post data for update
  static prepareForUpdate(
    postData: Partial<PostInterface>
  ): Partial<PostInterface> {
    const updateData: Partial<PostInterface> = {
      ...postData,
      updatedAt: new Date(),
    };

    // Regenerate slug if title changed
    if (postData.title) {
      updateData.slug = this.generateSlug(postData.title);
    }

    // Recalculate read time if content changed
    if (postData.content) {
      updateData.readTime = this.calculateReadTime(postData.content);
    }

    // Update meta fields if needed
    if (postData.title || postData.excerpt) {
      const meta = this.generateMetaFields(postData);
      updateData.metaTitle = updateData.metaTitle || meta.metaTitle;
      updateData.metaDescription =
        updateData.metaDescription || meta.metaDescription;
    }

    // Auto-set published date when status changes to published
    if (postData.status === "published" && !postData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Validate age group if provided
    if (postData.targetAgeGroup) {
      this.validateAgeGroup(postData.targetAgeGroup);
    }

    return updateData;
  }
}

// Computed field utilities
export class PostComputed {
  // Format published date
  static getFormattedDate(post: PostInterface): string {
    if (!post.publishedAt) return "Not published";

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return post.publishedAt.toLocaleDateString("en-US", options);
  }

  // Calculate engagement score
  static getEngagementScore(post: PostInterface): number {
    const approvedComments = post.comments.filter(
      (comment) => comment.isApproved
    ).length;
    return (
      post.views * 0.1 + post.likes * 2 + post.shares * 5 + approvedComments * 3
    );
  }

  // Get approved comment count
  static getCommentCount(post: PostInterface): number {
    return post.comments.filter((comment) => comment.isApproved).length;
  }

  // Format target age group display
  static getAgeGroupDisplay(post: PostInterface): string {
    if (!post.targetAgeGroup) return "All ages";

    const min = post.targetAgeGroup.min;
    const max = post.targetAgeGroup.max;

    if (min !== undefined && max !== undefined) {
      return `Ages ${min}-${max}`;
    } else if (min !== undefined) {
      return `Ages ${min}+`;
    } else if (max !== undefined) {
      return `Up to age ${max}`;
    }
    return "All ages";
  }

  // Add computed fields to post object
  static addComputedFields(post: PostInterface): PostInterface & {
    formattedDate: string;
    engagementScore: number;
    commentCount: number;
    ageGroupDisplay: string;
  } {
    return {
      ...post,
      formattedDate: this.getFormattedDate(post),
      engagementScore: this.getEngagementScore(post),
      commentCount: this.getCommentCount(post),
      ageGroupDisplay: this.getAgeGroupDisplay(post),
    };
  }
}

// Query builders for common operations
export class PostQueries {
  // Get published posts filter
  static getPublishedFilter() {
    return {
      status: "published",
      publishedAt: { $lte: new Date() },
    };
  }

  // Find published posts
  static findPublished() {
    return {
      filter: this.getPublishedFilter(),
      sort: { publishedAt: -1 },
    };
  }

  // Find posts by category
  static findByCategory(category: PostCategory) {
    return {
      filter: { ...this.getPublishedFilter(), category },
      sort: { publishedAt: -1 },
    };
  }

  // Find posts by tag
  static findByTag(tag: string) {
    return {
      filter: { ...this.getPublishedFilter(), tags: { $in: [tag] } },
      sort: { publishedAt: -1 },
    };
  }

  // Find featured posts
  static findFeatured(limit: number = 3) {
    return {
      filter: { ...this.getPublishedFilter(), isFeatured: true },
      sort: { displayOrder: 1, publishedAt: -1 },
      limit,
    };
  }

  // Find popular posts
  static findPopular(limit: number = 5) {
    return {
      filter: this.getPublishedFilter(),
      sort: { views: -1, likes: -1, publishedAt: -1 },
      limit,
    };
  }

  // Search posts
  static searchPosts(query: string) {
    return {
      filter: {
        ...this.getPublishedFilter(),
        $or: [
          { title: { $regex: query, $options: "i" } },
          { excerpt: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
          { keywords: { $in: [new RegExp(query, "i")] } },
        ],
      },
      sort: { publishedAt: -1 },
    };
  }

  // Get recent posts
  static getRecentPosts(limit: number = 10) {
    return {
      filter: this.getPublishedFilter(),
      sort: { publishedAt: -1 },
      limit,
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
    };
  }

  // Get related posts
  static getRelatedPosts(
    postId: string | ObjectId,
    tags: string[],
    category: string,
    limit: number = 3
  ) {
    return {
      filter: {
        _id: { $ne: postId },
        ...this.getPublishedFilter(),
        $or: [{ tags: { $in: tags } }, { category }],
      },
      sort: { publishedAt: -1 },
      limit,
    };
  }

  // Get post analytics aggregation pipeline
  static getPostAnalyticsPipeline() {
    return [
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
    ];
  }
}

// Collection name constant
export const POST_COLLECTION = "posts";
