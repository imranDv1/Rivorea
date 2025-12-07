import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// Update a comment
export async function PATCH(req: Request) {
  try {
    const { commentId, userId, content } = await req.json();

    if (!commentId || !userId || !content) {
      return NextResponse.json(
        { message: "commentId, userId, and content are required" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json(
        { message: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
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
      },
    });

    // Transform comment to match frontend format
    const transformedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      user: {
        id: updatedComment.user.id,
        name: updatedComment.user.name,
        username: updatedComment.user.username || updatedComment.user.displayUsername || "unknown",
        image: updatedComment.user.image,
      },
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
      likes: updatedComment._count.likes,
      userId: updatedComment.userId,
    };

    return NextResponse.json({ comment: transformedComment }, { status: 200 });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
