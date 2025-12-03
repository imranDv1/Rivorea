import { CardDescription } from "@/components/ui/card";
import { HiCheckBadge } from "react-icons/hi2";
import { Skeleton } from "./profileSkeletons";
import type { UserInfo } from "./profileTypes";

type ProfileOverviewProps = {
  loading: boolean;
  userInfo: UserInfo;
};

export function ProfileOverview({ loading, userInfo }: ProfileOverviewProps) {
  return (
    <CardDescription className="mt-15 w-[90%] mx-auto">
      {/* Name, username, badge - only show on mobile (block on <lg, hide on lg+) */}
      <div className="block lg:hidden mb-2">
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
  );
}


