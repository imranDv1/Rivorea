import React from "react";

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", style }) => (
  <div className={`bg-[#242424] animate-pulse ${className}`} style={style} />
);

export const PostSkeleton: React.FC = () => (
  <div className="w-full rounded-xl p-4 bg-background border">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="rounded-full w-8 h-8" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 rounded mb-2" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>

    <div className="space-y-2 mb-3">
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
    </div>

    <div className="w-full h-48 rounded-lg overflow-hidden mb-3">
      <Skeleton className="w-full h-full rounded-lg" />
    </div>

    <div className="flex justify-between mt-3 text-muted-foreground text-sm">
      <Skeleton className="h-5 w-20 rounded" />
      <Skeleton className="h-5 w-20 rounded" />
      <Skeleton className="h-5 w-20 rounded" />
      <Skeleton className="h-5 w-20 rounded" />
    </div>
  </div>
);


