"use client";

import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { User, Award, FileText } from "lucide-react";
import { graphiteService } from "@/lib/graphite";
import { getPostsByUser } from "@/lib/contract";
import Link from "next/link";

interface UserHoverCardProps {
  address: string;
  children: React.ReactNode;
}

export function UserHoverCard({ address, children }: UserHoverCardProps) {
  const [reputation, setReputation] = useState<number>(0);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const [rep, posts] = await Promise.all([
        graphiteService.getReputation(address),
        getPostsByUser(address),
      ]);
      setReputation(rep);
      setPostsCount(posts.length);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setReputation(0);
      setPostsCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Reset states when address changes
  useEffect(() => {
    setReputation(0);
    setPostsCount(0);
    setLoading(true);
    fetchUserData();
  }, [address]); // Add address as dependency

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">User Profile</h4>
              <p className="text-xs text-muted-foreground break-all">
                {address}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">
              {loading ? "..." : reputation} Rep
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">
              {loading ? "..." : postsCount} Posts
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/profile/${address}`}>View Profile</Link>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
