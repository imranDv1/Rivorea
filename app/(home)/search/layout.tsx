"use client"
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { LogOut, Router } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

function Layout() {

    const router = useRouter()
    async function handleLogout(){
        await authClient.signOut()
        router.push("/login")
    }
  return (
       <div className="lg:hidden">
            <Button
              size="icon"
              className="
                bg-red-500 
                text-white 
                rounded-full 
                shadow-lg 
                fixed 
                z-1 
                bottom-[74px] 
                left-4
                lg:hidden 
                w-14 
                h-14 
                flex 
                items-center 
                justify-center 
                border-4 
                border-background 
                hover:bg-blue-600
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-600
                "
              aria-label="Create post"
              onClick={handleLogout}
            >
              <LogOut className="w-8 h-8" />
            </Button>
          </div>
  )
}

export default Layout