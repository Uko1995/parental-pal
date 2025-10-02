import mongoose, { Schema, Document } from "mongoose";

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

// Post interface for blog articles
export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  // Author Information
  authorId?: mongoose.Types.ObjectId; // Reference to User
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
  relatedServices?: string[]; // Service types this post relates to
  targetAgeGroup?: {
    min?: number;
    max?: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000,
    },

    // Author Information
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authorImage: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v) || /^\/[^\/]/.test(v);
        },
        message: "Author image must be a valid URL or path",
      },
    },
    authorBio: {
      type: String,
      maxlength: 500,
    },

    // Publication Details
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    scheduledFor: Date,

    // Categorization and SEO
    category: {
      type: String,
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
      required: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
        index: true,
      },
    ],
    keywords: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },

    // Media
    featuredImage: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v) || /^\/[^\/]/.test(v);
        },
        message: "Featured image must be a valid URL or path",
      },
    },
    images: [
      {
        type: String,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/.+/.test(v) || /^\/[^\/]/.test(v);
          },
          message: "Image must be a valid URL or path",
        },
      },
    ],
    videos: [
      {
        type: String,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/.+/.test(v);
          },
          message: "Video must be a valid URL",
        },
      },
    ],

    // Engagement Metrics
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: [
      {
        authorName: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        authorEmail: {
          type: String,
          validate: {
            validator: function (v: string) {
              return (
                !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
              );
            },
            message: "Invalid email format",
          },
        },
        content: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Reading and Display
    readTime: {
      type: Number,
      required: true,
      min: 1,
      max: 60,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Related Content
    relatedServices: [
      {
        type: String,
        enum: [
          "childcare",
          "tutoring",
          "homeschooling",
          "holiday-camps",
          "space-rental",
          "kiddies-enrichment",
        ],
      },
    ],
    targetAgeGroup: {
      min: {
        type: Number,
        min: 0,
        max: 18,
      },
      max: {
        type: Number,
        min: 0,
        max: 18,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance optimization
PostSchema.index({ title: 1 });
PostSchema.index({ slug: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ publishedAt: -1 });
PostSchema.index({ views: -1 });
PostSchema.index({ likes: -1 });
PostSchema.index({ isFeatured: 1 });
PostSchema.index({ isPopular: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ authorId: 1 });

// Compound indexes for common queries
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ category: 1, status: 1 });
PostSchema.index({ isFeatured: 1, status: 1 });
PostSchema.index({ tags: 1, status: 1 });

// Pre-save middleware
PostSchema.pre<IPost>("save", function (next: (error?: Error) => void) {
  // Generate slug from title
  if (this.isModified("title") || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  // Calculate read time based on content length (average 200 words per minute)
  if (this.isModified("content") || this.isNew) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Auto-set published date when status changes to published
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  // Validate age group constraints
  if (
    this.targetAgeGroup?.min !== undefined &&
    this.targetAgeGroup?.max !== undefined &&
    this.targetAgeGroup.min > this.targetAgeGroup.max
  ) {
    next(new Error("Minimum age cannot be greater than maximum age"));
    return;
  }

  // Validate meta title and description
  if (!this.metaTitle) {
    this.metaTitle = this.title.slice(0, 60);
  }

  if (!this.metaDescription) {
    this.metaDescription = this.excerpt.slice(0, 160);
  }

  next();
});

// Virtual for formatted published date
PostSchema.virtual("formattedDate").get(function (this: IPost) {
  if (!this.publishedAt) return "Not published";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return this.publishedAt.toLocaleDateString("en-US", options);
});

// Virtual for engagement score
PostSchema.virtual("engagementScore").get(function (this: IPost) {
  const approvedComments = this.comments.filter(
    (comment) => comment.isApproved
  ).length;
  return (
    this.views * 0.1 + this.likes * 2 + this.shares * 5 + approvedComments * 3
  );
});

// Virtual for comment count
PostSchema.virtual("commentCount").get(function (this: IPost) {
  return this.comments.filter((comment) => comment.isApproved).length;
});

// Virtual for target age display
PostSchema.virtual("ageGroupDisplay").get(function (this: IPost) {
  if (!this.targetAgeGroup) return "All ages";

  const min = this.targetAgeGroup.min;
  const max = this.targetAgeGroup.max;

  if (min !== undefined && max !== undefined) {
    return `Ages ${min}-${max}`;
  } else if (min !== undefined) {
    return `Ages ${min}+`;
  } else if (max !== undefined) {
    return `Up to age ${max}`;
  }
  return "All ages";
});

// Instance methods
PostSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

PostSchema.methods.addLike = function () {
  this.likes += 1;
  return this.save();
};

PostSchema.methods.addShare = function () {
  this.shares += 1;
  return this.save();
};

PostSchema.methods.addComment = function (commentData: {
  authorName: string;
  authorEmail?: string;
  content: string;
}) {
  this.comments.push({
    ...commentData,
    isApproved: false, // Comments need approval by default
    createdAt: new Date(),
  });
  return this.save();
};

PostSchema.methods.approveComment = function (commentId: string) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.isApproved = true;
    return this.save();
  }
  throw new Error("Comment not found");
};

PostSchema.methods.publish = function () {
  this.status = "published";
  if (!this.publishedAt) {
    this.publishedAt = new Date();
  }
  return this.save();
};

PostSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// Static methods
PostSchema.statics.findPublished = function () {
  return this.find({
    status: "published",
    publishedAt: { $lte: new Date() },
  }).sort({ publishedAt: -1 });
};

PostSchema.statics.findByCategory = function (category: PostCategory) {
  return this.find({
    status: "published",
    category,
    publishedAt: { $lte: new Date() },
  }).sort({ publishedAt: -1 });
};

PostSchema.statics.findByTag = function (tag: string) {
  return this.find({
    status: "published",
    tags: { $in: [tag] },
    publishedAt: { $lte: new Date() },
  }).sort({ publishedAt: -1 });
};

PostSchema.statics.findFeatured = function (limit: number = 3) {
  return this.find({
    status: "published",
    isFeatured: true,
    publishedAt: { $lte: new Date() },
  })
    .sort({ displayOrder: 1, publishedAt: -1 })
    .limit(limit);
};

PostSchema.statics.findPopular = function (limit: number = 5) {
  return this.find({
    status: "published",
    publishedAt: { $lte: new Date() },
  })
    .sort({
      views: -1,
      likes: -1,
      publishedAt: -1,
    })
    .limit(limit);
};

PostSchema.statics.searchPosts = function (query: string) {
  return this.find({
    status: "published",
    publishedAt: { $lte: new Date() },
    $or: [
      { title: { $regex: query, $options: "i" } },
      { excerpt: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } },
      { keywords: { $in: [new RegExp(query, "i")] } },
    ],
  }).sort({ publishedAt: -1 });
};

PostSchema.statics.getPostAnalytics = function () {
  return this.aggregate([
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
  ]);
};

PostSchema.statics.getRecentPosts = function (limit: number = 10) {
  return this.find({
    status: "published",
    publishedAt: { $lte: new Date() },
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select(
      "title slug excerpt featuredImage authorName publishedAt readTime category"
    );
};

PostSchema.statics.getRelatedPosts = function (
  postId: string,
  tags: string[],
  category: string,
  limit: number = 3
) {
  return this.find({
    _id: { $ne: postId },
    status: "published",
    publishedAt: { $lte: new Date() },
    $or: [{ tags: { $in: tags } }, { category }],
  })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Export the model
const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
