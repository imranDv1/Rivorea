"use client"

import { authClient } from "@/lib/auth-client";
import { Button } from "./button"
import { redirect } from "next/navigation";


  async function SignOut(){
    await authClient.signOut();
    redirect("/login")
  }

const SignOutButton = () => {
  return (  
    <Button onClick={SignOut}>Logout</Button>
  )
}

export default SignOutButton