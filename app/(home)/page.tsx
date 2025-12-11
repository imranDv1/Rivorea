"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Repeat2, Eye } from "lucide-react";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@/hooks/user";
import { PostVideoPlayer } from "./profile/PostVideoPlayer";
import { formatHashtags, isVideo, timeAgo } from "./profile/profileUtils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiCheckBadge } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { DialogTrigger } from "@radix-ui/react-dialog";

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
    badge: string;
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

export default function Home() {
  const { userId } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const viewedPostsRef = useRef<Set<string>>(new Set());
  const isFetchingRef = useRef(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<"forYou" | "following">("forYou");

  const fetchPosts = useCallback(
    async (pageToken: string | null = null, append: boolean = false) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams({
          limit: "20",
        });
        if (pageToken) {
          params.append("pageToken", pageToken);
        }
        if (userId) {
          params.append("userId", userId);
        }
        if (feedType === "following") {
          params.append("following", "true");
        }

        const response = await fetch(`/api/post/get?${params.toString()}`);
        const data = await response.json();
        console.log(`user badge ${data.badge}`);
        if (append) {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newPosts = data.posts.filter(
              (p: PostWithUser) => !existingIds.has(p.id)
            );
            return [...prev, ...newPosts];
          });
        } else {
          const uniquePosts = data.posts.filter(
            (post: PostWithUser, index: number, self: PostWithUser[]) =>
              index === self.findIndex((p) => p.id === post.id)
          );
          setPosts(uniquePosts);
        }

        setNextPageToken(data.nextPageToken);
        setHasMore(!!data.nextPageToken);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [userId, feedType]
  );

  useEffect(() => {
    setPosts([]);
    setNextPageToken(null);
    setHasMore(true);
    viewedPostsRef.current.clear();
    fetchPosts();
  }, [fetchPosts]);

  const trackView = useCallback(
    async (postId: string) => {
      if (!userId || viewedPostsRef.current.has(postId)) {
        return;
      }

      viewedPostsRef.current.add(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                _count: {
                  ...post._count,
                  views: post._count.views + 1,
                },
              }
            : post
        )
      );

      try {
        const response = await fetch("/api/post/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    _count: {
                      ...post._count,
                      views: data.viewCount ?? post._count.views,
                    },
                  }
                : post
            )
          );
        } else {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    _count: {
                      ...post._count,
                      views: Math.max(0, post._count.views - 1),
                    },
                  }
                : post
            )
          );
          viewedPostsRef.current.delete(postId); // Allow retry on error
        }
      } catch (error) {
        console.error("Error tracking view:", error);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  _count: {
                    ...post._count,
                    views: Math.max(0, post._count.views - 1),
                  },
                }
              : post
          )
        );
        viewedPostsRef.current.delete(postId); // Allow retry on error
      }
    },
    [userId]
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !isFetchingRef.current
        ) {
          fetchPosts(nextPageToken, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, nextPageToken, fetchPosts]);

  // Track views when posts come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute("data-post-id");
            if (postId) {
              trackView(postId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const postElements = document.querySelectorAll("[data-post-id]");
    postElements.forEach((el) => observer.observe(el));

    return () => {
      postElements.forEach((el) => observer.unobserve(el));
    };
  }, [posts, trackView]);

  const handleToggleLike = async (postId: string) => {
    if (!userId) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const wasLiked = post.likedByCurrentUser;
    const likeDelta = wasLiked ? -1 : 1;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByCurrentUser: !wasLiked,
              _count: {
                ...p._count,
                likes: p._count.likes + likeDelta,
              },
            }
          : p
      )
    );

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                _count: {
                  ...p._count,
                  likes: data.likesCount ?? p._count.likes,
                },
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      // Rollback optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByCurrentUser: wasLiked,
                _count: {
                  ...p._count,
                  likes: p._count.likes - likeDelta,
                },
              }
            : p
        )
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/post?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(userId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error || "Failed to delete post");
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
      setDeletePostId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="flex h-screen overflow-scroll scrollbar-hide p-4">
      <Tabs
        className="items-start w-full"
        value={feedType === "forYou" ? "tab-1" : "tab-2"}
        onValueChange={(value) => {
          setFeedType(value === "tab-1" ? "forYou" : "following");
        }}
      >
        <TabsList className="w-full flex justify-between">
          <TabsTrigger className="flex-1" value="tab-1">
            For you
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="tab-2">
            Following
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1" className="w-full">
          <div className="w-full flex flex-col gap-4 mt-4">
            {loading && posts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No posts available
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  data-post-id={post.id}
                  className="w-full rounded-xl p-4 bg-background border cursor-pointer transition-colors"
                >
                  <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-2 w-full">
                    <div className="flex items-center gap-3 min-w-0 w-full cursor-pointer hover:opacity-80 transition-opacity">
                      <Image
                        src={post.user.image || "/default.png"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile?userId=${post.user.id}`);
                        }}
                      />
                      <div
                        className="flex flex-col min-w-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile?userId=${post.user.id}`);
                        }}
                      >
                        <span className=" flex items-center  gap-1 font-semibold  leading-tight " >
                          {post.user.name}
                          {post.user.badge === "blue" ? (
                            <HiCheckBadge className="text-blue-500 lg:mt-1" />
                          ) : post.user.badge === "gold" ? (
                            <HiCheckBadge className="text-yellow-400 lg:mt-1" />
                          ) : null}
                        </span>
                        <span className="text-muted-foreground text-xs truncate leading-tight max-w-[170px] sm:max-w-[210px]">
                          @{post.user.username} &middot;{" "}
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">
                          <BsThreeDots />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              const origin = window.location.origin;
                              const url = `${origin}/post/${post.id}`;
                              if (navigator.share) {
                                navigator.share({
                                  title: post.user.name,
                                  text: `@${post.user.username} on Rivorea`,
                                  url,
                                });
                              } else if (navigator.clipboard) {
                                navigator.clipboard.writeText(url);
                                toast.success("Post link copied to clipboard");
                              }
                            }}
                          >
                            Share
                          </DropdownMenuItem>
                          {userId && post.userId === userId && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePostId(post.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-base text-foreground mb-3">
                      {formatHashtags(post.content)}
                    </p>
                  )}

                  <div className="w-full">
                    {post.mediaUrl.length === 1 && (
                      <div
                        className={cn(
                          "relative w-full   rounded-lg overflow-hidden",
                          isVideo(post.mediaUrl[0])
                            ? "h-50 lg:h-80"
                            : " lg:h-115 h-94"
                        )}
                      >
                        {isVideo(post.mediaUrl[0]) ? (
                          <video
                            src={post.mediaUrl[0]}
                            controls
                            className="w-full h-full "
                          ></video>
                        ) : (
                          <Dialog>
                            <DialogTrigger>
                              <Image
                                src={post.mediaUrl[0]}
                                alt="post media"
                                fill
                                className="object-cover object-center w-full h-max"
                              />
                            </DialogTrigger>
                            <DialogHeader>
                              <DialogTitle>{post.content}</DialogTitle>
                            </DialogHeader>
                            <DialogContent className="w-full absolute top-80">
                              <Image
                                src={post.mediaUrl[0]}
                                alt={`post media `}
                                width={800}
                                height={800}
                                className="w-full h-full "
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}

                    {post.mediaUrl.length > 1 && (
                      <div
                        className={`grid gap-2 ${
                          post.mediaUrl.length === 2
                            ? "grid-cols-2"
                            : post.mediaUrl.length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2"
                        }`}
                      >
                        {post.mediaUrl.slice(0, 4).map((url, i) => (
                          <div
                            key={i}
                            className="relative w-full h-55 lg:h-60  rounded-lg overflow-hidden"
                          >
                            {isVideo(url) ? (
                              <video src={url} controls />
                            ) : (
                              <Dialog>
                                <DialogTrigger>
                                  <Image
                                    src={url}
                                    alt={`post media ${i}`}
                                    fill
                                    className="object-cover object-center"
                                  />
                                </DialogTrigger>
                                <DialogHeader>
                                  <DialogTitle>{post.content}</DialogTitle>
                                </DialogHeader>
                                <DialogContent className="w-full absolute top-80">
                                  <Image
                                    src={url}
                                    alt={`post media ${i}`}
                                    width={800}
                                    height={800}
                                    className="w-full h-full "
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                    >
                      <Eye className="size-4" />
                      {post._count.views}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/post/${post.id}`)}
                      className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto cursor-pointer"
                    >
                      <MessageCircle className="size-4" />
                      {post._count.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(post.id);
                      }}
                    >
                      <Heart
                        className={`size-4 ${
                          post.likedByCurrentUser ? "text-red-500" : ""
                        }`}
                        fill={post.likedByCurrentUser ? "currentColor" : "none"}
                      />
                      {post._count.likes}
                    </Button>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="size-4" />
                      {post._count.reposts}
                    </span>
                  </div>
                </div>
              ))
            )}
            {loadingMore && (
              <div className="p-4 text-center text-muted-foreground">
                Loading more posts...
              </div>
            )}
            <div ref={observerTarget} className="h-4" />
          </div>
        </TabsContent>

        <TabsContent value="tab-2" className="w-full">
          <div className="w-full flex flex-col gap-4 mt-4">
            {loading && posts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {userId
                  ? "No posts from people you follow. Start following users to see their posts here!"
                  : "Please log in to see posts from people you follow"}
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  data-post-id={post.id}
                  className="w-full rounded-xl p-4 bg-background border cursor-pointer transition-colors"
                >
                  <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-2 w-full">
                    <div
                      className="flex items-center gap-3 min-w-0 w-full cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile?userId=${post.user.id}`);
                      }}
                    >
                      <Image
                        src={post.user.image || "/default.png"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate leading-tight max-w-[120px] sm:max-w-[170px]">
                          {post.user.name}
                        </span>
                        <span className="text-muted-foreground text-xs truncate leading-tight max-w-[170px] sm:max-w-[210px]">
                          @{post.user.username} &middot;{" "}
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">
                          <BsThreeDots />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              const origin = window.location.origin;
                              const url = `${origin}/post/${post.id}`;
                              if (navigator.share) {
                                navigator.share({
                                  title: post.user.name,
                                  text: `@${post.user.username} on Rivorea`,
                                  url,
                                });
                              } else if (navigator.clipboard) {
                                navigator.clipboard.writeText(url);
                                toast.success("Post link copied to clipboard");
                              }
                            }}
                          >
                            Share
                          </DropdownMenuItem>
                          {userId && post.userId === userId && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletePostId(post.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-base text-foreground mb-3">
                      {formatHashtags(post.content)}
                    </p>
                  )}

                  <div className="w-full">
                    {post.mediaUrl.length === 1 && (
                      <div className="relative w-full h-104 rounded-lg overflow-hidden">
                        {isVideo(post.mediaUrl[0]) ? (
                          <PostVideoPlayer
                            src={post.mediaUrl[0]}
                            className="object-top"
                          />
                        ) : (
                          <Image
                            src={post.mediaUrl[0]}
                            alt="post media"
                            fill
                            className="object-cover object-top"
                          />
                        )}
                      </div>
                    )}

                    {post.mediaUrl.length > 1 && (
                      <div
                        className={`grid gap-2 ${
                          post.mediaUrl.length === 2
                            ? "grid-cols-2"
                            : post.mediaUrl.length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2"
                        }`}
                      >
                        {post.mediaUrl.slice(0, 4).map((url, i) => (
                          <div
                            key={i}
                            className="relative w-full h-40 rounded-lg overflow-hidden"
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

                  <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                    >
                      <Eye className="size-4" />
                      {post._count.views}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                    >
                      <MessageCircle className="size-4" />
                      {post._count.comments}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(post.id);
                      }}
                    >
                      <Heart
                        className={`size-4 ${
                          post.likedByCurrentUser ? "text-red-500" : ""
                        }`}
                        fill={post.likedByCurrentUser ? "currentColor" : "none"}
                      />
                      {post._count.likes}
                    </Button>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="size-4" />
                      {post._count.reposts}
                    </span>
                  </div>
                </div>
              ))
            )}
            {loadingMore && (
              <div className="p-4 text-center text-muted-foreground">
                Loading more posts...
              </div>
            )}
            <div ref={observerTarget} className="h-4" />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!deletePostId}
        onOpenChange={(open) => {
          if (!open) {
            setDeletePostId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this post?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePostId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletePostId) {
                  handleDeletePost(deletePostId);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
