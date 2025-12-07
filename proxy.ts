import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function proxy(request: NextRequest) {
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // If user is logged in, prevent access to login or sign-up pages
  if (session && (pathname === "/login" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in, protect these routes
  const protectedRoutes = ["/", "/profile", "/search", "/notification", "/messages", "/settings", "/bookmarks"];
  const isPostRoute = pathname.startsWith("/post/");
  if (!session && (protectedRoutes.includes(pathname) || isPostRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", 
    "/profile", 
    "/search", 
    "/notification", 
    "/messages", 
    "/settings", 
    "/bookmarks", 
    "/login", 
    "/sign-up"
  ],
};
