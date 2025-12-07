import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json();

    if (!postId) {
      return NextResponse.json({ message: "postId is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    // Check if view already exists (unique constraint on postId + userId)
    const existingView = await prisma.view.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingView) {
      // View already exists, return success without creating duplicate
      const viewCount = await prisma.view.count({
        where: { postId },
      });
      return NextResponse.json({ viewCount, message: "View already recorded" }, { status: 200 });
    }

    // Create new view (using upsert to handle race conditions)
    try {
      await prisma.view.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (err: any) {
      // If unique constraint violation, view was already created by another request
      if (err?.code === "P2002") {
        // View already exists, just return the count
        const viewCount = await prisma.view.count({
          where: { postId },
        });
        return NextResponse.json({ viewCount }, { status: 200 });
      }
      throw err;
    }

    // Get updated view count
    const viewCount = await prisma.view.count({
      where: { postId },
    });

    return NextResponse.json({ viewCount }, { status: 200 });
  } catch (err) {
    console.error("Error recording view:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
