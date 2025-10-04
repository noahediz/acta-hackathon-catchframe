'use client'
import React from 'react'
import { ThemedLogo } from './themed-logo'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { ProfileDialog } from "./profile-dialog"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Button } from './ui/button'
import { ChevronUp, LogOut, Monitor, Moon, Sun, User } from "lucide-react"

function getInitials(name?: string | null): string {
  if (!name) return "";
    const parts = name.trim().split(" ");
    const first = parts[0]?.charAt(0).toUpperCase() ?? "";
    const last = parts[parts.length - 1]?.charAt(0).toUpperCase() ?? "";
    return first + last;
  }

const Header = () => {
  const { data: session } = useSession()
  const initials = getInitials(session?.user?.name);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState<boolean>(false)
  const { setTheme } = useTheme()

  return (
    <div className='w-full py-4 px-6 border-b flex justify-between items-center'>
      <ThemedLogo width={120}/>
      
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Avatar className="size-6 rounded-md">
                        <AvatarImage src={session?.user?.image || ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {session?.user?.name}
                    <ChevronUp className="ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-40 mr-4"
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className='relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0'>
                      <Sun className="mr-1 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute mr-1 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className='text-sm'>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className={cn(
                            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",                          
                          )}>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-1 h-4 w-4" />
                        <span>Light</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-1 h-4 w-4" />
                        <span>Dark</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="mr-1 h-4 w-4" />
                        <span>System</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => setIsProfileDialogOpen(!isProfileDialogOpen)}>
                    <User className="mr-1 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-1 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
                <ProfileDialog 
                    isOpen={isProfileDialogOpen}
                    onClose={() => setIsProfileDialogOpen(!isProfileDialogOpen)}
                />
              </DropdownMenu>

    </div>
  )
}

export default Header