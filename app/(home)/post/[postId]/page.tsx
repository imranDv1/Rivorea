"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/user";
import { PostDetailView } from "./PostDetailView";
import { toast } from "sonner";

type PostWithUser = {
  id: string;
  content: string | null;
  mediaUrl: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
    views: number;
    reposts: number;
    bookmarks: number;
  };
  likedByCurrentUser?: boolean;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useUser();
  const postId = params.postId as string;
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (userId) {
          params.append("userId", userId);
        }

        const response = await fetch(
          `/api/post/${postId}?${params.toString()}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch post:", response.status, errorData);

          if (response.status === 404) {
            toast.error("Post not found");
            router.push("/");
            return;
          }
          throw new Error(errorData.message || "Failed to fetch post");
        }

        const data = await response.json();
        console.log("Post data received:", data);

        if (!data.post) {
          toast.error("Post data is invalid");
          router.push("/");
          return;
        }

        setPost(data.post);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Post not found</div>
      </div>
    );
  }

  return <PostDetailView post={post} currentUserId={userId} />;
}
