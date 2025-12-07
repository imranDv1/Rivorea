"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { PostVideoPlayer } from "../../profile/PostVideoPlayer";
import { formatHashtags, isVideo, timeAgo } from "../../profile/profileUtils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/user";

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

type Comment = {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedByCurrentUser?: boolean;
  userId: string;
  isEdited?: boolean;
};

type PostDetailViewProps = {
  post: PostWithUser;
  currentUserId?: string | null;
};

export function PostDetailView({ post, currentUserId }: PostDetailViewProps) {
  const router = useRouter();
  const { user } = useUser();
  const [currentPost, setCurrentPost] = useState(post);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(
    null
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!post.id) return;

    try {
      setLoadingComments(true);
      const params = new URLSearchParams();
      if (currentUserId) {
        params.append("userId", currentUserId);
      }

      const response = await fetch(
        `/api/comment/${post.id}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  }, [post.id, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add comment
  const handleAddComment = async () => {
    if (!currentUserId) {
      toast.error("You must be logged in to comment");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          userId: currentUserId,
          content: commentContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();

      // Add new comment to the list
      setComments((prev) => [data.comment, ...prev]);

      // Update post comment count
      setCurrentPost((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          comments: prev._count.comments + 1,
        },
      }));

      setCommentContent("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Start editing a comment
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  // Save edited comment
  const handleSaveEdit = async (commentId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to edit comments");
      return;
    }

    if (!editCommentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await fetch(`/api/comment/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          userId: currentUserId,
          content: editCommentContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const data = await response.json();

      // Update comment in the list
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...data.comment,
                likedByCurrentUser: c.likedByCurrentUser,
                isEdited: true,
              }
            : c
        )
      );

      setEditingCommentId(null);
      setEditCommentContent("");
      toast.success("Comment updated");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to delete comments");
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/comment/delete?commentId=${commentId}&userId=${currentUserId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove comment from the list
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      // Update post comment count
      setCurrentPost((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          comments: Math.max(0, prev._count.comments - 1),
        },
      }));

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Toggle comment like
  const handleToggleCommentLike = async (commentId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to like comments");
      return;
    }

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    const wasLiked = comment.likedByCurrentUser;
    const likeDelta = wasLiked ? -1 : 1;

    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likedByCurrentUser: !wasLiked,
              likes: c.likes + likeDelta,
            }
          : c
      )
    );

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likes: data.likesCount ?? c.likes,
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // Rollback optimistic update
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                likedByCurrentUser: wasLiked,
                likes: c.likes - likeDelta,
              }
            : c
        )
      );
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to like posts");
      return;
    }

    const wasLiked = currentPost.likedByCurrentUser;
    const likeDelta = wasLiked ? -1 : 1;

    // Optimistic update
    setCurrentPost((prev) => ({
      ...prev,
      likedByCurrentUser: !wasLiked,
      _count: {
        ...prev._count,
        likes: prev._count.likes + likeDelta,
      },
    }));

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setCurrentPost((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          likes: data.likesCount ?? prev._count.likes,
        },
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
      // Rollback optimistic update
      setCurrentPost((prev) => ({
        ...prev,
        likedByCurrentUser: wasLiked,
        _count: {
          ...prev._count,
          likes: prev._count.likes - likeDelta,
        },
      }));
    }
  };

  const openMediaViewer = (index: number) => {
    setSelectedMediaIndex(index);
  };

  const closeMediaViewer = () => {
    setSelectedMediaIndex(null);
  };

  const navigateMedia = useCallback(
    (direction: "prev" | "next") => {
      if (selectedMediaIndex === null) return;

      // Find next/prev image (skip videos)
      const findNextImage = (startIndex: number, step: number): number => {
        let currentIndex = startIndex;
        let attempts = 0;
        const maxAttempts = currentPost.mediaUrl.length;

        while (attempts < maxAttempts) {
          currentIndex += step;
          if (currentIndex < 0) {
            currentIndex = currentPost.mediaUrl.length - 1;
          } else if (currentIndex >= currentPost.mediaUrl.length) {
            currentIndex = 0;
          }

          // If it's an image, return it
          if (!isVideo(currentPost.mediaUrl[currentIndex])) {
            return currentIndex;
          }

          attempts++;
        }

        // If no image found, return current index
        return startIndex;
      };

      if (direction === "prev") {
        setSelectedMediaIndex((prev) =>
          prev !== null ? findNextImage(prev, -1) : null
        );
      } else {
        setSelectedMediaIndex((prev) =>
          prev !== null ? findNextImage(prev, 1) : null
        );
      }
    },
    [selectedMediaIndex, currentPost.mediaUrl]
  );

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: currentPost.content || `Post by ${currentPost.user.name}`,
    description: currentPost.content || `Post by @${currentPost.user.username}`,
    author: {
      "@type": "Person",
      name: currentPost.user.name,
      identifier: currentPost.user.username,
      image: currentPost.user.image,
    },
    datePublished: currentPost.createdAt,
    dateModified: currentPost.updatedAt,
    image: currentPost.mediaUrl.length > 0 ? currentPost.mediaUrl : undefined,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: currentPost._count.likes,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: currentPost._count.comments,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: currentPost._count.views,
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden pb-15 scrollbar-hide">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Use browser's back functionality without causing reload
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else {
              router.push("/");
            }
          }}
          className="rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Post</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {/* Post */}
          <div className="border-b pb-4 mb-4">
            <div className="flex gap-3 mb-3">
              <Image
                src={currentPost.user.image || "/default.png"}
                alt={currentPost.user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  router.push(`/profile?userId=${currentPost.user.id}`)
                }
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold cursor-pointer hover:underline"
                    onClick={() =>
                      router.push(`/profile?userId=${currentPost.user.id}`)
                    }
                  >
                    {currentPost.user.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    @{currentPost.user.username}
                  </span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {timeAgo(currentPost.createdAt)}
                  </span>
                </div>
                {currentPost.content && (
                  <p className="text-base mb-4 whitespace-pre-wrap">
                    {formatHashtags(currentPost.content)}
                  </p>
                )}

                {/* Media */}
                {currentPost.mediaUrl.length > 0 && (
                  <div className="mb-4">
                    {currentPost.mediaUrl.length === 1 ? (
                      <div
                        className={`relative w-full rounded-lg overflow-hidden ${
                          isVideo(currentPost.mediaUrl[0])
                            ? ""
                            : "cursor-pointer"
                        }`}
                        onClick={
                          isVideo(currentPost.mediaUrl[0])
                            ? undefined
                            : () => openMediaViewer(0)
                        }
                      >
                        {isVideo(currentPost.mediaUrl[0]) ? (
                          <PostVideoPlayer src={currentPost.mediaUrl[0]} />
                        ) : (
                          <div className="relative w-full aspect-video">
                            <Image
                              src={currentPost.mediaUrl[0]}
                              alt="Post media"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`grid gap-2 ${
                          currentPost.mediaUrl.length === 2
                            ? "grid-cols-2"
                            : currentPost.mediaUrl.length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2"
                        }`}
                      >
                        {currentPost.mediaUrl.slice(0, 4).map((url, i) => (
                          <div
                            key={i}
                            className={`relative aspect-square rounded-lg overflow-hidden ${
                              isVideo(url) ? "" : "cursor-pointer"
                            }`}
                            onClick={
                              isVideo(url)
                                ? undefined
                                : () => openMediaViewer(i)
                            }
                          >
                            {isVideo(url) ? (
                              <PostVideoPlayer src={url} />
                            ) : (
                              <Image
                                src={url}
                                alt={`post media ${i}`}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center text-muted-foreground text-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                  >
                    <Eye className="size-4" />
                    {currentPost._count.views}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                  >
                    <MessageCircle className="size-4" />
                    {currentPost._count.comments}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(currentPost.id);
                    }}
                  >
                    <Heart
                      className={`size-4 ${
                        currentPost.likedByCurrentUser ? "text-red-500" : ""
                      }`}
                      fill={
                        currentPost.likedByCurrentUser ? "currentColor" : "none"
                      }
                    />
                    {currentPost._count.likes}
                  </Button>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="size-4" />
                    {currentPost._count.reposts}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              Comments ({currentPost._count.comments})
            </h2>

            {/* Comment Input */}
            {currentUserId && (
              <div className="flex gap-3 pb-4 border-b">
                <Image
                  src={user?.image || "/default.png"}
                  alt="Your avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full shrink-0"
                />
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCommentContent(e.target.value)
                    }
                    className="min-h-[60px] resize-none"
                    onKeyDown={(
                      e: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentContent.trim() || isSubmittingComment}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            {loadingComments ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 pb-4 border-b last:border-0"
                >
                  <Image
                    src={comment.user.image || "/default.png"}
                    alt={comment.user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      router.push(`/profile?userId=${comment.user.id}`)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm cursor-pointer hover:underline"
                          onClick={() =>
                            router.push(`/profile?userId=${comment.user.id}`)
                          }
                        >
                          {comment.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          @{comment.user.username}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-muted-foreground text-xs">
                          {timeAgo(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="text-muted-foreground text-xs italic">
                            (edited)
                          </span>
                        )}
                      </div>
                      {currentUserId && comment.userId === currentUserId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStartEdit(comment)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2 mb-2">
                        <Textarea
                          value={editCommentContent}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setEditCommentContent(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editCommentContent.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mb-2 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-auto w-auto p-0 hover:text-primary"
                        onClick={() => handleToggleCommentLike(comment.id)}
                      >
                        <Heart
                          className={`size-3 ${
                            comment.likedByCurrentUser ? "text-red-500" : ""
                          }`}
                          fill={
                            comment.likedByCurrentUser ? "currentColor" : "none"
                          }
                        />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Media Viewer Dialog */}
      <Dialog
        open={selectedMediaIndex !== null}
        onOpenChange={closeMediaViewer}
      >
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <DialogTitle className="sr-only">
            {selectedMediaIndex !== null
              ? `Media ${selectedMediaIndex + 1} of ${currentPost.mediaUrl.length}`
              : "Media Viewer"}
          </DialogTitle>
          {selectedMediaIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                onClick={closeMediaViewer}
              >
                <X className="h-6 w-6" />
              </Button>

              {(() => {
                // Count images (excluding videos)
                const imageCount = currentPost.mediaUrl.filter(
                  (url) => !isVideo(url)
                ).length;
                return imageCount > 1 ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 z-50 text-white hover:bg-white/20 rounded-full"
                      onClick={() => navigateMedia("prev")}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 z-50 text-white hover:bg-white/20 rounded-full"
                      onClick={() => navigateMedia("next")}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                ) : null;
              })()}

              <div className="w-full h-full flex items-center justify-center">
                {isVideo(currentPost.mediaUrl[selectedMediaIndex]) ? (
                  <PostVideoPlayer
                    src={currentPost.mediaUrl[selectedMediaIndex]}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={currentPost.mediaUrl[selectedMediaIndex]}
                      alt={`Media ${selectedMediaIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {(() => {
                // Count images (excluding videos)
                const imageCount = currentPost.mediaUrl.filter(
                  (url) => !isVideo(url)
                ).length;
                const imageIndex =
                  selectedMediaIndex !== null
                    ? currentPost.mediaUrl
                        .slice(0, selectedMediaIndex + 1)
                        .filter((url) => !isVideo(url)).length
                    : 0;
                return imageCount > 1 ? (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                    {imageIndex} / {imageCount}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
