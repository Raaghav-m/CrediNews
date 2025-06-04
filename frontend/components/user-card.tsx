"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Award } from "lucide-react";
import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/contract";
import { useToast } from "./ui/use-toast";
import { UserHoverCard } from "@/components/user-hover-card";

interface UserCardProps {
  address: string;
  isFollowing: boolean;
  reputation?: number;
  onFollowChange?: () => void;
}

export function UserCard({
  address,
  isFollowing,
  reputation = 0,
  onFollowChange,
}: UserCardProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFollowToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(address);
      } else {
        await followUser(address);
      }
      setFollowing(!following);
      onFollowChange?.();
      toast({
        title: "Success",
        description: `Successfully ${
          following ? "unfollowed" : "followed"
        } user`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${following ? "unfollow" : "follow"} user`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <UserHoverCard address={address}>
                <p className="font-mono text-sm cursor-pointer">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </p>
              </UserHoverCard>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Award className="w-4 h-4 text-orange-500" />
                <span>{reputation} Rep</span>
              </div>
            </div>
          </div>
          <Button
            variant={following ? "outline" : "default"}
            onClick={handleFollowToggle}
            disabled={loading}
          >
            {loading ? "Loading..." : following ? "Unfollow" : "Follow"}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
