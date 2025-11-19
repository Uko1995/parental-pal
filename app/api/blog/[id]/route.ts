import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PostRepository } from "@/lib/PostRepository";
import { UserRepository } from "@/lib/UserRepository";
import { rateLimit, getClientIp, sanitizeObject } from "@/lib/security";
import { logAuthEvent, AuditEventType } from "@/lib/audit-logger-mongodb";

// Get individual blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const postRepository = new PostRepository();
    const post = await postRepository.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        _id: post._id?.toString(),
      },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// Update blog post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`blog-update:${ip}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized blog update attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can update blog posts
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to update blog"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);
    const updates = { ...body };

    // Remove _id from updates if present
    delete updates._id;

    // Update publishedAt if status changes to published
    if (updates.status === "published" && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }

    const postRepository = new PostRepository();
    const updatedPost = await postRepository.update(id, updates);

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post: {
        ...updatedPost,
        _id: updatedPost._id?.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);

    // Rate limiting
    const rateLimitResult = rateLimit(`blog-delete:${ip}`, 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      logAuthEvent(
        AuditEventType.UNAUTHORIZED_ACCESS,
        undefined,
        undefined,
        ip,
        false,
        "Unauthorized blog delete attempt"
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await UserRepository.findByEmail(session.user.email);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization: Only admins can delete blog posts
    if (currentUser.role !== "admin") {
      logAuthEvent(
        AuditEventType.FORBIDDEN_ACCESS,
        currentUser._id?.toString(),
        session.user.email,
        ip,
        false,
        "Non-admin tried to delete blog"
      );
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const postRepository = new PostRepository();
    const deleted = await postRepository.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
