"use client";

import { useEffect, useState } from "react";
import { getPosts } from "@/lib/contract";
import type { Post } from "@/lib/contract";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const POSTS_PER_PAGE = 10;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { posts: newPosts, total: newTotal } = await getPosts(
        offset,
        POSTS_PER_PAGE
      );
      setPosts((prev) => [...prev, ...newPosts]);
      setTotal(newTotal);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
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
        <h1 className="text-2xl font-bold">Latest Posts</h1>
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
          No posts found
        </div>
      )}
    </main>
  );
}
