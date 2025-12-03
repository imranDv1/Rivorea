"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Repeat2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostSkeleton } from "./profileSkeletons";
import type { Post, UserInfo } from "./profileTypes";
import { formatHashtags, isVideo, timeAgo } from "./profileUtils";
import { PostVideoPlayer } from "./PostVideoPlayer";

type ProfilePostsTabsProps = {
  loading: boolean;
  posts: Post[] | null;
  userInfo: UserInfo;
  onDeletePost: (postId: string) => void;
  onSharePost: (postId: string) => void;
  onToggleLike: (postId: string) => void;
};

export function ProfilePostsTabs({
  loading,
  posts,
  userInfo,
  onDeletePost,
  onSharePost,
  onToggleLike,
}: ProfilePostsTabsProps) {
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const handleDeleteClick = useCallback((postId: string) => {
    setDeletePostId(postId);
  }, []);

  return (
    <CardContent className="px-1 ">
      <Tabs className="items-start w-full" defaultValue="tab-1">
        <TabsList className="w-full flex justify-between">
          <TabsTrigger className="flex-1" value="tab-1">
            Posts {loading ? "" : ` ${posts?.length ?? 0}`}
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="tab-2">
            Replies
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="tab-3">
            Media
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1" className="w-full">
          <div className=" w-full flex flex-col gap-4 mt-4">
            {loading && !posts ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post?.id}
                  className=" w-full rounded-xl p-4 bg-background border"
                >
                  <div className="flex justify-between items-center gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <Image
                        src={userInfo?.image || "/default.png"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">{userInfo?.name}</span>
                      <span className="text-muted-foreground">
                        @{userInfo?.username} · {timeAgo(post.createdAt)}
                      </span>
                    </div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <BsThreeDots />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onSharePost(post.id)}
                          >
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(post.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-base text-foreground mb-3">
                    {formatHashtags(post.content || "")}
                  </p>

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
                      <User className="size-4" />
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
                      onClick={() => onToggleLike(post.id)}
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
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No posts yet.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tab-2">
          {loading ? (
            <div className="space-y-4 mt-4">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-xs">
              No replies yet.
            </div>
          )}
        </TabsContent>
        <TabsContent value="tab-3">
          {loading ? (
            <div className="space-y-4 mt-4">
              <div className="w-full grid grid-cols-2 gap-4">
                <PostSkeleton />
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground text-xs">
              No media to show.
            </div>
          )}
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
                  onDeletePost(deletePostId);
                }
                setDeletePostId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}
