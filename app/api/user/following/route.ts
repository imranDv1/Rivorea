import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const following = user.following.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username || u.displayUsername || "unknown",
      image: u.image,
      bio: u.bio,
    }));

    return NextResponse.json({ following }, { status: 200 });
  } catch (error) {
    console.error("Error fetching following users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
