"use client";

import { useEffect, useState } from "react";
import {
  getFollowedPosts,
  getTrendingPosts,
  getFollowing,
  getUserProfile,
} from "@/lib/contract";
import type { Post, UserProfile } from "@/lib/contract";
import { PostCard } from "@/components/post-card";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAccount } from "wagmi";

const POSTS_PER_PAGE = 10;

export default function FollowingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<
    { address: string; profile: UserProfile }[]
  >([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const { toast } = useToast();

  const fetchFollowing = async () => {
    if (!address) return;
    try {
      const followingList = await getFollowing(address);
      setFollowing(followingList);
      return followingList;
    } catch (error) {
      console.error("Error fetching following list:", error);
      return [];
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { posts: newPosts, total: newTotal } = await getFollowedPosts(
        offset,
        POSTS_PER_PAGE
      );
      if (offset === 0) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setTotal(newTotal);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch followed posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async (followingList: string[]) => {
    try {
      const trendingPosts = await getTrendingPosts(0, 20);
      const uniqueAuthors = [
        ...new Set(trendingPosts.map((post) => post.author)),
      ]
        .filter(
          (author) => author !== address && !followingList.includes(author)
        )
        .slice(0, 5);

      const profiles = await Promise.all(
        uniqueAuthors.map(async (author) => ({
          address: author,
          profile: await getUserProfile(author),
        }))
      );

      setSuggestedUsers(
        profiles.sort((a, b) =>
          Number(b.profile.reputation - a.profile.reputation)
        )
      );
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + POSTS_PER_PAGE);
  };

  const refreshPosts = async () => {
    setOffset(0);
    await fetchPosts();
  };

  const handleFollowChange = async () => {
    const newFollowingList = await fetchFollowing();
    if (newFollowingList && newFollowingList.length > 0) {
      setOffset(0);
      await fetchPosts();
    } else {
      await fetchSuggestedUsers(newFollowingList || []);
    }
  };

  useEffect(() => {
    const init = async () => {
      const followingList = await fetchFollowing();
      if (!followingList || followingList.length === 0) {
        await fetchSuggestedUsers(followingList || []);
      } else {
        await fetchPosts();
      }
    };
    init();
  }, [address]);

  useEffect(() => {
    if (following.length > 0 && offset > 0) {
      fetchPosts();
    }
  }, [offset]);

  if (!address) {
    return (
      <div className="container max-w-4xl py-8 text-center text-muted-foreground">
        Please connect your wallet to see followed posts
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <main className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold mb-8">Suggested Users to Follow</h1>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <UserCard
              key={user.address}
              address={user.address}
              isFollowing={false}
              reputation={Number(user.profile.reputation)}
              onFollowChange={handleFollowChange}
            />
          ))}
          {suggestedUsers.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              No suggestions available
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Following Feed</h1>
        <Button onClick={refreshPosts} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={String(post.id)} post={post} onVote={refreshPosts} />
        ))}
      </div>

      {posts.length > 0 && BigInt(offset + POSTS_PER_PAGE) < total && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center text-muted-foreground py-8">
          No posts from followed users
        </div>
      )}
    </main>
  );
}
