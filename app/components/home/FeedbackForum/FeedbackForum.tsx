"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { PresetEmoji } from "../../Twemoji";
import FeedbackList from "./FeedbackList";
import FeedbackDetails from "./FeedbackDetails";
import CreatePostModal from "./CreatePostModal";
import { FeedbackPost } from "./types";
import { useSectionLazyLoad } from "../../../../lib/hooks/useSectionLazyLoad";
import {
  FeedbackService,
  FeedbackWithUserAndTagsComplete,
} from "../../../../lib/supabase/feedback";
import { FeedbackReactionService } from "../../../../lib/supabase/feedback_reactions";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";

interface FeedbackForumProps {
  isUserSignedIn?: boolean;
  onOpenSignupModal?: () => void;
  onCloseFeedbackForum?: () => void;
  userProfile?: {
    profile_picture: string;
  };
  user?: {
    id: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function FeedbackForum({
  isUserSignedIn = false,
  onOpenSignupModal = () => {},
  onCloseFeedbackForum = () => {},
  userProfile,
  user,
}: FeedbackForumProps) {
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isClosingBottomSheet, setIsClosingBottomSheet] = useState(false);
  const [bottomSheetView, setBottomSheetView] = useState<"list" | "details">(
    "list"
  );
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackIdMap, setFeedbackIdMap] = useState<Map<number, string>>(
    new Map()
  ); // Maps sequential ID to actual UUID
  const [retryCount, setRetryCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [loadingTimeoutId, setLoadingTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  // Section lazy loading
  const {
    ref: sectionRef,
    hasLoaded,
    isVisible,
    hasBeenInvisible,
  } = useSectionLazyLoad({
    threshold: 0.2,
    rootMargin: "100px",
    triggerOnce: true,
  });

  const selectedPost = posts.find((post) => post.id === selectedPostId) || null;

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1d";
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    return `${Math.floor(diffDays / 30)}mo`;
  };

  // Transform database feedback to FeedbackPost format
  const transformFeedbackData = (
    dbFeedback: FeedbackWithUserAndTagsComplete[]
  ): { posts: FeedbackPost[]; idMap: Map<number, string> } => {
    const idMap = new Map<number, string>();

    const posts = dbFeedback.map((fb, index) => {
      const sequentialId = index + 1;
      idMap.set(sequentialId, fb.id); // Map sequential ID to actual UUID

      // Transform nested comments to match FeedbackPost format (recursive)
      const transformComments = (
        comments: typeof fb.comments
      ): FeedbackPost["comments"] => {
        return comments.map((comment) => ({
          id: comment.id,
          user_id: comment.user_id, // Include user_id for ownership check
          username: comment.user?.display_name || "Anonymous",
          profile_picture: comment.user?.profile_picture,
          content: comment.content,
          timestamp: formatRelativeTime(comment.created_at),
          heartsCount: comment.like_count || 0,
          isHearted: comment.user_has_liked || false,
          replies:
            comment.replies && comment.replies.length > 0
              ? transformComments(comment.replies as any)
              : [],
          reply_count: comment.reply_count || 0,
          showReplies: false,
        }));
      };

      return {
        id: sequentialId, // Use sequential numbers starting from 1
        user_id: fb.user_id, // Include user_id for ownership check
        username: fb.user?.display_name || "Anonymous",
        profile_picture: fb.user?.profile_picture,
        timestamp: formatRelativeTime(fb.created_at),
        title: fb.title,
        description: fb.description || "",
        category: "new" as const, // Default category for now
        heartsCount: fb.reaction_count,
        commentsCount: fb.comment_count,
        isHearted: fb.user_has_reacted,
        comments: transformComments(fb.comments),
        tags: fb.tags || [],
        feature_id: fb.feature_id, // Include feature_id for editing
      };
    });

    return { posts, idMap };
  };

  // Function to fetch feedback data with complete information
  const fetchFeedback = async (isRetry = false) => {
    // Clear any existing timeout
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      setLoadingTimeoutId(null);
    }

    setIsLoadingFeedback(true);
    setLoadError(false);

    // Set a timeout to detect stuck loading (10 seconds)
    const timeoutId = setTimeout(() => {
      console.warn("Feedback loading timeout - attempting retry");
      handleLoadingTimeout();
    }, 10000);

    setLoadingTimeoutId(timeoutId);

    let shouldRetry = false;

    try {
      const { feedback, error, count } =
        await FeedbackService.getFeedbackWithComplete(
          undefined, // filters
          undefined, // limit
          undefined, // offset
          user?.id // userId for reaction/like status
        );

      // Clear timeout on successful response
      clearTimeout(timeoutId);
      setLoadingTimeoutId(null);

      if (error) {
        console.error("Error fetching feedback:", error);
        throw error;
      } else {
        console.log("Feedback with complete data:", feedback);

        if (feedback && feedback.length > 0) {
          const { posts: transformedPosts, idMap } =
            transformFeedbackData(feedback);
          setPosts(transformedPosts);
          setFeedbackIdMap(idMap);
        }

        // Reset retry count on success
        setRetryCount(0);
        setLoadError(false);
        setIsLoadingFeedback(false);
      }
    } catch (error) {
      console.error("Exception in fetchFeedback:", error);
      clearTimeout(timeoutId);
      setLoadingTimeoutId(null);

      // Handle retry logic
      if (retryCount < 3) {
        console.log(`Retrying feedback fetch (attempt ${retryCount + 1}/3)`);
        setRetryCount((prev) => prev + 1);
        shouldRetry = true;
        // Retry after a short delay
        setTimeout(() => fetchFeedback(true), 2000);
      } else {
        // Max retries reached
        console.error("Max retries reached, showing error state");
        setLoadError(true);
        setIsLoadingFeedback(false);
      }
    }
  };

  // Handle loading timeout
  const handleLoadingTimeout = () => {
    if (retryCount < 3) {
      console.log(`Loading timeout - retrying (attempt ${retryCount + 1}/3)`);
      setRetryCount((prev) => prev + 1);
      setIsLoadingFeedback(false);
      // Retry after clearing the loading state
      setTimeout(() => fetchFeedback(true), 1000);
    } else {
      console.error("Max retries reached after timeout");
      setLoadError(true);
      setIsLoadingFeedback(false);
    }
  };

  // Silent refetch for background updates (no loading spinner)
  const silentRefetchFeedback = async () => {
    const { feedback, error, count } =
      await FeedbackService.getFeedbackWithComplete(
        undefined, // filters
        undefined, // limit
        undefined, // offset
        user?.id // userId for reaction/like status
      );

    if (error) {
      console.error("Error silently refetching feedback:", error);
    } else {
      if (feedback && feedback.length > 0) {
        const { posts: transformedPosts, idMap } =
          transformFeedbackData(feedback);
        setPosts(transformedPosts);
        setFeedbackIdMap(idMap);
      }
    }
  };

  // Fetch feedback with users and tags when section loads or user changes
  useEffect(() => {
    if (hasLoaded) {
      fetchFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLoaded, user?.id]); // Re-fetch when user ID changes

  // Re-fetch data when section becomes visible again after being hidden
  useEffect(() => {
    if (!hasLoaded || !hasBeenInvisible || !isVisible) return;

    const refetchFeedback = async () => {
      try {
        const { feedback, error } =
          await FeedbackService.getFeedbackWithComplete(
            undefined, // filters
            undefined, // limit
            undefined, // offset
            user?.id // userId for reaction/like status
          );

        if (error) {
          console.error("Error refetching feedback:", error);
        } else {
          if (feedback && feedback.length > 0) {
            const { posts: transformedPosts, idMap } =
              transformFeedbackData(feedback);
            setPosts(transformedPosts);
            setFeedbackIdMap(idMap);
          }
        }
      } catch (error) {
        console.error("Error in refetchFeedback:", error);
      }
    };

    refetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, hasBeenInvisible, hasLoaded, user?.id]);

  // Define gradient options for feature cards
  const gradientOptions = [
    "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)", // Teal to Blue
    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)", // Purple to Violet
    "linear-gradient(90.81deg, #E67E22 0.58%, #F39C12 99.31%)", // Orange to Golden
    "linear-gradient(90.81deg, #2ECC71 0.58%, #27AE60 99.31%)", // Light Green to Green
    "linear-gradient(90.81deg, #E74C3C 0.58%, #C0392B 99.31%)", // Light Red to Red
    "linear-gradient(90.81deg, #3498DB 0.58%, #2980B9 99.31%)", // Light Blue to Blue
  ];

  // Feature cards data with gradients
  const featureCards = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      title: "Get Started Easily",
      description:
        "Simple sign-up process to begin your spiritual journey with personalized guidance.",
      images: [
        {
          src: "/assets/feature_mockups/SignUp.png",
          alt: "Sign Up Interface",
        },
        {
          src: "/assets/feature_mockups/Dashboard.png",
          alt: "Dashboard Overview",
        },
      ],
      gradient: gradientOptions[0],
    },
    {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      title: "Set Meaningful Goals",
      description:
        "Create and track spiritual goals with inspiring ideas to grow your faith.",
      images: [
        {
          src: "/assets/feature_mockups/GoalsList.png",
          alt: "Goals List",
        },
        {
          src: "/assets/feature_mockups/GoalsIdeas.png",
          alt: "Goal Ideas",
        },
      ],
      gradient: gradientOptions[1],
    },
    {
      id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      title: "Navigate Daily Challenges",
      description:
        "Balance your workday priorities while staying connected to your spiritual struggles.",
      images: [
        {
          src: "/assets/feature_mockups/Workday.png",
          alt: "Workday Planning",
        },
        {
          src: "/assets/feature_mockups/Struggles.png",
          alt: "Spiritual Struggles",
        },
      ],
      gradient: gradientOptions[2],
    },
    {
      id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
      title: "Daily Check-ins",
      description:
        "Regular spiritual check-ins to maintain accountability and track your progress.",
      images: [
        {
          src: "/assets/feature_mockups/CheckInOne.png",
          alt: "Check-in Step One",
        },
        {
          src: "/assets/feature_mockups/CheckInTwo.png",
          alt: "Check-in Step Two",
        },
      ],
      gradient: gradientOptions[3],
    },
    {
      id: "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
      title: "Immersive Bible Reading",
      description:
        "Engage with Scripture through interactive reading experiences and detailed insights.",
      images: [
        {
          src: "/assets/feature_mockups/Reading.png",
          alt: "Bible Reading",
        },
        {
          src: "/assets/feature_mockups/ReadingDetails.png",
          alt: "Reading Details",
        },
      ],
      gradient: gradientOptions[4],
    },
    {
      id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
      title: "Community Discussions",
      description:
        "Connect with others through verse comments and meaningful conversation threads.",
      images: [
        {
          src: "/assets/feature_mockups/VerseComments.png",
          alt: "Verse Comments",
        },
        {
          src: "/assets/feature_mockups/VerseThreads.png",
          alt: "Discussion Threads",
        },
      ],
      gradient: gradientOptions[5],
    },
    {
      id: "6ba7b815-9dad-11d1-80b4-00c04fd430c8",
      title: "Spiritual Battles",
      description:
        "Engage in spiritual warfare through interactive battles that strengthen your faith.",
      images: [
        {
          src: "/assets/feature_mockups/Battle.png",
          alt: "Battle Interface",
        },
        {
          src: "/assets/feature_mockups/Battling.png",
          alt: "Active Battle",
        },
      ],
      gradient: gradientOptions[0],
    },
    {
      id: "6ba7b816-9dad-11d1-80b4-00c04fd430c8",
      title: "Challenge Selection",
      description:
        "Choose your difficulty level and answer questions to test your biblical knowledge.",
      images: [
        {
          src: "/assets/feature_mockups/DifficultySelection.png",
          alt: "Difficulty Selection",
        },
        {
          src: "/assets/feature_mockups/AnswerSelection.png",
          alt: "Answer Selection",
        },
      ],
      gradient: gradientOptions[1],
    },
  ];

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
    };
  }, [loadingTimeoutId]);

  const handleSelectPost = (postId: number) => {
    setSelectedPostId(postId);
    if (isMobile) {
      setShowBottomSheet(true);
      setBottomSheetView("details");
    }
  };

  const handleViewAll = () => {
    setShowBottomSheet(true);
    setBottomSheetView("list");
  };

  const handleCloseBottomSheet = () => {
    setIsClosingBottomSheet(true);
    setTimeout(() => {
      setShowBottomSheet(false);
      setIsClosingBottomSheet(false);
      setSelectedPostId(null);
    }, 300); // Match the animation duration
  };

  const handleBackToList = () => {
    setBottomSheetView("list");
    setSelectedPostId(null);
  };

  const handleEditPost = (postId: number) => {
    setEditingPostId(postId);

    // On mobile, close the bottom sheet first before opening edit modal
    if (isMobile && showBottomSheet) {
      handleCloseBottomSheet();
      // Wait for bottom sheet to close before opening edit modal
      setTimeout(() => {
        setShowCreatePostModal(true);
      }, 300); // Match the bottom sheet animation duration
    } else {
      setShowCreatePostModal(true);
    }
  };

  const handleTogglePostHeart = async (postId: number) => {
    // Check if user is signed in
    if (!isUserSignedIn || !user?.id) {
      onOpenSignupModal();
      return;
    }

    // Get the actual feedback UUID from the map
    const feedbackId = feedbackIdMap.get(postId);
    if (!feedbackId) {
      console.error("Feedback ID not found for post:", postId);
      return;
    }

    // Optimistically update UI
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isHearted: !post.isHearted,
              heartsCount: post.isHearted
                ? post.heartsCount - 1
                : post.heartsCount + 1,
            }
          : post
      )
    );

    // Call the API to toggle the reaction
    const { reaction, error } =
      await FeedbackReactionService.toggleUserReaction(feedbackId, user.id);

    if (error) {
      console.error("Error toggling feedback reaction:", error);
      // Revert the optimistic update on error
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isHearted: !post.isHearted,
                heartsCount: post.isHearted
                  ? post.heartsCount - 1
                  : post.heartsCount + 1,
              }
            : post
        )
      );
    } else {
      console.log(reaction ? "Reaction added:" : "Reaction removed:", reaction);
    }
  };

  const handleToggleCommentHeart = (commentId: string) => {
    if (!selectedPost) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, isHearted: !comment.isHearted }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const handleToggleReplyHeart = (commentId: string, replyId: string) => {
    if (!selectedPost) return;

    // Recursive function to toggle reply heart at any nesting level
    const toggleReplyHeartRecursive = (
      comments: FeedbackPost["comments"]
    ): FeedbackPost["comments"] => {
      return comments.map((comment) => {
        // Check if this is the reply we're looking for
        if (comment.id === replyId) {
          return { ...comment, isHearted: !comment.isHearted };
        }
        // Recursively check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: toggleReplyHeartRecursive(comment.replies),
          };
        }
        return comment;
      });
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: toggleReplyHeartRecursive(post.comments),
            }
          : post
      )
    );
  };

  const handleToggleReplies = (commentId: string) => {
    if (!selectedPost) return;

    // Recursive function to toggle replies at any nesting level
    const toggleRepliesRecursive = (
      comments: FeedbackPost["comments"]
    ): FeedbackPost["comments"] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, showReplies: !comment.showReplies };
        }
        // Recursively check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: toggleRepliesRecursive(comment.replies),
          };
        }
        return comment;
      });
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: toggleRepliesRecursive(post.comments),
            }
          : post
      )
    );
  };

  // Handle optimistic comment addition
  const handleCommentAdded = (newComment: FeedbackPost["comments"][0]) => {
    if (!selectedPostId) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPostId
          ? {
              ...post,
              comments: [newComment, ...post.comments], // Add new comment at the top
              commentsCount: post.commentsCount + 1, // Increment count
            }
          : post
      )
    );
  };

  // Handle optimistic reply addition
  const handleReplyAdded = (
    parentCommentId: string,
    newReply: FeedbackPost["comments"][0]
  ) => {
    if (!selectedPostId) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== selectedPostId) return post;

        // Recursive function to add reply to the correct parent
        const addReplyToComment = (
          comments: FeedbackPost["comments"]
        ): FeedbackPost["comments"] => {
          return comments.map((comment) => {
            // Found the parent comment
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [newReply, ...(comment.replies || [])], // Add reply at the top
                showReplies: true, // Auto-expand to show new reply
              };
            }
            // Check nested replies recursively
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToComment(comment.replies),
              };
            }
            return comment;
          });
        };

        return {
          ...post,
          comments: addReplyToComment(post.comments),
          commentsCount: post.commentsCount + 1, // Increment total count
        };
      })
    );
  };

  // Handle comment update (replace temp ID with real UUID)
  const handleCommentUpdated = (
    tempId: string,
    realComment: FeedbackPost["comments"][0]
  ) => {
    if (!selectedPostId) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPostId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === tempId ? realComment : comment
              ),
            }
          : post
      )
    );
  };

  // Handle comment content update (for editing)
  const handleUpdateComment = (commentId: string, newContent: string) => {
    if (!selectedPostId) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPostId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, content: newContent }
                  : comment
              ),
            }
          : post
      )
    );
  };

  // Handle reply content update (for editing)
  const handleUpdateReply = (replyId: string, newContent: string) => {
    if (!selectedPostId) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== selectedPostId) return post;

        // Recursive function to update reply content
        const updateReplyContentRecursive = (
          comments: FeedbackPost["comments"]
        ): FeedbackPost["comments"] => {
          return comments.map((comment) => {
            // Check if this comment is the reply to update
            if (comment.id === replyId) {
              return { ...comment, content: newContent };
            }

            // If this comment has replies, recursively update them
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplyContentRecursive(comment.replies),
              };
            }

            return comment;
          });
        };

        return {
          ...post,
          comments: updateReplyContentRecursive(post.comments),
        };
      })
    );
  };

  const handleReplyUpdated = (
    tempId: string,
    realReply: FeedbackPost["comments"][0]
  ) => {
    if (!selectedPostId) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== selectedPostId) return post;

        // Recursive function to update reply with temp ID
        const updateReplyRecursive = (
          comments: FeedbackPost["comments"]
        ): FeedbackPost["comments"] => {
          return comments.map((comment) => {
            // Check if this is the reply to update
            if (comment.id === tempId) {
              return realReply;
            }
            // Recursively check nested replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplyRecursive(comment.replies),
              };
            }
            return comment;
          });
        };

        return {
          ...post,
          comments: updateReplyRecursive(post.comments),
        };
      })
    );
  };

  return (
    <section
      ref={sectionRef}
      id="feedback-section"
      className={`pt-10 pb-16 px-4 sm:px-6 md:px-8 w-full transition-opacity duration-700 ${
        hasLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Feedback Forum
        </h2>

        {/* Header Section */}
        <div
          className={`rounded-3xl mb-8 ${
            isMobile ? "px-4 py-4" : "px-10 py-6"
          }`}
          style={{ backgroundColor: "#282828" }}
        >
          {isMobile ? (
            /* Mobile Layout - Compact */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-white text-lg font-bold mb-1">
                  Share your feedback:
                </h3>
                <p className="text-gray-300 text-sm">
                  What could we build or improve to better meet your needs?
                </p>
              </div>
              <button
                className="w-full py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                }}
                type="button"
                onClick={() => setShowCreatePostModal(true)}
              >
                <Plus size={20} />
                Create
              </button>
            </div>
          ) : (
            /* Desktop Layout */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                  Share your feedback:
                </h3>
                <p className="text-gray-300 text-sm sm:text-base">
                  What could we build or improve to better meet your needs?
                </p>
              </div>

              {/* Right Content - Create Button */}
              <div className="flex-shrink-0">
                <button
                  className="px-8 py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2"
                  style={{
                    background:
                      "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                  }}
                  type="button"
                  onClick={() => setShowCreatePostModal(true)}
                >
                  <Plus size={20} />
                  Create
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        {!isMobile && (
          <div className="flex gap-6" style={{ height: "80vh" }}>
            {loadError ? (
              /* Error State */
              <div
                className="w-full h-full flex items-center justify-center rounded-3xl"
                style={{ backgroundColor: "#323817" }}
              >
                <div className="flex flex-col items-center gap-4 px-8 text-center">
                  <div className="text-6xl">⚠️</div>
                  <p className="text-white text-xl font-semibold">
                    Failed to Load Feedback
                  </p>
                  <p className="text-gray-300 text-base max-w-md">
                    We couldn't load the feedback after multiple attempts.
                    Please check your connection and try again.
                  </p>
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      setLoadError(false);
                      fetchFeedback();
                    }}
                    className="mt-4 px-6 py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : isLoadingFeedback ? (
              /* Loading State */
              <div
                className="w-full h-full flex items-center justify-center rounded-3xl"
                style={{ backgroundColor: "#323817" }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                  </div>
                  <p className="text-white text-lg font-medium">
                    Loading feedback...
                  </p>
                  {retryCount > 0 && (
                    <p className="text-gray-400 text-sm">
                      Retry attempt {retryCount} of 3
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Left Side - Feedback List (40%) */}
                <div className="w-2/5 flex-shrink-0 h-full">
                  <FeedbackList
                    posts={posts}
                    selectedPostId={selectedPostId}
                    onSelectPost={handleSelectPost}
                    onToggleHeart={handleTogglePostHeart}
                    isUserSignedIn={isUserSignedIn}
                    currentUserId={user?.id}
                    onEditPost={handleEditPost}
                    featureCards={featureCards}
                  />
                </div>

                {/* Right Side - Feedback Details (60%) */}
                <div
                  className="w-3/5 flex-shrink-0 rounded-3xl p-6 h-full"
                  style={{ backgroundColor: "#323817" }}
                >
                  <FeedbackDetails
                    post={selectedPost}
                    onTogglePostHeart={handleTogglePostHeart}
                    onToggleCommentHeart={handleToggleCommentHeart}
                    onToggleReplyHeart={handleToggleReplyHeart}
                    onToggleReplies={handleToggleReplies}
                    isUserSignedIn={isUserSignedIn}
                    onOpenSignupModal={() => {
                      onCloseFeedbackForum();
                      onOpenSignupModal();
                    }}
                    userId={user?.id}
                    feedbackId={
                      selectedPostId
                        ? feedbackIdMap.get(selectedPostId)
                        : undefined
                    }
                    userDisplayName={user?.user_metadata?.display_name}
                    userProfilePicture={userProfile?.profile_picture}
                    onCommentAdded={handleCommentAdded}
                    onReplyAdded={handleReplyAdded}
                    onCommentUpdated={handleCommentUpdated}
                    onReplyUpdated={handleReplyUpdated}
                    onCommentSubmitted={silentRefetchFeedback}
                    onEditPost={handleEditPost}
                    onUpdateComment={handleUpdateComment}
                    onUpdateReply={handleUpdateReply}
                    featureCards={featureCards}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile Layout - Top 3 Posts */}
        {isMobile && (
          <div className="space-y-4">
            {loadError ? (
              /* Mobile Error State */
              <div
                className="w-full py-20 flex items-center justify-center rounded-3xl"
                style={{ backgroundColor: "#323817" }}
              >
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                  <div className="text-5xl">⚠️</div>
                  <p className="text-white text-lg font-semibold">
                    Failed to Load Feedback
                  </p>
                  <p className="text-gray-300 text-sm">
                    We couldn't load the feedback after multiple attempts.
                    Please check your connection and try again.
                  </p>
                  <button
                    onClick={() => {
                      setRetryCount(0);
                      setLoadError(false);
                      fetchFeedback();
                    }}
                    className="mt-2 px-6 py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                    }}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : isLoadingFeedback ? (
              /* Mobile Loading State */
              <div
                className="w-full py-20 flex items-center justify-center rounded-3xl"
                style={{ backgroundColor: "#323817" }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                  </div>
                  <p className="text-white text-base font-medium">
                    Loading feedback...
                  </p>
                  {retryCount > 0 && (
                    <p className="text-gray-400 text-xs">
                      Retry attempt {retryCount} of 3
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {posts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => handleSelectPost(post.id)}
                    className="p-4 rounded-2xl cursor-pointer transition-all duration-200"
                    style={{ backgroundColor: "#323817" }}
                  >
                    {/* Post Content */}
                    <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                      {post.description}
                    </p>

                    {/* Feature Badge and Tags */}
                    {(post.feature_id ||
                      (post.tags && post.tags.length > 0)) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {/* Feature Badge */}
                        {post.feature_id && (
                          <span
                            className="px-2 py-1 text-xs rounded-full font-medium"
                            style={{
                              background:
                                featureCards.find(
                                  (f) => f.id === post.feature_id
                                )?.gradient ||
                                "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                              color: "#FFFFFF",
                            }}
                          >
                            {featureCards.find((f) => f.id === post.feature_id)
                              ?.title || "Feature"}
                          </span>
                        )}

                        {/* Tags */}
                        {post.tags &&
                          post.tags.map((tag) => {
                            const tagColors = {
                              question: { bg: "#5B8DEE", text: "#FFFFFF" },
                              improvement: { bg: "#9B59B6", text: "#FFFFFF" },
                              idea: { bg: "#A8C256", text: "#FFFFFF" },
                            };
                            const colors = tagColors[
                              tag.name.toLowerCase() as keyof typeof tagColors
                            ] || { bg: "#6B7280", text: "#FFFFFF" };

                            return (
                              <span
                                key={tag.id}
                                className="px-2 py-1 text-xs rounded-full font-medium capitalize"
                                style={{
                                  backgroundColor: colors.bg,
                                  color: colors.text,
                                }}
                              >
                                {tag.name}
                              </span>
                            );
                          })}
                      </div>
                    )}

                    {/* Combined User Info and Post Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-300"
                          style={{ backgroundColor: "#D6E5E2" }}
                        >
                          {post.profile_picture ? (
                            <Image
                              src={getCharacterImageSrc(post.profile_picture)}
                              alt={post.profile_picture}
                              width={200}
                              height={200}
                              className="w-auto h-full object-cover opacity-100 grayscale-0"
                              style={getCharacterImageStyles(
                                post.profile_picture
                              )}
                              quality={100}
                            />
                          ) : (
                            <span className="text-white text-xs font-semibold">
                              {post.username
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-300 text-sm font-medium">
                            {post.username}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            {post.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePostHeart(post.id);
                          }}
                          className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: post.isHearted
                              ? "transparent"
                              : "#282828",
                            background: post.isHearted
                              ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                              : "#282828",
                          }}
                        >
                          <PresetEmoji type="HEART" size={16} />
                          <span className="text-white font-medium">
                            {post.heartsCount}
                          </span>
                        </button>
                        <div
                          className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm"
                          style={{ backgroundColor: "#282828" }}
                        >
                          <PresetEmoji type="SPEECH_BUBBLE" size={16} />
                          <span className="text-white font-medium">
                            {post.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* View All Button */}
                <button
                  onClick={handleViewAll}
                  className="w-full py-4 mt-6 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                    boxShadow: "0px 4px 0px 1px #764B6F",
                  }}
                >
                  View All Feedback
                </button>
              </>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && showBottomSheet && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 z-[100] transition-opacity duration-300"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                opacity: showBottomSheet && !isClosingBottomSheet ? 1 : 0,
              }}
              onClick={handleCloseBottomSheet}
            />

            {/* Bottom Sheet */}
            <div
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl z-[101] ${
                isClosingBottomSheet ? "animate-slide-down" : "animate-slide-up"
              }`}
              style={{ height: "95vh", backgroundColor: "#3C4806" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 ">
                {bottomSheetView === "details" && (
                  <button
                    onClick={handleBackToList}
                    className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <h3 className="text-white font-semibold text-lg flex-1 text-center">
                  {bottomSheetView === "details"
                    ? "Feedback Details"
                    : "All Feedback"}
                </h3>
                <button
                  onClick={handleCloseBottomSheet}
                  className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="h-full overflow-hidden">
                {bottomSheetView === "list" ? (
                  <FeedbackList
                    posts={posts}
                    selectedPostId={selectedPostId}
                    onSelectPost={handleSelectPost}
                    onToggleHeart={handleTogglePostHeart}
                    isMobile={true}
                    isUserSignedIn={isUserSignedIn}
                    currentUserId={user?.id}
                    onEditPost={handleEditPost}
                    featureCards={featureCards}
                  />
                ) : (
                  <div className="p-4 h-full">
                    <FeedbackDetails
                      post={selectedPost}
                      onTogglePostHeart={handleTogglePostHeart}
                      onToggleCommentHeart={handleToggleCommentHeart}
                      onToggleReplyHeart={handleToggleReplyHeart}
                      onToggleReplies={handleToggleReplies}
                      isMobile={true}
                      isUserSignedIn={isUserSignedIn}
                      onOpenSignupModal={() => {
                        handleCloseBottomSheet();
                        onOpenSignupModal();
                      }}
                      userId={user?.id}
                      feedbackId={
                        selectedPostId
                          ? feedbackIdMap.get(selectedPostId)
                          : undefined
                      }
                      userDisplayName={user?.user_metadata?.display_name}
                      userProfilePicture={userProfile?.profile_picture}
                      onCommentAdded={handleCommentAdded}
                      onReplyAdded={handleReplyAdded}
                      onCommentUpdated={handleCommentUpdated}
                      onReplyUpdated={handleReplyUpdated}
                      onCommentSubmitted={silentRefetchFeedback}
                      onEditPost={handleEditPost}
                      onUpdateComment={handleUpdateComment}
                      onUpdateReply={handleUpdateReply}
                      featureCards={featureCards}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slideUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {/* Create Post Modal */}
      {userProfile && user && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => {
            setShowCreatePostModal(false);
            setEditingPostId(null);
          }}
          userProfile={userProfile}
          user={user}
          features={featureCards}
          onSuccess={fetchFeedback}
          editMode={editingPostId !== null}
          existingFeedbackId={
            editingPostId ? feedbackIdMap.get(editingPostId) : undefined
          }
          existingTitle={
            editingPostId
              ? posts.find((p) => p.id === editingPostId)?.title
              : undefined
          }
          existingDescription={
            editingPostId
              ? posts.find((p) => p.id === editingPostId)?.description
              : undefined
          }
          existingFeatureId={
            editingPostId
              ? posts.find((p) => p.id === editingPostId)?.feature_id || null
              : null
          }
          existingTagIds={
            editingPostId
              ? posts
                  .find((p) => p.id === editingPostId)
                  ?.tags?.map((t) => t.id) || []
              : []
          }
        />
      )}
    </section>
  );
}
