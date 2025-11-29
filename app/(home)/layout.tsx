"use client";
import React, { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignOutButton from "@/components/ui/signOut";
import { UserDropdown } from "@/components/UserDropdown";
import { authClient } from "@/lib/auth-client";
import {
  Bell,
  Bookmark,
  HomeIcon,
  LogOut,
  Mail,
  Menu,
  Search,
  SearchIcon,
  Settings,
  User,
  UserPlus,
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
import { redirect } from "next/navigation";
import { useUser } from "@/hooks/user";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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

const fakeUsers = [
  {
    id: 1,
    name: "John Doe",
    username: "john doe",
    avatar: "https://github.com/shadcn.png",
    verified: true,
  },
  {
    id: 2,
    name: "Jane Doe",
    username: "jane doe",
    avatar: "https://github.com/shadcn.png",
    verified: true,
  },
  {
    id: 3,
    name: "Jim Doe",
    username: "jim doe",
    avatar: "https://github.com/shadcn.png",
    verified: false,
  },
  {
    id: 4,
    name: "Jill Doe",
    username: "jill doe",
    avatar: "https://github.com/shadcn.png",
    verified: true,
  },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { isPending, user } = useUser();

  // Use isPending to handle loading state

  if (!user) {
    console.log("user not found");
  }

  function handleLogout() {
    authClient.signOut();
    redirect("/login");
  }

  return (
    <div className="w-full h-full lg:p-4 flex lg:gap-4 relative">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex flex-col">
        <Card className="w-max h-max ">
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
        {isPending ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Card className="w-[200px] mt-4 bg-transparent border-0  flex items-center ">
                <CardContent className="flex items-center justify-between gap-6 sm:gap-9 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                      <AvatarImage
                        src={(user?.image as string) || ""}
                        alt="Profile image"
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {(user?.name?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 items-start">
                      <h1 className="truncate text-base sm:text-lg font-medium">{user?.name ? user.name.split(" ")[0] : "User"}</h1>
                      <h1 className="text-xs sm:text-sm text-muted-foreground truncate">
                        @{user?.username ?? "unknown"}
                      </h1>
                    </div>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="ml-auto flex-shrink-0"
                  >
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                  </svg>
                </CardContent>
              </Card>

              <DropdownMenuContent>
                <DropdownMenuLabel onClick={handleLogout}>
                  Logout
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuTrigger>
          </DropdownMenu>
        )}
      </div>

      {/* Main content */}
      <div className="lg:w-[50%] w-full">{children}</div>
      {/* left */}
      <div className=" w-[30%] hidden lg:block">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        {/* user to follow */}
        <Card className="mt-5 h-max">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">You might like</CardTitle>
          </CardHeader>
          <CardContent>
            {fakeUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-2 py-3 hover:bg-muted/40 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10   shadow-md">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-base text-white">
                        {user.name}
                      </span>
                      {user.verified && (
                        <span className="ml-1 text-blue-500" title="Verified">
                          <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 0l2.392 3.74 4.099-.197-.755 4.002L20 10.214l-4.264 2.099.227 4.086-3.972-.812L10 20l-2.002-4.413-3.972.812.227-4.086L0 10.214l4.264-2.669-.755-4.002 4.099.197zM8.293 13.707l6-6-1.414-1.414L8 10.586l-1.293-1.293-1.414 1.414 2 2a1 1 0 001.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground block">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <Button variant="default" size="sm">
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Trending topics for desktop */}
        <Card className="mt-5 h-max">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Trending topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex  flex-col gap-2">
                <h1 className="text-sm text-muted-foreground">
                  Trending in Somalia
                </h1>
                <span className="">Trending topic 1</span>
              </div>
              <div className="flex  flex-col gap-2">
                <h1 className="text-sm text-muted-foreground">
                  Trending in Somalia
                </h1>
                <span className="">Trending topic 1</span>
              </div>
              <div className="flex  flex-col gap-2">
                <h1 className="text-sm text-muted-foreground">
                  Trending in Somalia
                </h1>
                <span className="">Trending topic 1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Layout;
