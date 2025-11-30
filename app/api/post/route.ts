import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// Create a post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, content, mediaUrl } = body;

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }
    if (!content && (!mediaUrl || mediaUrl.length === 0)) {
      return NextResponse.json(
        { message: "Post must have content or media" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        userId,
        content: content || "",
        mediaUrl: mediaUrl || [],
      },
    });

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

