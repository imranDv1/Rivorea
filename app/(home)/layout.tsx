"use client";
import React, { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { authClient } from "@/lib/auth-client";
import {
  Bell,
  Bookmark,
  HomeIcon,
  ImageIcon,
  LogOut,
  Mail,
  Search,
  SearchIcon,
  Settings,
  User,
  X,
  Plus,
} from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useUser } from "@/hooks/user";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNoteNotificationStore } from "@/context/post-create-trigger";

type MediaType = "image" | "video";

type MediaPreview = {
  url: string; // data URL used for preview
  type: MediaType;
};

const sections = [
  {
    id: 1,
    name: "Home",
    icon: HomeIcon,
    href: "/",
  },
  {
    id: 2,
    name: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    id: 3,
    name: "Search",
    icon: Search,
    href: "/search",
  },
  {
    id: 4,
    name: "Notification",
    icon: Bell,
    href: "/notification",
  },
  {
    id: 5,
    name: "Messages",
    icon: Mail,
    href: "/messages",
  },
  {
    id: 6,
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    id: 7,
    name: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
];

const mobileNavBar = [
  {
    id: 1,
    name: "Home",
    icon: HomeIcon,
    href: "/",
  },
  {
    id: 2,
    name: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    id: 3,
    name: "Search",
    icon: Search,
    href: "/",
  },
  {
    id: 4,
    name: "Notification",
    icon: Bell,
    href: "/",
  },
  {
    id: 5,
    name: "Messages",
    icon: Mail,
    href: "/",
  },
];

const fakeUsers = [
  {
    id: 1,
    name: "John Doe",
    username: "john doe",
    avatar: "https://github.com/shadcn.png",
    verified: true,
  },
  {
    id: 2,
    name: "Jane Doe",
    username: "jane doe",
    avatar: "https://github.com/shadcn.png",
    verified: true,
  },
  {
    id: 3,
    name: "Jim Doe",
    username: "jim doe",
    avatar: "https://github.com/shadcn.png",
    verified: false,
  },
  {
    id: 4,
    name: "Jill Doe",
    username: "jill doe",
    avatar: "https://github.com/shadcn.png",
    verified: true,
  },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { isPending, user } = useUser();
  const pathname = usePathname();
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [postProgress, setPostProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const triggerRefresh = useNoteNotificationStore(
    (state) => state.triggerRefresh
  );
  // Max file sizes
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  const MAX_MEDIA_FILES = 4;

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image src="/logo.png" alt="logo" width={100} height={100} />
      </div>
    );
  }

  if (!user) {
    console.log("user not found");
    // Optionally redirect to login or show a message if user is not found after loading

    window.location.reload()

  }

  function handleLogout() {
    authClient.signOut();
    redirect("/login");
  }

  // Only show mobile floating post & logout buttons on exact "/" and "/profile" ONLY
  const showMobileActions =
    pathname === "/" || pathname === "/profile";

  // Dialog component reused for both desktop and mobile button
  const postDialog = (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Reset media and content when dialog closes
          setMediaPreviews([]);
          setUploadedFiles([]);
          setPostContent("");
        }
      }}
    >
      {/* DialogTrigger must be a child where you want to trigger it manually */}
      {/* On mobile, we'll open by setIsDialogOpen(true) */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-3">
            <Image
              src={user?.image as string}
              alt="Profile image"
              width={100}
              height={100}
              className="rounded-full size-12 object-cover shrink-0"
            />

            <Textarea
              placeholder="What's on your mind?"
              maxLength={280}
              autoFocus={true}
              onChange={(e) => setPostContent(e.target.value)}
              className="resize-none h-[150px] flex-1"
              value={postContent}
            />
          </div>

          {/* Media previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaPreviews.map((media, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border"
                >
                  {media.type === "image" ? (
                    // For data URLs and fast previews we use normal <img>
                    // (next/image may attempt to optimize and require external loader config)
                    // so keep it simple and reliable with <img>.
                    // Styling matches previous usage.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-32 object-cover"
                      controls
                      preload="metadata"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
                      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Media upload button */}
          <div className="flex items-center gap-2">
            <input
              id="mediaUpload"
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (files) {
                  const remainingSlots = MAX_MEDIA_FILES - mediaPreviews.length;
                  if (remainingSlots <= 0) {
                    toast.error(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
                    e.target.value = "";
                    return;
                  }

                  const filesArray = Array.from(files);

                  // Validate file sizes and types
                  const validFiles: File[] = [];
                  const invalidFiles: string[] = [];

                  filesArray.forEach((file) => {
                    const isImage = file.type.startsWith("image/");
                    const isVideo = file.type.startsWith("video/");
                    const maxSize = isImage
                      ? MAX_IMAGE_SIZE
                      : isVideo
                        ? MAX_VIDEO_SIZE
                        : 0;

                    if (!isImage && !isVideo) {
                      invalidFiles.push(`${file.name} (invalid type)`);
                      return;
                    }

                    if (maxSize === 0) {
                      invalidFiles.push(`${file.name} (unsupported type)`);
                      return;
                    }

                    if (file.size > maxSize) {
                      const maxMB = Math.round(maxSize / (1024 * 1024));
                      invalidFiles.push(`${file.name} (max ${maxMB}MB)`);
                    } else {
                      validFiles.push(file);
                    }
                  });

                  if (invalidFiles.length > 0) {
                    toast.error(`Invalid files: ${invalidFiles.join(", ")}`);
                  }

                  const filesToAdd = validFiles.slice(0, remainingSlots);

                  if (validFiles.length > remainingSlots) {
                    toast.error(
                      `You can only upload ${remainingSlots} more file(s). ${validFiles.length - remainingSlots} file(s) were not added.`
                    );
                  }

                  if (filesToAdd.length === 0) {
                    e.target.value = "";
                    return;
                  }

                  // Read all files as data URLs for preview
                  const readFileAsDataURL = (file: File): Promise<string> => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                  };

                  try {
                    const newPreviews: MediaPreview[] = await Promise.all(
                      filesToAdd.map(async (file) => {
                        const url = await readFileAsDataURL(file);
                        const type: MediaType = file.type.startsWith("image/")
                          ? "image"
                          : "video";
                        return { url, type };
                      })
                    );

                    setMediaPreviews((prev) => [...prev, ...newPreviews]);
                    setUploadedFiles((prev) => [...prev, ...filesToAdd]);
                  } catch (error) {
                    console.error("Error reading files:", error);
                    toast.error("Error reading media files");
                  }
                }
                // clear the input so same file can be re-selected if user wants
                e.target.value = "";
              }}
              disabled={mediaPreviews.length >= MAX_MEDIA_FILES}
            />
            <label htmlFor="mediaUpload">
              <Button
                variant="ghost"
                size="icon-lg"
                type="button"
                onClick={(e) => {
                  if (mediaPreviews.length >= MAX_MEDIA_FILES) {
                    toast.error(`Maximum ${MAX_MEDIA_FILES} media files allowed`);
                    return;
                  }
                  document.getElementById("mediaUpload")?.click();
                }}
                disabled={mediaPreviews.length >= MAX_MEDIA_FILES}
              >
                <ImageIcon />
              </Button>
            </label>
            {mediaPreviews.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {mediaPreviews.length}/{MAX_MEDIA_FILES} files
              </span>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <span>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </span>
          </DialogClose>
          <Button
            variant="default"
            onClick={async () => {
              if (!postContent.trim() && uploadedFiles.length === 0) {
                toast.error("Please add content or media to your post");
                return;
              }

              if (!user?.id) {
                toast.error("User not found");
                return;
              }

              setIsPosting(true);
              setPostProgress(5);
              setIsDialogOpen(false);

              try {
                const mediaUrls: string[] = [];
                const totalSteps = uploadedFiles.length + 1; // uploads + final post create

                for (let i = 0; i < uploadedFiles.length; i++) {
                  const file = uploadedFiles[i];
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("userId", user.id);

                  const uploadResponse = await fetch("/api/upload-post-media", {
                    method: "POST",
                    body: formData,
                  });

                  if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(
                      errorData.message || "Failed to upload media"
                    );
                  }

                  const uploadData = await uploadResponse.json();
                  mediaUrls.push(uploadData.url);

                  const step = i + 1;
                  setPostProgress(Math.round((step / totalSteps) * 100));
                }

                const postResponse = await fetch("/api/post", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    content: postContent.trim(),
                    mediaUrl: mediaUrls,
                  }),
                });

                if (!postResponse.ok) {
                  const errorData = await postResponse.json();
                  throw new Error(errorData.message || "Failed to create post");
                }

                toast.success("Post created successfully!");
                setPostProgress(100);
                triggerRefresh();
                setMediaPreviews([]);
                setUploadedFiles([]);
                setPostContent("");
                setIsDialogOpen(false);
              } catch (error) {
                console.error("Error creating post:", error);
                toast.error(
                  error instanceof Error ? error.message : "Failed to create post"
                );
              } finally {
                setIsPosting(false);
                setTimeout(() => setPostProgress(0), 400);
              }
            }}
            disabled={isPosting}
          >
            {isPosting ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="w-full h-screen flex lg:gap-4 relative">
      {/* Top loading bar while posting, reflects real upload/progress */}
      {isPosting && (
        <div className="fixed top-0 left-0 z-[80] w-full h-1 bg-blue-500/20">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${postProgress}%` }}
          />
        </div>
      )}
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex flex-col h-full overflow-y-auto p-4">
        <Card className="w-full h-full overflow-hidden ">
          <CardContent className="flex flex-col gap-6">
            {sections.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 hover:bg-[#222] rounded-2xl p-2"
              >
                <Link href={item.href} className="flex items-center gap-4">
                  <item.icon className="size-6" />
                  <span className="text-2xl font-semibold ">{item.name}</span>
                </Link>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setMediaPreviews([]);
                  setUploadedFiles([]);
                  setPostContent("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="w-full">Post</Button>
              </DialogTrigger>
              {postDialog}
            </Dialog>
          </CardFooter>
        </Card>
        {/* user info */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Card className="w-[200px] mt-4 bg-transparent border-0  flex items-center ">
              <CardContent className="flex items-center justify-between gap-6 sm:gap-9 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                    <AvatarImage
                      src={(user?.image as string) || ""}
                      alt="Profile image"
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {(user?.name?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 items-start">
                    <h1 className="truncate text-base sm:text-lg font-medium">
                      {user?.name ? user.name.split(" ")[0] : "User"}
                    </h1>
                    <h1 className="text-xs sm:text-sm text-muted-foreground truncate">
                      @{user?.username ?? "unknown"}
                    </h1>
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="ml-auto shrink-0"
                >
                  <circle cx="5" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="19" cy="12" r="2" fill="currentColor" />
                </svg>
              </CardContent>
            </Card>

            <DropdownMenuContent>
              <DropdownMenuLabel onClick={handleLogout}>
                Logout
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>

      {/* Main content */}
      <div className="lg:w-[50%] w-full h-full lg:p-4 pb-16 lg:pb-0">
        {children}
      </div>
      {/* Right sidebar */}
      <div className=" w-[30%] hidden lg:block h-full overflow-y-auto p-4">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        {/* user to follow */}
        <Card className="mt-5 h-max">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">You might like</CardTitle>
          </CardHeader>
          <CardContent>
            {fakeUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-2 py-3 hover:bg-muted/40 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10   shadow-md">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-base text-white">
                        {user.name}
                      </span>
                      {user.verified && (
                        <span className="ml-1 text-blue-500" title="Verified">
                          <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 0l2.392 3.74 4.099-.197-.755 4.002L20 10.214l-4.264 2.099.227 4.086-3.972-.812L10 20l-2.002-4.413-3.972.812.227-4.086L0 10.214l4.264-2.669-.755-4.002 4.099.197zM8.293 13.707l6-6-1.414-1.414L8 10.586l-1.293-1.293-1.414 1.414 2 2a1 1 0 001.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground block">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <Button variant="default" size="sm">
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Trending topics for desktop */}
        <Card className="mt-5 h-max">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Trending topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex  flex-col gap-2">
                <h1 className="text-sm text-muted-foreground">
                  Trending in Somalia
                </h1>
                <span className="">Trending topic 1</span>
              </div>
              <div className="flex  flex-col gap-2">
                <h1 className="text-sm text-muted-foreground">
                  Trending in Somalia
                </h1>
                <span className="">Trending topic 1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navbar */}
      <nav className="fixed bottom-0 left-0 z-50 w-full bg-background border-t border-muted lg:hidden">
        <div className="flex justify-around items-center p-2 relative">
          {mobileNavBar.map((item) => (
            <Link
              href={item.href}
              key={item.id}
              className="flex flex-col items-center text-sm group"
            >
              <item.icon className="w-6 h-6 group-hover:text-primary transition-colors" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
      {/* Show floating post & logout buttons only if on "/" or "/profile" */}
      {showMobileActions && (
        <>
          <div className="lg:hidden">
            <Button
              size="icon"
              className="
                bg-blue-500 
                text-white 
                rounded-full 
                shadow-lg 
                fixed 
                z-1 
                bottom-[74px] 
                right-4
                lg:hidden 
                w-14 
                h-14 
                flex 
                items-center 
                justify-center 
                border-4 
                border-background 
                hover:bg-blue-600
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-600
                "
              aria-label="Create post"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-8 h-8" />
            </Button>
            {postDialog}
          </div>
     
        </>
      )}
    </div>
  );
};

export default Layout;