import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, targetUserId } = await req.json();

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { message: "userId and targetUserId are required" },
        { status: 400 }
      );
    }

    if (userId === targetUserId) {
      return NextResponse.json(
        { message: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        followers: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isFollowing = targetUser.followers.length > 0;

    if (isFollowing) {
      // Unfollow: remove from following list
      await prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            disconnect: { id: targetUserId },
          },
        },
      });
    } else {
      // Follow: add to following list
      await prisma.user.update({
        where: { id: userId },
        data: {
          following: {
            connect: { id: targetUserId },
          },
        },
      });
    }

    // Get updated counts
    const updatedTargetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        isFollowing: !isFollowing,
        followersCount: updatedTargetUser?._count.followers ?? 0,
        followingCount: updatedTargetUser?._count.following ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
