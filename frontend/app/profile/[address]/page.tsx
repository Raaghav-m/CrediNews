"use client";

import { useEffect, useState } from "react";
import {
  getPostsByUser,
  getUserProfile,
  getFollowing,
  isFollowing,
  followUser,
  unfollowUser,
} from "@/lib/contract";
import { graphiteService } from "@/lib/graphite";
import type { Post, UserProfile } from "@/lib/contract";
import { PostCard } from "@/components/post-card";
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  Users,
  FileText,
  Award,
  UserPlus,
  UserMinus,
  ArrowLeft,
} from "lucide-react";
import { UserHoverCard } from "@/components/user-hover-card";

export default function ProfilePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [isUserFollowing, setIsUserFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reputation, setReputation] = useState<number>(0);
  const [isSDKConnected, setIsSDKConnected] = useState(false);
  const { address: currentAddress } = useAccount();
  const { address } = useParams();
  const { toast } = useToast();
  const router = useRouter();

  const checkSDKConnection = async () => {
    try {
      const sdkAddress = graphiteService.getAddress();
      setIsSDKConnected(!!sdkAddress);
      if (sdkAddress) {
        await fetchReputation();
      }
    } catch (error) {
      console.error("Error checking SDK connection:", error);
    }
  };

  const fetchReputation = async () => {
    if (!address) return;
    try {
      const rep = await graphiteService.getReputation(address as string);
      setReputation(rep);
    } catch (error) {
      console.error("Error fetching reputation:", error);
    }
  };

  const fetchProfile = async () => {
    if (!address) return;
    try {
      const userProfile = await getUserProfile(address as string);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    if (!address) return;
    try {
      const userPosts = await getPostsByUser(address as string);
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user posts",
        variant: "destructive",
      });
    }
  };

  const fetchFollowing = async () => {
    if (!address) return;
    try {
      const followingList = await getFollowing(address as string);
      setFollowing(followingList);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const checkFollowingStatus = async () => {
    if (!currentAddress || !address || currentAddress === address) return;
    try {
      const following = await isFollowing(currentAddress, address as string);
      setIsUserFollowing(following);
    } catch (error) {
      console.error("Error checking following status:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentAddress || !address) return;
    try {
      if (isUserFollowing) {
        await unfollowUser(address as string);
      } else {
        await followUser(address as string);
      }
      await refreshProfile();
      toast({
        title: "Success",
        description: `Successfully ${
          isUserFollowing ? "unfollowed" : "followed"
        } user`,
      });
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          isUserFollowing ? "unfollow" : "follow"
        } user`,
        variant: "destructive",
      });
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchPosts(),
      fetchFollowing(),
      checkFollowingStatus(),
      fetchReputation(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshProfile();
  }, [address, currentAddress]);

  useEffect(() => {
    const checkConnection = async () => {
      await checkSDKConnection();
    };
    checkConnection();

    // Set up an interval to check SDK connection status
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!address) {
    return (
      <div className="container max-w-4xl py-8 text-center text-muted-foreground">
        Invalid profile address
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="container max-w-4xl py-8 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const isOwnProfile = currentAddress === address;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">User Profile</h1>
                <p className="font-mono text-sm text-muted-foreground break-all">
                  {address}
                </p>
              </div>
            </div>

            {!isOwnProfile && (
              <Button
                onClick={handleFollowToggle}
                variant={isUserFollowing ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                {isUserFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="text-2xl font-bold">{reputation}</span>
              </div>
              <p className="text-sm text-muted-foreground">Reputation</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-2xl font-bold">{posts.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold">{followers.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <User className="w-4 h-4 text-purple-500" />
                <span className="text-2xl font-bold">{following.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Last Active:</span>
              <Badge variant="outline">
                {new Date(
                  Number(profile.lastPostTime) * 1000
                ).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="followers">
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({following.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={String(post.id)}
                post={post}
                onVote={refreshProfile}
              />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't" : "This user hasn't"} created
                  any posts yet
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Followers list will be implemented soon
            </p>
          </div>
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <div className="space-y-4">
            {following.map((followedAddress) => (
              <div
                key={followedAddress}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <UserHoverCard address={followedAddress}>
                      <p className="font-mono text-sm break-all">
                        {followedAddress}
                      </p>
                    </UserHoverCard>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/profile/${followedAddress}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
            {following.length === 0 && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You aren't" : "This user isn't"} following
                  anyone yet
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
