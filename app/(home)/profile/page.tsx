"use client";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/user";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useNoteNotificationStore } from "@/context/post-create-trigger";
import { useSearchParams, useRouter } from "next/navigation";
import type { Post, UserInfo } from "./profileTypes";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileOverview } from "./ProfileOverview";
import { ProfilePostsTabs } from "./ProfilePostsTabs";
import { EditProfileDialog } from "./EditProfileDialog";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import type { BannerCropperRef } from "@/components/ui/banner-cropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

const ProfilePage = () => {
  const { userId: currentUserId } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileUserId = searchParams.get("userId") || currentUserId; // Use URL param or current user
  const isOwnProfile = profileUserId === currentUserId;

  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const refreshSignal = useNoteNotificationStore(
    (state) => state.refreshNoteSignal
  );

  useEffect(() => {
    async function FetchPosts() {
      try {
        // When profileUserId is not available, don't try to fetch posts
        if (!profileUserId) {
          setPosts(null);
          return;
        }

        const response = await fetch("/api/post/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: profileUserId }),
        });

        const data = await response.json();
        setPosts(data.posts);
      } catch {
        toast.error("error getting posts");
      }
    }

    FetchPosts();
  }, [profileUserId, refreshSignal]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    username: "",
  });

  // Image cropping state
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(
    null
  );
  const [showProfileCropper, setShowProfileCropper] = useState(false);
  const [showBannerCropper, setShowBannerCropper] = useState(false);

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);
  const profileCropperRef = useRef<HTMLDivElement>(null);
  const bannerCropperRef = useRef<BannerCropperRef>(null);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      image: string | null;
      bio: string | null;
    }>
  >([]);
  const [showFollowingList, setShowFollowingList] = useState(false);

  useEffect(() => {
    if (!profileUserId) {
      setUserInfo(null);
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: profileUserId }),
        });

        const data = await response.json();
        setUserInfo(data.userInfo);

        // Check if current user is following this profile user
        if (currentUserId && profileUserId !== currentUserId) {
          const followCheckResponse = await fetch("/api/user/following", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId }),
          });
          if (followCheckResponse.ok) {
            const followCheckData = await followCheckResponse.json();
            const isFollowingUser =
              followCheckData.following?.some(
                (u: { id: string }) => u.id === profileUserId
              ) || false;
            setIsFollowing(isFollowingUser);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [profileUserId, currentUserId]);

  const handleFollowToggle = async () => {
    if (!currentUserId || !profileUserId || isOwnProfile) return;

    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing); // Optimistic update

    try {
      const response = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          targetUserId: profileUserId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle follow");
      }

      const data = await response.json();
      setIsFollowing(data.isFollowing);

      // Update user info with new follower count
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          followersCount: data.followersCount,
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(wasFollowing); // Rollback on error
      toast.error("Failed to update follow status");
    }
  };

  const fetchFollowingUsers = async () => {
    if (!profileUserId) return;

    try {
      const response = await fetch("/api/user/following", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profileUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowingUsers(data.following || []);
        setShowFollowingList(true);
      }
    } catch (error) {
      console.error("Error fetching following users:", error);
      toast.error("Failed to load following list");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUserId || !isOwnProfile) return;

    try {
      const response = await fetch(
        `/api/post?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(currentUserId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error || "Failed to delete post");
        return;
      }

      setPosts((prev) => (prev ? prev.filter((p) => p.id !== postId) : prev));
      toast.success("Post deleted");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleSharePost = async (postId: string) => {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/post/${postId}`;

      if (navigator.share) {
        await navigator.share({
          title: userInfo?.name || "Post",
          text: userInfo?.username ? `@${userInfo.username} on Rivorea` : "",
          url,
        });
      } else if (navigator.clipboard && origin) {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied to clipboard");
      } else {
        toast.error("Sharing is not supported in this browser");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Failed to share post");
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUserId) {
      toast.error("You must be logged in to like posts");
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev
        ? prev.map((post) => {
            if (post.id !== postId) return post;
            const alreadyLiked = !!post.likedByCurrentUser;
            const likeDelta = alreadyLiked ? -1 : 1;

            return {
              ...post,
              likedByCurrentUser: !alreadyLiked,
              _count: {
                ...post._count,
                likes: post._count.likes + likeDelta,
              },
            };
          })
        : prev
    );

    try {
      const response = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, postId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.message || "Failed to like post");
        // rollback optimistic update
        setPosts((prev) =>
          prev
            ? prev.map((post) => {
                if (post.id !== postId) return post;
                const likedNow = !!post.likedByCurrentUser;
                const likeDelta = likedNow ? -1 : 1;
                return {
                  ...post,
                  likedByCurrentUser: !likedNow,
                  _count: {
                    ...post._count,
                    likes: post._count.likes + likeDelta,
                  },
                };
              })
            : prev
        );
        return;
      }

      const data = await response.json();

      setPosts((prev) =>
        prev
          ? prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    _count: {
                      ...post._count,
                      likes: data.likesCount ?? post._count.likes,
                    },
                  }
                : post
            )
          : prev
      );
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
      // rollback optimistic update
      setPosts((prev) =>
        prev
          ? prev.map((post) => {
              if (post.id !== postId) return post;
              const likedNow = !!post.likedByCurrentUser;
              const likeDelta = likedNow ? -1 : 1;
              return {
                ...post,
                likedByCurrentUser: !likedNow,
                _count: {
                  ...post._count,
                  likes: post._count.likes + likeDelta,
                },
              };
            })
          : prev
      );
    }
  };

  // Initialize form data when userInfo changes
  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name || "",
        bio: userInfo.bio || "",
        username: userInfo.username || "",
      });
      setProfileImagePreview(userInfo.image);
      setBannerImagePreview(userInfo.bannerImage);
    }
  }, [userInfo]);

  // Handle profile image file selection
  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PNG
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "png") {
        toast.error(
          "PNG files are not allowed. Please use JPG, JPEG, or WEBP format."
        );
        e.target.value = ""; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
        setShowProfileCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle banner image file selection
  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PNG
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "png") {
        toast.error(
          "PNG files are not allowed. Please use JPG, JPEG, or WEBP format."
        );
        e.target.value = ""; // Reset input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
        setShowBannerCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Supabase
  const uploadImage = async (
    file: File,
    type: "profile" | "banner",
    oldImageUrl?: string | null
  ): Promise<string | null> => {
    if (!currentUserId) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", currentUserId);
      formData.append("type", type);
      if (oldImageUrl) {
        formData.append("oldImageUrl", oldImageUrl);
      }

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!currentUserId) return;

    setIsSaving(true);
    try {
      let profileImageUrl = userInfo?.image || null;
      let bannerImageUrl = userInfo?.bannerImage || null;

      // Upload images if new ones were selected
      if (profileImageFile) {
        const url = await uploadImage(
          profileImageFile,
          "profile",
          userInfo?.image || null
        );
        if (url) profileImageUrl = url;
      }

      if (bannerImageFile) {
        const url = await uploadImage(
          bannerImageFile,
          "banner",
          userInfo?.bannerImage || null
        );
        if (url) bannerImageUrl = url;
      }

      // Update profile
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          name: formData.name,
          bio: formData.bio,
          username: formData.username,
          image: profileImageUrl,
          bannerImage: bannerImageUrl,
        }),
      });

      if (!response.ok) {
        await response.json();
        if (response.status === 409) {
          toast.error("Username already taken");
        } else {
          toast.error("Failed to update profile");
        }
        return;
      }

      const data = await response.json();
      setUserInfo(data.userInfo);
      setIsEditDialogOpen(false);
      toast.success("Profile updated successfully");

      // Reset image states
      setProfileImageFile(null);
      setBannerImageFile(null);
      setShowProfileCropper(false);
      setShowBannerCropper(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Get cropped image as blob from crop area
  const getCroppedImage = async (
    imageSrc: string,
    cropArea: { x: number; y: number; width: number; height: number },
    displayedWidth: number,
    displayedHeight: number,
    naturalWidth: number,
    naturalHeight: number
  ): Promise<File | null> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        // Calculate scale factors: how much the displayed image is scaled from natural size
        const scaleX = naturalWidth / displayedWidth;
        const scaleY = naturalHeight / displayedHeight;

        // Calculate the actual crop coordinates in the natural image
        const sourceX = cropArea.x * scaleX;
        const sourceY = cropArea.y * scaleY;
        const sourceWidth = cropArea.width * scaleX;
        const sourceHeight = cropArea.height * scaleY;

        // Set canvas size to cropped area (use natural dimensions for quality)
        canvas.width = sourceWidth;
        canvas.height = sourceHeight;

        // Draw the cropped portion from the natural image
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          sourceWidth,
          sourceHeight
        );

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "cropped-image.png", {
                type: "image/png",
              });
              resolve(file);
            } else {
              resolve(null);
            }
          },
          "image/png",
          0.95
        );
      };
      img.onerror = () => resolve(null);
    });
  };

  // Handle applying crop for profile image
  const handleApplyProfileCrop = async () => {
    if (!profileImagePreview || !profileCropperRef.current) return;

    const cropperElement = profileCropperRef.current;

    // Get the image element to get natural dimensions
    const imgElement = cropperElement.querySelector(
      '[data-slot="cropper-image"]'
    ) as HTMLImageElement;
    if (!imgElement) {
      toast.error("Image not loaded");
      return;
    }

    // Wait for image to load
    await new Promise((resolve) => {
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        resolve(null);
      } else {
        imgElement.onload = () => resolve(null);
        // Timeout fallback
        setTimeout(() => resolve(null), 2000);
      }
    });

    // Get crop area from the cropper
    const cropAreaElement = cropperElement.querySelector(
      '[data-slot="cropper-crop-area"]'
    ) as HTMLElement;
    if (!cropAreaElement) {
      toast.error("Crop area not found");
      return;
    }

    // Get crop area and image positions relative to container
    const cropRect = cropAreaElement.getBoundingClientRect();
    const containerRect = cropperElement.getBoundingClientRect();
    const imgRect = imgElement.getBoundingClientRect();

    // Calculate crop area relative to the image (not container)
    // The crop area is positioned relative to the container, but we need it relative to the image
    const imageXInContainer = imgRect.left - containerRect.left;
    const imageYInContainer = imgRect.top - containerRect.top;

    // Get displayed image dimensions
    const displayedWidth = imgRect.width;
    const displayedHeight = imgRect.height;

    // Crop area relative to image
    const cropArea = {
      x: cropRect.left - containerRect.left - imageXInContainer,
      y: cropRect.top - containerRect.top - imageYInContainer,
      width: cropRect.width,
      height: cropRect.height,
    };

    const croppedFile = await getCroppedImage(
      profileImagePreview,
      cropArea,
      displayedWidth,
      displayedHeight,
      imgElement.naturalWidth,
      imgElement.naturalHeight
    );

    if (croppedFile) {
      setProfileImageFile(croppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
      setShowProfileCropper(false);
      toast.success("Profile image cropped");
    } else {
      toast.error("Failed to crop image");
    }
  };

  // Handle applying crop for banner image
  const handleApplyBannerCrop = async () => {
    if (!bannerImagePreview || !bannerCropperRef.current) return;

    const cropArea = bannerCropperRef.current.getCropArea();

    // Find the image element in the cropper
    const cropperContainer = bannerCropperRef.current.containerRef?.current;
    if (!cropperContainer) {
      toast.error("Cropper not initialized");
      return;
    }

    const imgElement = cropperContainer.querySelector(
      "img"
    ) as HTMLImageElement;
    if (!imgElement) {
      toast.error("Image not loaded");
      return;
    }

    await new Promise((resolve) => {
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        resolve(null);
      } else {
        imgElement.onload = () => resolve(null);
        setTimeout(() => resolve(null), 2000);
      }
    });

    // Get displayed image dimensions
    const displayedWidth = imgElement.offsetWidth || imgElement.width;
    const displayedHeight = imgElement.offsetHeight || imgElement.height;

    const croppedFile = await getCroppedImage(
      bannerImagePreview,
      cropArea,
      displayedWidth,
      displayedHeight,
      imgElement.naturalWidth,
      imgElement.naturalHeight
    );

    if (croppedFile) {
      setBannerImageFile(croppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result as string);
      };
      reader.readAsDataURL(croppedFile);
      setShowBannerCropper(false);
      toast.success("Banner image cropped");
    } else {
      toast.error("Failed to crop image");
    }
  };

  return (
    <div className="w-full  relative h-full ">
      <Card className="h-full overflow-y-scroll  scrollbar-hide">
        <ProfileHeader
          loading={loading}
          userInfo={userInfo}
          onEditClick={() => setIsEditDialogOpen(true)}
          onBannerClick={() => {
            if (userInfo?.bannerImage && isOwnProfile) {
              setPreviewSrc(userInfo.bannerImage);
              setPreviewTitle("Banner image");
            }
          }}
          onAvatarClick={() => {
            if (userInfo?.image && isOwnProfile) {
              setPreviewSrc(userInfo.image);
              setPreviewTitle("Profile image");
            }
          }}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
        />
        <ProfileOverview
          loading={loading}
          userInfo={userInfo}
          onFollowingClick={fetchFollowingUsers}
        />
        <ProfilePostsTabs
          loading={loading}
          posts={posts}
          userInfo={userInfo}
          onDeletePost={handleDeletePost}
          onSharePost={handleSharePost}
          onToggleLike={handleToggleLike}
          currentUserId={currentUserId}
        />
      </Card>

      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        isSaving={isSaving}
        userInfo={userInfo}
        formData={formData}
        setFormData={setFormData}
        showBannerCropper={showBannerCropper}
        bannerImagePreview={bannerImagePreview}
        bannerImageInputRef={bannerImageInputRef}
        bannerCropperRef={bannerCropperRef}
        onBannerApplyCrop={handleApplyBannerCrop}
        onBannerSelect={handleBannerImageSelect}
        onBannerReset={() => {
          setShowBannerCropper(false);
          setBannerImageFile(null);
          setBannerImagePreview(userInfo?.bannerImage || null);
        }}
        showProfileCropper={showProfileCropper}
        profileImagePreview={profileImagePreview}
        profileImageInputRef={profileImageInputRef}
        profileCropperRef={profileCropperRef}
        onProfileApplyCrop={handleApplyProfileCrop}
        onProfileSelect={handleProfileImageSelect}
        onProfileReset={() => {
          setShowProfileCropper(false);
          setProfileImageFile(null);
          setProfileImagePreview(userInfo?.image || null);
        }}
        onSaveProfile={handleSaveProfile}
      />
      <ImagePreviewDialog
        open={!!previewSrc}
        src={previewSrc}
        title={previewTitle}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewSrc(null);
            setPreviewTitle("");
          }
        }}
      />
      <Dialog open={showFollowingList} onOpenChange={setShowFollowingList}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
            <DialogDescription>
              Users that {userInfo?.name} follows
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {followingUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Not following anyone yet
              </p>
            ) : (
              followingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer transition-colors"
                  onClick={() => {
                    router.push(`/profile?userId=${user.id}`);
                    setShowFollowingList(false);
                  }}
                >
                  <Image
                    src={user.image || "/default.png"}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
