import { readContract, writeContract } from "wagmi/actions";
import CrediNewsABI from "./CredinewsABI.json";
import { config } from "./config";

const CONTRACT_ADDRESS = "0x0359A27dDe22dBa7805F2B3fD3f04709162d34e9";

export interface Post {
  id: bigint;
  author: string;
  title: string;
  contentHash: string;
  weightedVotes: bigint;
  timestamp: bigint;
  exists: boolean;
}

export interface Vote {
  hasVoted: boolean;
  isUpvote: boolean;
  weight: bigint;
}

export interface UserProfile {
  reputation: bigint;
  postsCount: bigint;
  lastPostTime: bigint;
}

export const contractConfig = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: CrediNewsABI,
} as const;

export async function getPosts(
  offset: number,
  limit: number
): Promise<{ posts: Post[]; total: bigint }> {
  try {
    const result = (await readContract(config, {
      ...contractConfig,
      functionName: "getPosts",
      args: [BigInt(offset), BigInt(limit)],
    })) as [Post[], bigint];

    return { posts: result[0], total: result[1] };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

export async function getTrendingPosts(
  offset: number,
  limit: number
): Promise<Post[]> {
  try {
    return (await readContract(config, {
      ...contractConfig,
      functionName: "getTrendingPosts",
      args: [BigInt(offset), BigInt(limit)],
    })) as Post[];
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    throw error;
  }
}

export async function getFollowedPosts(
  offset: number,
  limit: number
): Promise<{ posts: Post[]; total: bigint }> {
  try {
    const result = (await readContract(config, {
      ...contractConfig,
      functionName: "getFollowedPosts",
      args: [BigInt(offset), BigInt(limit)],
    })) as [Post[], bigint];

    return { posts: result[0], total: result[1] };
  } catch (error) {
    console.error("Error fetching followed posts:", error);
    throw error;
  }
}

export async function votePost(postId: bigint, isUpvote: boolean) {
  try {
    await writeContract(config, {
      ...contractConfig,
      functionName: "votePost",
      args: [postId, isUpvote],
    });
  } catch (error) {
    console.error("Error voting on post:", error);
    throw error;
  }
}

export async function getUserProfile(address: string): Promise<UserProfile> {
  try {
    const result = (await readContract(config, {
      ...contractConfig,
      functionName: "userProfiles",
      args: [address],
    })) as [bigint, bigint, bigint];

    // Convert the result to our UserProfile type
    return {
      reputation: result[0],
      postsCount: result[1],
      lastPostTime: result[2],
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

export async function getPostsByUser(address: string): Promise<Post[]> {
  try {
    return (await readContract(config, {
      ...contractConfig,
      functionName: "getPostsByUser",
      args: [address],
    })) as Post[];
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}

export async function followUser(userToFollow: string) {
  try {
    await writeContract(config, {
      ...contractConfig,
      functionName: "followUser",
      args: [userToFollow],
    });
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
}

export async function unfollowUser(userToUnfollow: string) {
  try {
    await writeContract(config, {
      ...contractConfig,
      functionName: "unfollowUser",
      args: [userToUnfollow],
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
}

export async function getFollowing(address: string): Promise<string[]> {
  try {
    return (await readContract(config, {
      ...contractConfig,
      functionName: "getFollowing",
      args: [address],
    })) as string[];
  } catch (error) {
    console.error("Error getting following list:", error);
    throw error;
  }
}

export async function isFollowing(
  follower: string,
  followed: string
): Promise<boolean> {
  try {
    return (await readContract(config, {
      ...contractConfig,
      functionName: "isFollowing",
      args: [follower, followed],
    })) as boolean;
  } catch (error) {
    console.error("Error checking following status:", error);
    throw error;
  }
}

export async function createPost(title: string, contentHash: string) {
  try {
    await writeContract(config, {
      ...contractConfig,
      functionName: "createPost",
      args: [title, contentHash],
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}
