// "use server";

// import { PostRepository } from "@/lib/PostRepository";
// import { PostInterface } from "@/models/Post";

// export interface BlogPost {
//   _id: string;
//   title: string;
//   slug: string;
//   excerpt: string;
//   content: string;
//   featuredImage?: string;
//   category: string;
//   tags: string[];
//   author: {
//     name: string;
//     email: string;
//     avatar?: string;
//   };
//   publishedAt: Date;
//   readingTime?: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export async function getPublishedPosts(
//   limit: number = 10
// ): Promise<BlogPost[]> {
//   try {
//     const postRepository = new PostRepository();
//     const posts = await postRepository.findPublished(0, limit);

//     return posts.map((post: PostInterface) => ({
//       _id: post._id?.toString() || "",
//       title: post.title,
//       slug: post.slug,
//       excerpt: post.excerpt,
//       content: post.content,
//       featuredImage: post.featuredImage,
//       category: post.category,
//       tags: post.tags || [],
//       author: post.authorId,
//       publishedAt: post.publishedAt,
//       readingTime: post.readTime,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//     }));
//   } catch (error) {
//     console.error("Error fetching published posts:", error);
//     return [];
//   }
// }

// export async function getFeaturedPost(): Promise<BlogPost | null> {
//   try {
//     const posts = await getPublishedPosts(1);
//     return posts[0] || null;
//   } catch (error) {
//     console.error("Error fetching featured post:", error);
//     return null;
//   }
// }
