import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import BannerCropper, {
  BannerCropperRef,
} from "@/components/ui/banner-cropper";
import { MutableRefObject } from "react";
import type { UserInfo } from "./profileTypes";

type FormData = {
  name: string;
  bio: string;
  username: string;
};

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  userInfo: UserInfo;
  formData: FormData;
  setFormData: (data: FormData) => void;
  // banner image props
  showBannerCropper: boolean;
  bannerImagePreview: string | null;
  bannerImageInputRef: MutableRefObject<HTMLInputElement | null>;
  bannerCropperRef: MutableRefObject<BannerCropperRef | null>;
  onBannerApplyCrop: () => void;
  onBannerSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerReset: () => void;
  // profile image props
  showProfileCropper: boolean;
  profileImagePreview: string | null;
  profileImageInputRef: MutableRefObject<HTMLInputElement | null>;
  profileCropperRef: MutableRefObject<HTMLDivElement | null>;
  onProfileApplyCrop: () => void;
  onProfileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileReset: () => void;
  onSaveProfile: () => void;
};

export function EditProfileDialog(props: EditProfileDialogProps) {
  const {
    open,
    onOpenChange,
    isSaving,
    userInfo,
    formData,
    setFormData,
    showBannerCropper,
    bannerImagePreview,
    bannerImageInputRef,
    bannerCropperRef,
    onBannerApplyCrop,
    onBannerSelect,
    onBannerReset,
    showProfileCropper,
    profileImagePreview,
    profileImageInputRef,
    profileCropperRef,
    onProfileApplyCrop,
    onProfileSelect,
    onProfileReset,
    onSaveProfile,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      variant="default"
                      size="sm"
                      onClick={onBannerApplyCrop}
                    >
                      Apply Crop
                    </Button>
                    <Button variant="outline" size="sm" onClick={onBannerReset}>
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
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={onBannerReset}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <input
                    ref={bannerImageInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={onBannerSelect}
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
                      variant="default"
                      size="sm"
                      onClick={onProfileApplyCrop}
                    >
                      Apply Crop
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onProfileReset}
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
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={onProfileReset}
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
                    onChange={onProfileSelect}
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
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={onSaveProfile} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
