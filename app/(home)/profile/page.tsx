"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { HiCheckBadge } from "react-icons/hi2";
import { authClient } from "@/lib/auth-client";
import prisma from "@/lib/db";
import Image from "next/image";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Repeat2, User } from "lucide-react";
const ProfilePage = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  return (
    <div className="w-full lg:w-[60%] h-screen ">
      <Card className="h-screen overflow-y-scroll bg-[#111] scrollbar-hide">
        <CardHeader className="relative">
          <Image
            src="/bg full.png"
            alt="Banner image"
            width={900}
            height={180}
            className="w-full h-36 object-cover bg-[#333]"
            priority
          />

          <div className="absolute -bottom-18 left-4 lg:left-8 flex items-center">
            <Image
              src="/me.png"
              alt="Profile image"
              width={140}
              height={140}
              className="rounded-full border-4 border-[#111] object-cover w-[120px] h-[120px] shadow-lg"
              priority
            />
          </div>

          <div className=" absolute -bottom-15 left-37 lg:left-40">
            <h1 className="text-[20px] flex items-center gap-2 font-semibold text-white">imran <HiCheckBadge className="text-blue-500" /></h1>
            <h1 className="text-[18px] text-muted-foreground">@imran</h1>
          </div>
          <Button
            variant="outline"
            className="absolute right-8 -bottom-9 rounded-4xl"
          >
            Edit Profile
          </Button>
        </CardHeader>
        <CardDescription className="mt-17 w-[90%] mx-auto">
          <p className="text-[19px] text-primary">
            Imran Ahmed Full Stack Web Developer | Software Engineering Student
            | Passionate about Learning and Building Scalable Solutions
          </p>

          <div className="flex items-center gap-5 mt-5">
            <h1>
              <span className="text-primary mr-1 font-semibold">13</span>
              Following
            </h1>
            <h1>
              <span className="text-primary mr-1 font-semibold">73,939</span>
              Followers
            </h1>
          </div>
        </CardDescription>
        <CardContent>
          <Tabs className="items-start w-full" defaultValue="tab-1">
            <TabsList className="w-full flex justify-between">
              <TabsTrigger className="flex-1" value="tab-1">Posts</TabsTrigger>
              <TabsTrigger className="flex-1" value="tab-2">Replies</TabsTrigger>
              <TabsTrigger className="flex-1" value="tab-3">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="tab-1">
              {/* Fake Posts Example including a video post */}
              <div className="flex flex-col gap-4 mt-4">
        
                {/* Post 2 with 4 images */}
                <div className="rounded-xl p-4 bg-background border">
                  <div className="flex items-center gap-3 mb-2">
                    <Image src="/me.png" alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold">Imraan</span>
                    <span className="text-muted-foreground">@imraan · 16m</span>
                  </div>
                  <p className="text-base text-foreground mb-3">
                    Just got back from the weekend trip! 🌄 Check out these scenes I captured 📸 <span className="text-blue-500">#TravelDiaries</span>
                  </p>
                  {/* 4 images in grid */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden mb-2">
                    <Image src="/post2.jpg" alt="Trip Photo 1" width={320} height={180} className="w-full h-52 object-cover" />
                    <Image src="/post3.jpg" alt="Trip Photo 2" width={320} height={180} className="w-full h-52 object-cover" />
                    <Image src="/post1.jpg" alt="Trip Photo 3" width={320} height={180} className="w-full h-52 object-cover" />
                    <Image src="/post4.png" alt="Trip Photo 4" width={320} height={180} className="w-full h-52 object-cover" />
                  </div>
                  <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <User className="size-4" />
                      36
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <MessageCircle className="size-4" />
                      12
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
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
                    <Image src="/me.png" alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold">Imraan</span>
                    <span className="text-muted-foreground">@imraan · 5m</span>
                  </div>
                  <p className="text-base text-foreground mb-3">
                    Had to share this quick timelapse of my latest coding session. Watch till the end! ⏳💻
                  </p>
                  <div className="rounded-lg overflow-hidden mb-2">
                    <video
                      controls
                      width="100%"
                      poster="/post2.jpg"
                      className="w-full max-h-96 rounded-lg object-cover bg-black"
                    >
                      <source src="/(2) imran - YouTube - Personal - Microsoft​ Edge 2025-11-13 16-03-25.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <User className="size-4" />
                      95
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <MessageCircle className="size-4" />
                      23
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
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
                    <Image src="/me.png" alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold">Imraan</span>
                    <span className="text-muted-foreground">@imraan · 1h</span>
                  </div>
                  <p className="text-base text-foreground">
                    Excited to share my new project launch! 🚀 Check it out and let me know your thoughts.
                  </p>
                  <div className="flex justify-between mt-4 text-muted-foreground text-sm">
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <User className="size-4" />
                      23
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <MessageCircle className="size-4" />
                      10
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
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
                    <Image src="/me.png" alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold">Imraan</span>
                    <span className="text-muted-foreground">@imraan · 3h</span>
                  </div>
                  <p className="text-base text-foreground">
                    Working on a full-stack app—TypeScript is such a joy to use!
                  </p>
                  <Image src="/post1.jpg" alt="sample post img" width={600} height={220} className="rounded-lg mt-3 w-full max-h-110 object-cover" />
                  <div className="flex justify-between mt-4 text-muted-foreground text-sm">
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <User className="size-4" />
                      19
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <MessageCircle className="size-4" />
                      4
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
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
                    <Image src="/me.png" alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full" />
                    <span className="font-semibold">Imraan</span>
                    <span className="text-muted-foreground">@imraan · 7h</span>
                  </div>
                  <p className="text-base text-foreground">
                    Web dev tip: Use flexbox or CSS grid to easily lay out any UI! 💡
                  </p>
                  <div className="flex justify-between mt-4 text-muted-foreground text-sm">
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <User className="size-4" />
                      7
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
                      <MessageCircle className="size-4" />
                      1
                    </Button>
                    <Button variant="ghost" size="icon" className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto">
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
    </div>
  );
};

export default ProfilePage;
