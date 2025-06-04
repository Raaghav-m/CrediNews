"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, Clock, AlertCircle, Upload, Tags } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { createPost } from "@/lib/contract";
import { useToast } from "@/components/ui/use-toast";
import { ipfsService } from "@/lib/ipfs";
import { graphiteService } from "@/lib/graphite";

const MIN_REPUTATION = 160;

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reputation, setReputation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { address } = useAccount();
  const { toast } = useToast();

  useEffect(() => {
    const checkReputation = async () => {
      try {
        const rep = await graphiteService.getReputation();
        console.log("Fetched reputation:", rep, "Type:", typeof rep);
        setReputation(rep);
      } catch (error) {
        console.error("Error fetching reputation:", error);
        toast({
          title: "Error",
          description: "Failed to fetch reputation score",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only check reputation if we have a connected wallet
    if (address) {
      checkReputation();
    } else {
      setIsLoading(false);
    }
  }, [address, toast]);

  useEffect(() => {
    console.log("Current reputation state:", {
      reputation,
      MIN_REPUTATION,
      isLessThan: reputation < MIN_REPUTATION,
      reputationType: typeof reputation,
      minReputationType: typeof MIN_REPUTATION,
    });
  }, [reputation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    const currentReputation = Number(reputation);
    console.log("Submit check - Current reputation:", currentReputation);

    if (currentReputation < MIN_REPUTATION) {
      const error = `You need at least ${MIN_REPUTATION} reputation points to create a post. Your current reputation is ${currentReputation}.`;
      console.log("Validation error:", error);
      setError(error);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Upload content to IPFS
      const ipfsContent = {
        name: title,
        description: content,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        postedBy: address,
        timestamp: new Date().toISOString(),
      };

      const contentHash = await ipfsService.uploadContent(ipfsContent);

      // Create post on-chain
      await createPost(title, contentHash);

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to create a post.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentReputation = Number(reputation);
  if (currentReputation < MIN_REPUTATION) {
    console.log("Render check - Blocking access:", {
      currentReputation,
      MIN_REPUTATION,
      comparison: currentReputation < MIN_REPUTATION,
    });
    return (
      <div className="container max-w-2xl py-8">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold">Create New Post</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need at least {MIN_REPUTATION} reputation points to create a
                post. Your current reputation is {currentReputation}.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center gap-3 mb-6">
        <PlusCircle className="w-6 h-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Create New Post</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Your News</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="Enter a compelling title for your post..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {title.length}/200 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your news article, analysis, or insights here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="min-h-[200px]"
                required
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.length} characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center gap-2">
                <Tags className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas (e.g., news, crypto, web3)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 animate-pulse" />
                    Uploading to IPFS...
                  </div>
                ) : (
                  "Create Post"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
