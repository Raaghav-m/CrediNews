// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrediNews {
    address public owner;
    
    struct Post {
        uint256 id;
        address author;
        string title;
        string contentHash;
        int256 weightedVotes;
        uint256 timestamp;
        bool exists;
    }

    struct Vote {
        bool hasVoted;
        bool isUpvote;
        uint256 weight;
    }

    struct UserProfile {
        uint256 reputation;      // Increases with activity
        uint256 postsCount;      // Number of posts created
        uint256 lastPostTime;    // Timestamp of last post
    }

    // Events
    event PostCreated(uint256 indexed postId, address indexed author, string contentHash);
    event PostVoted(uint256 indexed postId, address indexed voter, bool isUpvote, uint256 weight);
    event Followed(address indexed follower, address indexed followed);
    event Unfollowed(address indexed follower, address indexed followed);

    // State variables
    uint256 private _currentPostId;
    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public userPosts;
    mapping(uint256 => mapping(address => Vote)) public userVotes;
    mapping(address => UserProfile) public userProfiles;
    
    // Following mappings
    mapping(address => address[]) public following;
    mapping(address => address[]) public followers;
    mapping(address => mapping(address => bool)) public isFollowing;

    // Constants for reputation
    uint256 public constant POST_REPUTATION = 10;
    uint256 public constant MIN_REPUTATION = 1;

    constructor() {
        owner = msg.sender;
    }

    function createPost(string memory title, string memory contentHash) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(contentHash).length > 0, "Content hash cannot be empty");
        require(block.timestamp >= userProfiles[msg.sender].lastPostTime, "Please wait before posting again");

        _currentPostId++;
        uint256 newPostId = _currentPostId;

        Post memory newPost = Post({
            id: newPostId,
            author: msg.sender,
            title: title,
            contentHash: contentHash,
            weightedVotes: 0,
            timestamp: block.timestamp,
            exists: true
        });

        posts[newPostId] = newPost;
        userPosts[msg.sender].push(newPostId);

        // Update user profile
        UserProfile storage profile = userProfiles[msg.sender];
        profile.postsCount++;
        profile.lastPostTime = block.timestamp;
        profile.reputation += POST_REPUTATION;

        emit PostCreated(newPostId, msg.sender, contentHash);
    }

    function votePost(uint256 postId, bool isUpvote) external {
        require(posts[postId].exists, "Post does not exist");
        require(!userVotes[postId][msg.sender].hasVoted, "Already voted on this post");
        require(posts[postId].author != msg.sender, "Cannot vote on own post");

        // Calculate vote weight based on reputation
        uint256 weight = getVoteWeight(msg.sender);

        if (isUpvote) {
            posts[postId].weightedVotes += int256(weight);
        } else {
            posts[postId].weightedVotes -= int256(weight);
        }

        userVotes[postId][msg.sender] = Vote({
            hasVoted: true,
            isUpvote: isUpvote,
            weight: weight
        });

        emit PostVoted(postId, msg.sender, isUpvote, weight);
    }

    function getVoteWeight(address user) public view returns (uint256) {
        UserProfile memory profile = userProfiles[user];
        // Base weight of 1 + additional weight based on reputation
        return MIN_REPUTATION + (profile.reputation / 100);
    }

    /**
     * @dev Get all posts by a specific user
     * @param user Address of the user
     * @return Post[] Array of posts by the user
     */
    function getPostsByUser(address user) external view returns (Post[] memory) {
        uint256[] memory userPostIds = userPosts[user];
        Post[] memory userPostsArray = new Post[](userPostIds.length);

        for (uint256 i = 0; i < userPostIds.length; i++) {
            userPostsArray[i] = posts[userPostIds[i]];
        }

        return userPostsArray;
    }

    /**
     * @dev Get a specific post by ID
     * @param postId The ID of the post to retrieve
     * @return Post The requested post
     */
    function getPost(uint256 postId) external view returns (Post memory) {
        require(posts[postId].exists, "Post does not exist");
        return posts[postId];
    }

    /**
     * @dev Get the total number of posts
     * @return uint256 The total number of posts
     */
    function getTotalPosts() external view returns (uint256) {
        return _currentPostId;
    }

    /**
     * @dev Get a user's vote on a specific post
     * @param postId The ID of the post
     * @param voter The address of the voter
     * @return Vote The vote information
     */
    function getUserVote(uint256 postId, address voter) external view returns (Vote memory) {
        return userVotes[postId][voter];
    }

    /**
     * @dev Get posts with pagination support
     * @param offset Starting index
     * @param limit Maximum number of posts to return
     * @return Post[] Array of posts
     * @return uint256 Total number of posts (for pagination)
     */
    function getPosts(uint256 offset, uint256 limit) external view returns (Post[] memory, uint256) {
        uint256 totalPosts = _currentPostId;
        
        // Check if offset is valid
        if (offset >= totalPosts) {
            return (new Post[](0), totalPosts);
        }

        // Calculate actual number of posts to return
        uint256 remaining = totalPosts - offset;
        uint256 count = remaining < limit ? remaining : limit;

        Post[] memory result = new Post[](count);
        
        // Fetch posts in reverse chronological order (newest first)
        for (uint256 i = 0; i < count; i++) {
            uint256 postId = totalPosts - offset - i;
            result[i] = posts[postId];
        }

        return (result, totalPosts);
    }

    /**
     * @dev Get posts sorted by weighted votes (trending posts)
     * @param offset Starting index
     * @param limit Maximum number of posts to return
     * @return Post[] Array of posts sorted by weighted votes
     */
    function getTrendingPosts(uint256 offset, uint256 limit) external view returns (Post[] memory) {
        if (_currentPostId == 0) {
            return new Post[](0);
        }

        // Create temporary array to sort
        Post[] memory allPosts = new Post[](_currentPostId);
        uint256 validPosts = 0;

        // Get all valid posts
        for (uint256 i = 1; i <= _currentPostId; i++) {
            if (posts[i].exists) {
                allPosts[validPosts] = posts[i];
                validPosts++;
            }
        }

        // Sort posts by weighted votes (simple bubble sort)
        for (uint256 i = 0; i < validPosts - 1; i++) {
            for (uint256 j = 0; j < validPosts - i - 1; j++) {
                if (allPosts[j].weightedVotes < allPosts[j + 1].weightedVotes) {
                    Post memory temp = allPosts[j];
                    allPosts[j] = allPosts[j + 1];
                    allPosts[j + 1] = temp;
                }
            }
        }

        // Apply pagination
        uint256 start = offset < validPosts ? offset : validPosts;
        uint256 end = start + limit < validPosts ? start + limit : validPosts;
        uint256 resultLength = end - start;

        Post[] memory result = new Post[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allPosts[start + i];
        }

        return result;
    }

    /**
     * @dev Follow a user/channel
     * @param userToFollow Address of the user to follow
     */
    function followUser(address userToFollow) external {
        require(userToFollow != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][userToFollow], "Already following this user");
        require(userToFollow != address(0), "Invalid address");

        following[msg.sender].push(userToFollow);
        followers[userToFollow].push(msg.sender);
        isFollowing[msg.sender][userToFollow] = true;

        emit Followed(msg.sender, userToFollow);
    }

    /**
     * @dev Unfollow a user/channel
     * @param userToUnfollow Address of the user to unfollow
     */
    function unfollowUser(address userToUnfollow) external {
        require(isFollowing[msg.sender][userToUnfollow], "Not following this user");

        // Remove from following array
        address[] storage followingList = following[msg.sender];
        for (uint256 i = 0; i < followingList.length; i++) {
            if (followingList[i] == userToUnfollow) {
                followingList[i] = followingList[followingList.length - 1];
                followingList.pop();
                break;
            }
        }

        // Remove from followers array
        address[] storage followersList = followers[userToUnfollow];
        for (uint256 i = 0; i < followersList.length; i++) {
            if (followersList[i] == msg.sender) {
                followersList[i] = followersList[followersList.length - 1];
                followersList.pop();
                break;
            }
        }

        isFollowing[msg.sender][userToUnfollow] = false;
        emit Unfollowed(msg.sender, userToUnfollow);
    }

    /**
     * @dev Get all users that a user follows
     * @param user Address of the user
     * @return address[] Array of addresses the user follows
     */
    function getFollowing(address user) external view returns (address[] memory) {
        return following[user];
    }

    /**
     * @dev Get all followers of a user
     * @param user Address of the user
     * @return address[] Array of addresses following the user
     */
    function getFollowers(address user) external view returns (address[] memory) {
        return followers[user];
    }

    /**
     * @dev Get posts from followed users with pagination
     * @param offset Starting index
     * @param limit Maximum number of posts to return
     * @return Post[] Array of posts from followed users
     * @return uint256 Total number of posts from followed users
     */
    function getFollowedPosts(uint256 offset, uint256 limit) external view returns (Post[] memory, uint256) {
        address[] memory followedUsers = following[msg.sender];
        
        // First, count total posts from followed users
        uint256 totalFollowedPosts = 0;
        for (uint256 i = 0; i < followedUsers.length; i++) {
            totalFollowedPosts += userPosts[followedUsers[i]].length;
        }

        if (totalFollowedPosts == 0 || offset >= totalFollowedPosts) {
            return (new Post[](0), totalFollowedPosts);
        }

        // Calculate actual number of posts to return
        uint256 remaining = totalFollowedPosts - offset;
        uint256 count = remaining < limit ? remaining : limit;

        // Create temporary array for all posts
        Post[] memory allPosts = new Post[](totalFollowedPosts);
        uint256 postIndex = 0;

        // Gather all posts from followed users
        for (uint256 i = 0; i < followedUsers.length; i++) {
            uint256[] memory userPostIds = userPosts[followedUsers[i]];
            for (uint256 j = 0; j < userPostIds.length; j++) {
                allPosts[postIndex] = posts[userPostIds[j]];
                postIndex++;
            }
        }

        // Sort by timestamp (newest first)
        for (uint256 i = 0; i < totalFollowedPosts - 1; i++) {
            for (uint256 j = 0; j < totalFollowedPosts - i - 1; j++) {
                if (allPosts[j].timestamp < allPosts[j + 1].timestamp) {
                    Post memory temp = allPosts[j];
                    allPosts[j] = allPosts[j + 1];
                    allPosts[j + 1] = temp;
                }
            }
        }

        // Apply pagination
        Post[] memory result = new Post[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allPosts[offset + i];
        }

        return (result, totalFollowedPosts);
    }
} 