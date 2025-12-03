import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const postsRaw = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true,
            reposts: true,
            bookmarks: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const posts = postsRaw.map((post) => {
      const { likes, ...rest } = post as any;
      return {
        ...rest,
        likedByCurrentUser: Array.isArray(likes) && likes.length > 0,
      };
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
