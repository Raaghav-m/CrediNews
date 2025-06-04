"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, TrendingUp, PlusCircle, User, Rss } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

export function AppSidebar() {
  const { address } = useAccount();

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Trending",
      url: "/trending",
      icon: TrendingUp,
    },
    {
      title: "Following",
      url: "/following",
      icon: Rss,
    },
    {
      title: "Create Post",
      url: "/create",
      icon: PlusCircle,
    },
    {
      title: "Profile",
      url: address ? `/profile/${address}` : "/profile",
      icon: User,
      disabled: !address,
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
          <span className="font-bold text-lg">CrediNews</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild disabled={item.disabled}>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">Powered by Ethereum</div>
      </SidebarFooter>
    </Sidebar>
  );
}
