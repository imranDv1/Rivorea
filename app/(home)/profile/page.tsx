"use client";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import prisma from "@/lib/db";
import React from "react";

const ProfilePage = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;



  return (
    <div className="w-full lg:w-[60%] h-screen ">
      <Card className="h-screen bg-[#111]">
        <CardHeader>
          <div className="w-full bg-[#333] h-36 rounded-2xl">

          </div>
        </CardHeader>
        <CardDescription>
          
        </CardDescription>
      </Card>
    </div>
  );
};

export default ProfilePage;
