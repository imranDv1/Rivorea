"use client";
import React, { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import SignOutButton from "@/components/ui/signOut";
import { UserDropdown } from "@/components/UserDropdown";
import { authClient } from "@/lib/auth-client";
import {
  Bell,
  Bookmark,
  HomeIcon,
  Mail,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const sections = [
  {
    id: 1,
    name: "Home",
    icon: HomeIcon,
    href: "/",
  },
  {
    id: 2,
    name: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    id: 3,
    name: "Search",
    icon: Search,
    href: "/search",
  },
  {
    id: 4,
    name: "Notification",
    icon: Bell,
    href: "/notification",
  },
  {
    id: 5,
    name: "Messages",
    icon: Mail,
    href: "/messages",
  },
  {
    id: 6,
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    id: 7,
    name: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
];

const mobileNavBar = [
  {
    id: 1,
    name: "Home",
    icon: HomeIcon,
    href: "/",
  },
  {
    id: 2,
    name: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    id: 3,
    name: "Search",
    icon: Search,
    href: "/search",
  },
  {
    id: 4,
    name: "Notification",
    icon: Bell,
    href: "/notification",
  },
  {
    id: 5,
    name: "Messages",
    icon: Mail,
    href: "/messages",
  },
];
const layout = ({ children }: { children: ReactNode }) => {
  const { data: sessiom } = authClient.useSession();

  return (
    <div className="w-full h-full lg:p-4 flex lg:gap-4 relative">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex flex-col">
        <Card className="w-max h-max bg-[#111]">
          <CardContent className="flex flex-col gap-6">
            {sections.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 hover:bg-[#222] rounded-2xl p-2"
              >
                <Link href={item.href} className="flex items-center gap-4">
                  <item.icon className="size-6" />
                  <span className="text-2xl font-semibold ">{item.name}</span>
                </Link>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button className="w-full">Post</Button>
          </CardFooter>
        </Card>
        {/* user info */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Card className="w-[200px] mt-4 bg-transparent border-0  flex items-center ">
              <CardContent className="flex items-center justify-between gap-9">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={(sessiom?.user.image as string) || ""}
                      alt="Profile image"
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {(sessiom?.user.name?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col ">
                    <h1>{sessiom?.user.name}</h1>
                    <h1 className="text-sm text-muted-foreground">
                      @{sessiom?.user.username}
                    </h1>
                  </div>
                </div>

                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="19" cy="12" r="2" fill="currentColor" />
                </svg>
              </CardContent>
            </Card>

            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>

      {/* Main content */}
      <div className="flex-1">{children}</div>

      {/* Mobile navbar - fixed at bottom */}
      <div className="lg:hidden">
        <div className="fixed bottom-0 left-0 w-full z-50 flex bg-[#111] items-center justify-between gap-4 px-6 py-4 border-t border-[#222]">
          {mobileNavBar.map((item) => (
            <div key={item.id} className="flex-1 flex justify-center">
              <Link href={item.href} className="flex flex-col items-center">
                <item.icon className="size-6" />
                {/* Optionally display labels on mobile:
                <span className="text-xs mt-1">{item.name}</span> */}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default layout;
