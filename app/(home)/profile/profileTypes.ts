export type UserInfo = {
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

export type Post = {
  id: string;
  content: string | null;
  mediaUrl: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    likes: number;
    comments: number;
    views: number;
    reposts: number;
    bookmarks: number;
  };
  // Whether the currently logged-in user has liked this post
  likedByCurrentUser?: boolean;
};


