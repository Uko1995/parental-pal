import { NextResponse } from "next/server";
import { PostRepository } from "@/lib/PostRepository";
import { PostInterface } from "@/models/Post";

// Get public blog posts (no authentication required)
export async function GET() {
  try {
    // Create repository instance
    const postRepository = new PostRepository();

    // Get published posts only
    const posts = await postRepository.findPublished(0, 20); // Get up to 20 recent posts

    // Transform posts for public consumption
    const publicPosts = posts.map((post: PostInterface) => ({
      _id: post._id?.toString(),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featuredImage,
      category: post.category,
      tags: post.tags,
      author: post.authorId,
      publishedAt: post.publishedAt,
      readingTime: post.readTime,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      posts: publicPosts,
    });
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
