"use client";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/user";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useNoteNotificationStore } from "@/context/post-create-trigger";
import type { Post, UserInfo } from "./profileTypes";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileOverview } from "./ProfileOverview";
import { ProfilePostsTabs } from "./ProfilePostsTabs";
import { EditProfileDialog } from "./EditProfileDialog";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import type { BannerCropperRef } from "@/components/ui/banner-cropper";

const ProfilePage = () => {
  const { userId } = useUser();

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
        // When userId is not available, don't try to fetch posts
        if (!userId) {
          setPosts(null);
          return;
        }

        const response = await fetch("/api/post/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        setPosts(data.posts);
      } catch (_err) {
        toast.error("error getting posts");
      }
    }

    FetchPosts();
  }, [userId, refreshSignal]);

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
    if (!userId) {
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
        body: JSON.stringify({ userId, postId }),
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

  useEffect(() => {
    if (!userId) {
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
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        setUserInfo(data.userInfo);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

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
    if (!userId) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);
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
    if (!userId) return;

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
          userId,
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
            if (userInfo?.bannerImage) {
              setPreviewSrc(userInfo.bannerImage);
              setPreviewTitle("Banner image");
            }
          }}
          onAvatarClick={() => {
            if (userInfo?.image) {
              setPreviewSrc(userInfo.image);
              setPreviewTitle("Profile image");
            }
          }}
        />
        <ProfileOverview loading={loading} userInfo={userInfo} />
        <ProfilePostsTabs
          loading={loading}
          posts={posts}
          userInfo={userInfo}
          onDeletePost={handleDeletePost}
          onSharePost={handleSharePost}
          onToggleLike={handleToggleLike}
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
    </div>
  );
};

export default ProfilePage;
