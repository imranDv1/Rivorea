"use client";
import { Button } from "@/components/ui/button";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import BannerCropper, {
  BannerCropperRef,
} from "@/components/ui/banner-cropper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HiCheckBadge } from "react-icons/hi2";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Repeat2, User, Upload, X } from "lucide-react";
import { useUser } from "@/hooks/user";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

// Simple Skeleton loader component
const Skeleton = ({
  className = "",
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div className={`bg-[#242424] animate-pulse ${className}`} style={style} />
);

const ProfilePage = () => {
  const { userId } = useUser();

  type UserInfo = {
    username: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image: string | null;
    displayUsername: string | null;
    bio: string | null;
    bannerImage: string | null;
    badge: string | null;
    followersCount: number;
    followingCount: number;
  } | null;

  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="w-full  h-screen ">
      <Card className="h-screen overflow-y-scroll  scrollbar-hide">
        <CardHeader className="relative">
          {/* Banner */}
          {loading ? (
            <Skeleton className="w-full h-36 rounded-md object-cover bg-[#222]" />
          ) : (
            <Image
              src={userInfo?.bannerImage || "/default-banner.png"}
              alt="Banner image"
              width={900}
              height={180}
              className="w-full h-36 object-cover bg-[#333]"
              priority
            />
          )}

          {/* Profile Image */}
          <div className="absolute -bottom-18 left-4 lg:left-8 flex items-center">
            {loading ? (
              <Skeleton className="rounded-full border-4 border-[#111] w-[120px] h-[120px] shadow-lg" />
            ) : (
              <Image
                src={userInfo?.image || "/defualt.ong"}
                alt="Profile image"
                width={140}
                height={140}
                className="rounded-full border-4 border-[#111] object-cover w-[120px] h-[120px] shadow-lg"
                priority
              />
            )}
          </div>

          {/* Name, username, badge */}
          <div className="absolute -bottom-15 left-37 lg:left-40">
            {loading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-6 w-28 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            ) : (
              <>
                <h1 className="text-[20px] flex items-center gap-2 font-semibold text-white">
                  {userInfo?.name as string}
                  {userInfo?.badge === "blue" ? (
                    <HiCheckBadge className="text-blue-500" />
                  ) : userInfo?.badge === "gold" ? (
                    <HiCheckBadge className="text-yellow-400" />
                  ) : null}
                </h1>
                <h1 className="text-[18px] text-muted-foreground">
                  @{userInfo?.username || "imran"}
                </h1>
              </>
            )}
          </div>

          {/* Edit Profile Button */}
          <Button
            variant="outline"
            className="absolute right-8 -bottom-10 rounded-4xl ring-1 ring-[#333]"
            disabled={loading}
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit Profile
          </Button>
        </CardHeader>
        <CardDescription className="mt-17 w-[90%] mx-auto">
          {/* Bio */}
          {loading ? (
            <div className="space-y-1">
              <Skeleton className="h-5 w-1/2 rounded mb-2" />
              <Skeleton className="h-4 w-1/3 rounded" />
            </div>
          ) : (
            <p className="text-[19px] text-primary">{userInfo?.bio}</p>
          )}

          {/* Followers/Following */}
          <div className="flex items-center gap-5 mt-5">
            {loading ? (
              <>
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-24 rounded" />
              </>
            ) : (
              <>
                <h1>
                  <span className="text-primary mr-1 font-semibold">
                    {userInfo?.followingCount}
                  </span>
                  Following
                </h1>
                <h1>
                  <span className="text-primary mr-1 font-semibold">
                    {userInfo?.followersCount}
                  </span>
                  Followers
                </h1>
              </>
            )}
          </div>
        </CardDescription>
        <CardContent>
          <Tabs className="items-start w-full" defaultValue="tab-1">
            <TabsList className="w-full flex justify-between">
              <TabsTrigger className="flex-1" value="tab-1">
                Posts (5)
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="tab-2">
                Replies
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="tab-3">
                Media
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab-1">
              {/* Only show posts after user info has loaded */}
              {loading ? (
                // Posts skeleton
                <div className="w-full flex flex-col gap-4 mt-4">
                  {[1, 2, 3].map((idx) => (
                    <div
                      className="w-full rounded-xl p-4 bg-background border"
                      key={idx}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-5 w-16 rounded" />
                      </div>
                      <Skeleton className="h-4 w-full mb-1 rounded" />
                      <Skeleton className="h-4 w-2/3 mb-1 rounded" />
                      <Skeleton className="h-40 w-full rounded mb-2" />
                      <div className="flex justify-between mt-3">
                        <Skeleton className="h-4 w-9 rounded" />
                        <Skeleton className="h-4 w-9 rounded" />
                        <Skeleton className="h-4 w-9 rounded" />
                        <Skeleton className="h-4 w-9 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // ========== Real content below =============
                <div className=" w-full flex flex-col gap-4 mt-4">
                  {/* Post 2 with 4 images */}
                  <div className=" w-full rounded-xl p-4 bg-background border">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src="/me.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">Imraan</span>
                      <span className="text-muted-foreground">
                        @imraan · 16m
                      </span>
                    </div>
                    <p className="text-base text-foreground mb-3">
                      Just got back from the weekend trip! 🌄 Check out these
                      scenes I captured 📸{" "}
                      <span className="text-blue-500">#TravelDiaries</span>
                    </p>
                    {/* 4 images in grid */}
                    <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden mb-2">
                      <Image
                        src="/post2.jpg"
                        alt="Trip Photo 1"
                        width={320}
                        height={180}
                        className="w-full h-52 object-cover"
                      />
                      <Image
                        src="/post3.jpg"
                        alt="Trip Photo 2"
                        width={320}
                        height={180}
                        className="w-full h-52 object-cover"
                      />
                      <Image
                        src="/post1.jpg"
                        alt="Trip Photo 3"
                        width={320}
                        height={180}
                        className="w-full h-52 object-cover"
                      />
                      <Image
                        src="/post4.png"
                        alt="Trip Photo 4"
                        width={320}
                        height={180}
                        className="w-full h-52 object-cover"
                      />
                    </div>
                    <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <User className="size-4" />
                        36
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <MessageCircle className="size-4" />
                        12
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <Heart className="size-4" />
                        240
                      </Button>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="size-4" />
                        7.3k
                      </span>
                    </div>
                  </div>
                  {/* Post 1: Video Post */}
                  <div className="rounded-xl p-4 bg-background border">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src="/me.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">Imraan</span>
                      <span className="text-muted-foreground">
                        @imraan · 5m
                      </span>
                    </div>
                    <p className="text-base text-foreground mb-3">
                      Had to share this quick timelapse of my latest coding
                      session. Watch till the end! ⏳💻
                    </p>
                    <div className="rounded-lg overflow-hidden mb-2">
                      <video
                        controls
                        width="100%"
                        poster="/post2.jpg"
                        className="w-full max-h-96 rounded-lg object-cover bg-black"
                      >
                        <source
                          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <User className="size-4" />
                        95
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <MessageCircle className="size-4" />
                        23
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <Heart className="size-4" />
                        630
                      </Button>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="size-4" />
                        14.7k
                      </span>
                    </div>
                  </div>
                  {/* Post 3 */}
                  <div className="rounded-xl p-4 bg-background border">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src="/me.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">Imraan</span>
                      <span className="text-muted-foreground">
                        @imraan · 1h
                      </span>
                    </div>
                    <p className="text-base text-foreground">
                      Excited to share my new project launch! 🚀 Check it out
                      and let me know your thoughts.
                    </p>
                    <div className="flex justify-between mt-4 text-muted-foreground text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <User className="size-4" />
                        23
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <MessageCircle className="size-4" />
                        10
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <Heart className="size-4" />
                        120
                      </Button>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="size-4" />
                        5.5k
                      </span>
                    </div>
                  </div>
                  {/* Post 4 */}
                  <div className="rounded-xl p-4 bg-background border">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src="/me.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">Imraan</span>
                      <span className="text-muted-foreground">
                        @imraan · 3h
                      </span>
                    </div>
                    <p className="text-base text-foreground">
                      Working on a full-stack app—TypeScript is such a joy to
                      use!
                    </p>
                    <Image
                      src="/post1.jpg"
                      alt="sample post img"
                      width={600}
                      height={220}
                      className="rounded-lg mt-3 w-full max-h-110 object-cover"
                    />
                    <div className="flex justify-between mt-4 text-muted-foreground text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <User className="size-4" />
                        19
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <MessageCircle className="size-4" />4
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <Heart className="size-4" />
                        88
                      </Button>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="size-4" />
                        2.1k
                      </span>
                    </div>
                  </div>
                  {/* Post 5 */}
                  <div className="rounded-xl p-4 bg-background border">
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src="/me.png"
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">Imraan</span>
                      <span className="text-muted-foreground">
                        @imraan · 7h
                      </span>
                    </div>
                    <p className="text-base text-foreground">
                      Web dev tip: Use flexbox or CSS grid to easily lay out any
                      UI! 💡
                    </p>
                    <div className="flex justify-between mt-4 text-muted-foreground text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <User className="size-4" />7
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <MessageCircle className="size-4" />1
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                      >
                        <Heart className="size-4" />
                        33
                      </Button>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="size-4" />
                        1k
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="tab-2">
              <div className="p-4 text-center text-muted-foreground text-xs">
                No replies yet.
              </div>
            </TabsContent>
            <TabsContent value="tab-3">
              <div className="p-4 text-center text-muted-foreground text-xs">
                No media to show.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto  border-[#333] scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-white ">Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your profile information and images
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Banner Image */}
            <div className="space-y-2">
              <Label className="text-white">Banner Image</Label>
              <div className="relative">
                {showBannerCropper && bannerImagePreview ? (
                  <div className="space-y-2">
                    <BannerCropper
                      ref={bannerCropperRef}
                      image={bannerImagePreview}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyBannerCrop}
                      >
                        Apply Crop
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowBannerCropper(false);
                          setBannerImageFile(null);
                          setBannerImagePreview(userInfo?.bannerImage || null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="h-36 w-full bg-[#222] rounded-lg overflow-hidden">
                      {bannerImagePreview ? (
                        <Image
                          src={bannerImagePreview}
                          alt="Banner preview"
                          width={800}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No banner image
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => {
                        bannerImageInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner
                    </Button>
                    {bannerImagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setBannerImagePreview(null);
                          setBannerImageFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <input
                      ref={bannerImageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleBannerImageSelect}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <Label className="text-white">Profile Image</Label>
              <div className="flex items-center gap-4">
                {showProfileCropper && profileImagePreview ? (
                  <div className="space-y-2 flex-1">
                    <div ref={profileCropperRef}>
                      <Cropper
                        image={profileImagePreview}
                        aspectRatio={1}
                        className="h-64 w-full bg-[#222] rounded-lg"
                      >
                        <CropperDescription />
                        <CropperImage />
                        <CropperCropArea className="rounded-full" />
                      </Cropper>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyProfileCrop}
                      >
                        Apply Crop
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowProfileCropper(false);
                          setProfileImageFile(null);
                          setProfileImagePreview(userInfo?.image || null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-[#222] border-2 border-[#333]">
                        {profileImagePreview ? (
                          <Image
                            src={profileImagePreview}
                            alt="Profile preview"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      {profileImagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            setProfileImagePreview(null);
                            setProfileImageFile(null);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        profileImageInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleProfileImageSelect}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-[#222] border-[#333] text-white"
                placeholder="Your name"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="bg-[#222] border-[#333] text-white"
                placeholder="username"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">
                Bio
              </Label>
              <div className="relative">
                <Textarea
                  id="bio"
                  value={formData.bio}
                  maxLength={160}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="bg-[#222] border-[#333] text-white min-h-24"
                  placeholder="Tell us about yourself"
                  rows={4}
                />
                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                  {formData.bio.length}/160
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
