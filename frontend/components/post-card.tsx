"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/lib/contract";
import { votePost } from "@/lib/contract";
import { useToast } from "./ui/use-toast";
import { useState, useEffect } from "react";
import { UserHoverCard } from "@/components/user-hover-card";
import { ipfsService, type IPFSContent } from "@/lib/ipfs";
import { Skeleton } from "@/components/ui/skeleton";

interface PostCardProps {
  post: Post;
  onVote?: () => void;
}

export function PostCard({ post, onVote }: PostCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [content, setContent] = useState<IPFSContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await ipfsService.getContent(post.contentHash);
        console.log("Fetched IPFS content:", data);
        setContent(data);
      } catch (error) {
        console.error("Error fetching post content:", error);
        toast({
          title: "Error",
          description: "Failed to load post content",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [post.contentHash, toast]);

  const handleVote = async (isUpvote: boolean) => {
    if (isVoting) return;

    try {
      setIsVoting(true);
      await votePost(post.id, isUpvote);
      toast({
        title: "Success",
        description: `Successfully ${
          isUpvote ? "upvoted" : "downvoted"
        } the post`,
      });
      onVote?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote on post",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserHoverCard address={post.author}>
              <span className="text-sm font-mono cursor-pointer">
                {post.author.slice(0, 6)}...{post.author.slice(-4)}
              </span>
            </UserHoverCard>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(Number(post.timestamp) * 1000), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-semibold">{post.title}</h3>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : content ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Content not available
          </p>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(true)}
              disabled={isVoting}
            >
              <ArrowBigUp className="w-5 h-5" />
            </Button>
            <span>{Number(post.weightedVotes)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(false)}
              disabled={isVoting}
            >
              <ArrowBigDown className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comments
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
