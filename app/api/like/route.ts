import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, postId, commentId } = body as {
      userId?: string;
      postId?: string;
      commentId?: string;
    };

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    if (!postId && !commentId) {
      return NextResponse.json(
        { message: "Either postId or commentId is required" },
        { status: 400 }
      );
    }

    // Find existing like
    const existing = await prisma.like.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : {}),
        ...(commentId ? { commentId } : {}),
      },
    });

    let liked: boolean;
    let likesCount: number;

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({
        data: {
          userId,
          ...(postId ? { postId } : {}),
          ...(commentId ? { commentId } : {}),
        },
      });
      liked = true;
    }

    // Get updated likes count
    if (postId) {
      likesCount = await prisma.like.count({
        where: { postId },
      });
    } else if (commentId) {
      likesCount = await prisma.like.count({
        where: { commentId },
      });
    } else {
      likesCount = 0;
    }

    return NextResponse.json({ liked, likesCount }, { status: 200 });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


