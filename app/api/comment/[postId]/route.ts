/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// Get comments for a post
export async function GET(
  req: Request,
  context: { params: Promise<{ postId: string }> | { postId: string } }
) {
  try {
    const params = context.params instanceof Promise ? await context.params : context.params;
    const { postId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // Optional: current user ID for like status

    if (!postId) {
      return NextResponse.json(
        { message: "Post ID is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only get top-level comments (no replies for now)
      },
      orderBy: {
        createdAt: "desc",
      },
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

    // Transform comments to match frontend format
    const transformedComments = comments.map((comment: any) => {
      const { likes, user, ...rest } = comment;
      const isEdited = comment.updatedAt.getTime() > comment.createdAt.getTime() + 1000; // 1 second buffer
      return {
        ...rest,
        user: {
          id: user.id,
          name: user.name,
          username: user.username || user.displayUsername || "unknown",
          image: user.image,
        },
        likes: comment._count.likes,
        likedByCurrentUser: userId && Array.isArray(likes) && likes.length > 0,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        isEdited,
      };
    });

    return NextResponse.json({ comments: transformedComments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
