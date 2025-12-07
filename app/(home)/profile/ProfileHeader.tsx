import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { HiCheckBadge } from "react-icons/hi2";
import { Skeleton } from "./profileSkeletons";
import type { UserInfo } from "./profileTypes";

type ProfileHeaderProps = {
  loading: boolean;
  userInfo: UserInfo;
  onEditClick: () => void;
  onBannerClick?: () => void;
  onAvatarClick?: () => void;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
};

export function ProfileHeader({
  loading,
  userInfo,
  onEditClick,
  onBannerClick,
  onAvatarClick,
  isOwnProfile = true,
  isFollowing = false,
  onFollowToggle,
}: ProfileHeaderProps) {
  return (
    <CardHeader className="relative">
      {/* Banner */}
      {loading ? (
        <Skeleton className="w-full h-36 rounded-md object-cover bg-[#222]" />
      ) : (
        <button
          type="button"
          className="w-full h-36 block"
          onClick={onBannerClick}
          disabled={!userInfo?.bannerImage}
        >
          <Image
            src={userInfo?.bannerImage || "/default-banner.png"}
            alt="Banner image"
            width={900}
            height={180}
            className="w-full h-36 object-cover bg-[#333] cursor-pointer"
            priority
          />
        </button>
      )}

      {/* Profile Image */}
      <div className="absolute -bottom-18 left-4 lg:left-8 flex items-center">
        {loading ? (
          <Skeleton className="rounded-full border-4 border-[#111] w-[120px] h-[120px] shadow-lg" />
        ) : (
          <button
            type="button"
            onClick={onAvatarClick}
            className="rounded-full border-4 border-[#111] shadow-lg overflow-hidden"
          >
            <Image
              src={userInfo?.image || "/default.png"}
              alt="Profile image"
              width={140}
              height={140}
              className="object-cover w-[120px] h-[120px]"
              priority
            />
          </button>
        )}
      </div>

      {/* Name, username, badge - hidden on mobile, show on lg+ */}
      <div className="hidden lg:block absolute -bottom-15 left-37 lg:left-40">
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

      {/* Edit Profile or Follow Button */}
      {isOwnProfile ? (
        <Button
          variant="outline"
          className="absolute right-8 -bottom-10 rounded-4xl ring-1 ring-[#333]"
          disabled={loading}
          onClick={onEditClick}
        >
          Edit Profile
        </Button>
      ) : (
        <Button
          variant={isFollowing ? "outline" : "default"}
          className="absolute right-8 -bottom-10 rounded-4xl ring-1 ring-[#333]"
          disabled={loading}
          onClick={onFollowToggle}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </CardHeader>
  );
}
