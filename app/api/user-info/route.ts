import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // Fetch user info and also count followers and following
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        bio: true,
        bannerImage: true,
        badge: true,
        username: true,
        displayUsername: true,
        followers: {
          select: { id: true }
        },
        following: {
          select: { id: true }
        }
      }
    });

    if (!userInfo) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Calculate counts
    const followersCount = userInfo.followers.length;
    const followingCount = userInfo.following.length;

    // Omit arrays of objects themselves for the response, only give counts and single user info
    const { followers, following, ...userFields } = userInfo;

    return NextResponse.json(
      {
        userInfo: {
          ...userFields,
          followersCount,
          followingCount
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
