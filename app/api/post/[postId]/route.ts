/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> | { postId: string } }
) {
  try {
    // Handle both Promise and direct params (for Next.js version compatibility)
    const params = context.params instanceof Promise ? await context.params : context.params;
    const { postId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // Optional: current user ID for like status

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    }

    console.log("Fetching post with ID:", postId);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true,
            reposts: true,
            bookmarks: true,
          },
        },
        ...(userId
          ? {
              likes: {
                where: { userId },
                select: { id: true },
              },
            }
          : {}),
      },
    });

    if (!post) {
      console.log("Post not found for ID:", postId);
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    console.log("Post found:", post.id);

    // Transform post to include likedByCurrentUser and format user info
    const { likes, user, ...rest } = post as any;
    const transformedPost = {
      ...rest,
      user: {
        id: user.id,
        name: user.name,
        username: user.username || user.displayUsername || "unknown",
        image: user.image,
      },
      likedByCurrentUser: userId && Array.isArray(likes) && likes.length > 0,
    };

    return NextResponse.json({ post: transformedPost });
  } catch (err) {
    console.error("Error fetching post:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
