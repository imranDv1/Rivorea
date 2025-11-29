/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      name,
      bio,
      username,
      displayUsername,
      image,
      bannerImage,
    } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }
    if (typeof name === "string" && name.length > 10) {
      return NextResponse.json(
        { message: "Name must be at most 10 characters" },
        { status: 400 }
      );
    }
    if (typeof username === "string" && username.length > 10) {
      return NextResponse.json(
        { message: "Username must be at most 10 characters" },
        { status: 400 }
      );
    }
    if (typeof bio === "string" && bio.length > 160) {
      return NextResponse.json(
        { message: "Bio must be at most 160 characters" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (username !== undefined) updateData.username = username;
    if (displayUsername !== undefined) updateData.displayUsername = displayUsername;
    if (image !== undefined) updateData.image = image;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
          select: { id: true },
        },
        following: {
          select: { id: true },
        },
      },
    });

    // Calculate counts
    const followersCount = updatedUser.followers.length;
    const followingCount = updatedUser.following.length;

    const { followers, following, ...userFields } = updatedUser;

    return NextResponse.json(
      {
        userInfo: {
          ...userFields,
          followersCount,
          followingCount,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);

    // Handle unique constraint violation (username already exists)
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

