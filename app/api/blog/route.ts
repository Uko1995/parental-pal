import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { PostRepository } from "@/lib/PostRepository";
import { PostInterface } from "@/models/Post";
import { CACHE_TAGS } from "@/lib/cache-config";

// Get all blog posts with analytics
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create repository instance
    const postRepository = new PostRepository();

    // Get all posts (published and drafts for admin dashboard)
    const posts = await postRepository.findPublished(0, 100); // Get up to 100 posts

    return NextResponse.json({
      success: true,
      posts: posts.map((post: PostInterface) => ({
        ...post,
        _id: post._id?.toString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// Create new blog post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is admin
    // For now, allowing all authenticated users to create posts

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      authorName,
      authorBio,
      category,
      tags,
      keywords,
      metaTitle,
      metaDescription,
      featuredImage,
      readTime,
      isFeatured,
      relatedServices,
      targetAgeGroup,
      status,
    } = body;

    if (!title || !content || !authorName || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newPost = {
      title: title.trim(),
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      excerpt: excerpt?.trim() || "",
      content: content.trim(),
      authorName: authorName.trim(),
      authorBio: authorBio?.trim(),
      category,
      tags: tags || [],
      keywords: keywords || [],
      metaTitle: metaTitle?.trim(),
      metaDescription: metaDescription?.trim(),
      featuredImage: featuredImage?.trim(),
      readTime: parseInt(readTime) || 5,
      isFeatured: Boolean(isFeatured),
      isPopular: false,
      displayOrder: 0,
      relatedServices: relatedServices || [],
      targetAgeGroup: targetAgeGroup || {},
      status: status || "draft",
      views: 0,
      likes: 0,
      shares: 0,
      comments: [],
      images: [],
      videos: [],
      publishedAt: status === "published" ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const postRepository = new PostRepository();
    const result = await postRepository.create(newPost);

    // Invalidate cache immediately
    revalidateTag(CACHE_TAGS.BLOG);
    revalidateTag(CACHE_TAGS.DASHBOARD);

    return NextResponse.json({
      success: true,
      post: {
        ...result,
        _id: result._id?.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
