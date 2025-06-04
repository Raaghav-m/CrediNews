"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  ExternalLink,
  User,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserHoverCard } from "@/components/user-hover-card";

// Mock post detail data
const mockPostDetail = {
  id: "1",
  title:
    "Breaking: New Ethereum upgrade shows promising scalability improvements",
  author: "0x1234567890123456789012345678901234567890",
  timestamp: Math.floor(Date.now() / 1000) - 3600,
  contentHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  upvotes: 45,
  downvotes: 3,
  weightedVotes: 42,
  userVote: null,
  content:
    "This is the full content of the post that would be stored on IPFS...",
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState(mockPostDetail);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(post.userVote);
  const [votes, setVotes] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    weighted: post.weightedVotes,
  });
  const router = useRouter();

  const handleVote = (isUpvote: boolean) => {
    if (userVote === (isUpvote ? "up" : "down")) return;

    const newVote = isUpvote ? "up" : "down";
    setUserVote(newVote);

    if (isUpvote) {
      setVotes((prev) => ({
        ...prev,
        upvotes: prev.upvotes + (userVote === "down" ? 2 : 1),
        downvotes: userVote === "down" ? prev.downvotes - 1 : prev.downvotes,
        weighted: prev.weighted + (userVote === "down" ? 2 : 1),
      }));
    } else {
      setVotes((prev) => ({
        ...prev,
        downvotes: prev.downvotes + (userVote === "up" ? 2 : 1),
        upvotes: userVote === "up" ? prev.upvotes - 1 : prev.upvotes,
        weighted: prev.weighted - (userVote === "up" ? 2 : 1),
      }));
    }

    // Mock API call - replace with actual votePost(postId, isUpvote)
    console.log(`Voting ${isUpvote ? "up" : "down"} on post ${params.id}`);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 h-10 w-10 ${
                  userVote === "up" ? "text-orange-500 bg-orange-50" : ""
                }`}
                onClick={() => handleVote(true)}
                disabled={userVote === "up"}
              >
                <ChevronUp className="w-5 h-5" />
              </Button>

              <span className="text-lg font-bold px-2">
                {votes.weighted > 0 ? `+${votes.weighted}` : votes.weighted}
              </span>

              <Button
                variant="ghost"
                size="sm"
                className={`p-2 h-10 w-10 ${
                  userVote === "down" ? "text-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => handleVote(false)}
                disabled={userVote === "down"}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <UserHoverCard address={post.author}>
                    <span className="hover:underline font-mono cursor-pointer">
                      {post.author.slice(0, 8)}...{post.author.slice(-6)}
                    </span>
                  </UserHoverCard>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">{votes.upvotes} upvotes</Badge>
                <Badge variant="outline">{votes.downvotes} downvotes</Badge>
                <Badge variant="secondary">Post ID: {params.id}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {post.contentHash && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Content</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">IPFS Content:</span>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://ipfs.io/ipfs/${post.contentHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View on IPFS
                    </a>
                  </Button>
                </div>
                <p className="text-sm font-mono break-all text-muted-foreground">
                  {post.contentHash}
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Voting Details</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {votes.upvotes}
                </div>
                <div className="text-sm text-muted-foreground">Upvotes</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {votes.downvotes}
                </div>
                <div className="text-sm text-muted-foreground">Downvotes</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {votes.weighted}
                </div>
                <div className="text-sm text-muted-foreground">
                  Weighted Score
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">About Weighted Voting</h4>
        <p className="text-sm text-muted-foreground">
          Votes are weighted based on user reputation. Higher reputation users
          have more influence on post rankings.
        </p>
      </div>
    </div>
  );
}
