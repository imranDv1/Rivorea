import { Metadata } from "next";
import prisma from "@/lib/db";

type Props = {
  params: Promise<{ postId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { postId } = resolvedParams;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true,
          },
        },
      },
    });

    if (!post) {
      return {
        title: "Post Not Found | Rivorea",
        description: "The post you're looking for doesn't exist.",
      };
    }

    const postContent = post.content
      ? post.content.length > 160
        ? post.content.substring(0, 160) + "..."
        : post.content
      : `Post by @${post.user.username || "user"}`;

    const title = `${post.user.name} (@${post.user.username || "user"}) on Rivorea`;
    const description = postContent;
    const image =
      post.mediaUrl.length > 0
        ? post.mediaUrl[0]
        : post.user.image || undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: image
          ? [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: postContent,
              },
            ]
          : [],
        siteName: "Rivorea",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : [],
        creator: `@${post.user.username || "user"}`,
      },
      other: {
        "article:author": post.user.name,
        "article:published_time": post.createdAt.toISOString(),
        "article:section": "Social Media",
        "article:tag": post.user.username || "",
        "og:likes": post._count.likes.toString(),
        "og:views": post._count.views.toString(),
        "og:comments": post._count.comments.toString(),
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Post | Rivorea",
      description: "View this post on Rivorea",
    };
  }
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
