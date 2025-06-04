"use client";

import { useEffect, useState } from "react";
import { getTrendingPosts } from "@/lib/contract";
import type { Post } from "@/lib/contract";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const POSTS_PER_PAGE = 10;

export default function TrendingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const newPosts = await getTrendingPosts(offset, POSTS_PER_PAGE);
      setPosts((prev) => [...prev, ...newPosts]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch trending posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setOffset((prev) => prev + POSTS_PER_PAGE);
  };

  const refreshPosts = async () => {
    setPosts([]);
    setOffset(0);
    await fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [offset]);

  return (
    <main className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Trending Posts</h1>
        <Button onClick={refreshPosts} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={String(post.id)} post={post} onVote={refreshPosts} />
        ))}
      </div>

      {posts.length > 0 && posts.length % POSTS_PER_PAGE === 0 && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center text-muted-foreground py-8">
          No trending posts found
        </div>
      )}
    </main>
  );
}
