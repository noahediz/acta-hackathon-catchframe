'use client'
import { ChevronUp, Home, Inbox, Workflow } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemedLogo } from "./themed-logo"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ProfileDialog } from "./profile-dialog"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: Workflow,
  }
]

function getInitials(name?: string | null): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const first = parts[0]?.charAt(0).toUpperCase() ?? "";
  const last = parts[parts.length - 1]?.charAt(0).toUpperCase() ?? "";
  return first + last;
}

export function AppSidebar() {
    const { data: session } = useSession()
    const initials = getInitials(session?.user?.name);
    const pathname = usePathname()
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState<boolean>(false)

  return (
    <Sidebar collapsible='icon'>
        <SidebarHeader className="p-4">
            <ThemedLogo width={110}/>
        </SidebarHeader>
        <SidebarContent>
        <SidebarGroup>
            <SidebarGroupContent>
            <SidebarMenu>
                {items.map((item) => (
                <SidebarMenuItem key={item.title} >
                    <SidebarMenuButton asChild className={pathname === item.url ? 'font-medium bg-white dark:bg-black' : ''}>
                    <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                    </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="size-6 rounded-md">
                        <AvatarImage src={session?.user?.image || ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {session?.user?.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsProfileDialogOpen(!isProfileDialogOpen)}>
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
                <ProfileDialog 
                    isOpen={isProfileDialogOpen}
                    onClose={() => setIsProfileDialogOpen(!isProfileDialogOpen)}
                />
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}