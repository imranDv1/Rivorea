/* eslint-disable @typescript-eslint/no-explicit-any */
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



export async function GET(req: Request) {
  try {
    // Parse URL params for pagination; default: limit=20, pageToken=undefined
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(Number(searchParams.get("limit")) || 20, 100)); // max 100 per request
    const pageToken = searchParams.get("pageToken"); // pageToken is 'id' of the last post from previous page
    const userId = searchParams.get("userId"); // Optional: current user ID for like status and view tracking
    const following = searchParams.get("following") === "true"; // Filter to only show posts from followed users

    // If following feed is requested, get list of followed user IDs
    let followingUserIds: string[] = [];
    if (following && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          following: {
            select: { id: true },
          },
        },
      });
      followingUserIds = user?.following.map((u) => u.id) || [];
      
      // If user is not following anyone, return empty posts
      if (followingUserIds.length === 0) {
        return NextResponse.json({ posts: [], nextPageToken: null });
      }
    }

    // Find posts with pagination
    const postsRaw = await prisma.post.findMany({
      where: {
        ...(following && userId && followingUserIds.length > 0
          ? {
              userId: {
                in: followingUserIds,
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to check if more
      ...(pageToken
        ? {
            // Skip the pageToken post itself
            cursor: { id: pageToken },
            skip: 1,
          }
        : {}),
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
            comments: true,
            views: true,
            reposts: true,
            bookmarks: true,
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

    let nextPageToken: string | null = null;

    // If more than 'limit', set nextPageToken to the last post's id and remove extra post
    if (postsRaw.length > limit) {
      const next = postsRaw.pop();
      nextPageToken = next?.id ?? null;
    }

    // Transform posts to include likedByCurrentUser and format user info
    const posts = postsRaw.map((post) => {
      const { likes, user, ...rest } = post as any;
      return {
        ...rest,
        user: {
          id: user.id,
          name: user.name,
          username: user.username || user.displayUsername || "unknown",
          image: user.image,
        },
        likedByCurrentUser: userId && Array.isArray(likes) && likes.length > 0,
      };
    });

    return NextResponse.json({ posts, nextPageToken });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

