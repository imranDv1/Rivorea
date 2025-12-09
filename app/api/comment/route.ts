import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// Create a comment
export async function POST(req: Request) {
  try {
    const { postId, userId, content } = await req.json();

    if (!postId || !userId || !content) {
      return NextResponse.json(
        { message: "postId, userId, and content are required" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { message: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
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
            badge: true 
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
      id: comment.id,
      content: comment.content,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        username: comment.user.username || comment.user.displayUsername || "unknown",
        image: comment.user.image,
        badge: comment.user.badge
      },
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      likes: comment._count.likes,
      likedByCurrentUser: false,
      userId: comment.userId,
      isEdited: false,
    };

    return NextResponse.json({ comment: transformedComment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
