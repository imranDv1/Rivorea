/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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

function extractSupabasePostPath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const match = url.pathname.match(/\/object\/public\/[^/]+\/(.+)$/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");
    const userId = url.searchParams.get("userId");

    if (!postId || !userId) {
      return new Response(
        JSON.stringify({ error: "postId and userId are required" }),
        { status: 400 }
      );
    }

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return new Response(
        JSON.stringify({ error: "Post not found" }),
        { status: 404 }
      );
    }

    // Check ownership
    if (post.userId !== userId) {
      return new Response(
        JSON.stringify({ error: "You can only delete your own post" }),
        { status: 403 }
      );
    }

    // Attempt to delete associated media from Supabase storage
    if (supabaseAdmin && Array.isArray(post.mediaUrl) && post.mediaUrl.length) {
      try {
        const pathsToDelete: string[] = [];

        for (const mediaUrl of post.mediaUrl) {
          const path = extractSupabasePostPath(mediaUrl);
          if (path) {
            pathsToDelete.push(path);
          }
        }

        if (pathsToDelete.length) {
          const { error } = await supabaseAdmin.storage
            .from("posts")
            .remove(pathsToDelete);

          if (error) {
            console.error("Error deleting media from Supabase:", error);
          }
        }
      } catch (err) {
        console.error("Error while cleaning up post media:", err);
      }
    }

    // Delete the post record
    await prisma.post.delete({ where: { id: postId } });

    return new Response(
      JSON.stringify({ message: "Post deleted successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
