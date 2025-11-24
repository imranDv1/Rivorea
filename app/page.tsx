"use client"
import SignOutButton from "@/components/ui/signOut";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";


export default function Home() {
const {data:sessiom } = authClient.useSession()
  return (
  <div className="flex h-screen items-center flex-col justify-center gap-2">
  <SignOutButton/>

<h1>{sessiom?.user.username}</h1>
<h1>{sessiom?.user.email}</h1>
  </div>
  );
}
