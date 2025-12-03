import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, postId } = body as { userId?: string; postId?: string };

    if (!userId || !postId) {
      return NextResponse.json(
        { message: "userId and postId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.like.findFirst({
      where: { userId, postId },
    });

    let liked: boolean;

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      liked = true;
    }

    const likesCount = await prisma.like.count({
      where: { postId },
    });

    return NextResponse.json({ liked, likesCount }, { status: 200 });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


