"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Repeat2, User } from "lucide-react";
import Image from "next/image";
import { BsThreeDots } from "react-icons/bs";

export default function Home() {
  return (
    <div className="flex  h-screen overflow-scroll scrollbar-hide  p-4">
      <Tabs className="items-start w-full" defaultValue="tab-1">
        <TabsList className="w-full flex justify-between">
          <TabsTrigger className="flex-1" value="tab-1">
            For you
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="tab-2">
            Following
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1" className="w-full">
          <div className=" w-full flex flex-col gap-4 mt-4">
            <div className=" w-full rounded-xl p-4 bg-background border">
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-2 w-full">
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <Image
                    src="/me.png"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate leading-tight max-w-[120px] sm:max-w-[170px]">
                      imran
                    </span>
                    <span className="text-muted-foreground text-xs truncate leading-tight max-w-[170px] sm:max-w-[210px]">
                      @imran
                    </span>
                  </div>
                </div>
                <div className="ml-2 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer">
                      <BsThreeDots />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-base text-foreground mb-3">new post <span className="text-blue-500">#test</span></p>

              <div className="w-full  overflow-hidden">
                <Image
                  src="/post1.jpg"
                  alt="image"
                  width={800}
                  height={800}
                  className="w-full h-screen max-h-104 object-cover"
                />
              </div>

              <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <User className="size-4" />
                  34
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <MessageCircle className="size-4" />
                  74
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <Heart className={`size-4 `} />4
                </Button>
                <span className="flex items-center gap-1">
                  <Repeat2 className="size-4" />
                  73
                </span>
              </div>
            </div>

                <div className=" w-full rounded-xl p-4 bg-background border">
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-2 w-full">
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <Image
                    src="/me.png"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate leading-tight max-w-[120px] sm:max-w-[170px]">
                      imran
                    </span>
                    <span className="text-muted-foreground text-xs truncate leading-tight max-w-[170px] sm:max-w-[210px]">
                      @imran
                    </span>
                  </div>
                </div>
                <div className="ml-2 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer">
                      <BsThreeDots />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-base text-foreground mb-3">new post <span className="text-blue-500">#test</span></p>

              <div className="w-full  overflow-hidden">
                <Image
                  src="/post3.jpg"
                  alt="image"
                  width={800}
                  height={800}
                  className="w-full h-screen max-h-104 object-cover"
                />
              </div>

              <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <User className="size-4" />
                  34
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <MessageCircle className="size-4" />
                  74
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <Heart className={`size-4 `} />4
                </Button>
                <span className="flex items-center gap-1">
                  <Repeat2 className="size-4" />
                  73
                </span>
              </div>
            </div>
                <div className=" w-full rounded-xl p-4 bg-background border">
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-2 w-full">
                <div className="flex items-center gap-3 min-w-0 w-full">
                  <Image
                    src="/me.png"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate leading-tight max-w-[120px] sm:max-w-[170px]">
                      imran
                    </span>
                    <span className="text-muted-foreground text-xs truncate leading-tight max-w-[170px] sm:max-w-[210px]">
                      @imran
                    </span>
                  </div>
                </div>
                <div className="ml-2 shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer">
                      <BsThreeDots />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-base text-foreground mb-3">new post <span className="text-blue-500">#test</span></p>

              <div className="w-full  overflow-hidden">
                <Image
                  src="/post2.jpg"
                  alt="image"
                  width={800}
                  height={800}
                  className="w-full h-screen max-h-104 object-cover"
                />
              </div>

              <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <User className="size-4" />
                  34
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <MessageCircle className="size-4" />
                  74
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center gap-1 hover:text-primary p-0 h-auto w-auto"
                >
                  <Heart className={`size-4 `} />4
                </Button>
                <span className="flex items-center gap-1">
                  <Repeat2 className="size-4" />
                  73
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tab-2">
          <div className=" w-full flex flex-col gap-4 mt-4"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
