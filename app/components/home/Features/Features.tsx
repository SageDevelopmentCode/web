"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeatureCard from "./FeatureCard";
import DesktopCommentsPopup from "./DesktopCommentsPopup";
import ResponsiveSignupModal from "../../navigation/ResponsiveSignupModal";
import { useAuth } from "../../../../contexts/auth-context";
import { FeatureCommentService } from "../../../../lib/supabase/feature_comments";
import { FeatureCommentLikeService } from "../../../../lib/supabase/feature_comments_likes";
import {
  FeatureReactionBatchService,
  FeatureReactionBatch,
} from "../../../../lib/supabase/feature_reactions_batch";
import { useSectionLazyLoad } from "../../../../lib/hooks/useSectionLazyLoad";

// Comment and Reply interfaces
interface Comment {
  id: string;
  content: string;
  created_at: string;
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  replies?: Reply[];
  reply_count?: number;
  showReplies?: boolean;
  isHearted?: boolean;
  like_count?: number;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  isHearted?: boolean;
  like_count?: number;
  replies?: Reply[];
  reply_count?: number;
  showReplies?: boolean;
}

export default function Features() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);
  const [currentFeatureForComments, setCurrentFeatureForComments] = useState<{
    id: string;
    title: string;
    images: { src: string; alt: string }[];
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Section lazy loading
  const { ref: sectionRef, hasLoaded } = useSectionLazyLoad({
    threshold: 0.2,
    rootMargin: "100px",
    triggerOnce: true,
  });

  // Dynamic comments data
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Batch reaction data
  const [featureReactions, setFeatureReactions] = useState<
    FeatureReactionBatch[]
  >([]);
  const [isLoadingReactions, setIsLoadingReactions] = useState(false);

  // Load batch reaction data only when section becomes visible
  useEffect(() => {
    if (!hasLoaded) return;

    const loadBatchReactions = async () => {
      setIsLoadingReactions(true);
      try {
        const featureIds = featureCards.map((card) => card.id);
        const { features, error } =
          await FeatureReactionBatchService.getFeatureReactionsBatch(
            featureIds,
            user?.id
          );

        if (error) {
          console.error("Error loading batch reactions:", error);
        } else {
          setFeatureReactions(features);
        }
      } catch (error) {
        console.error("Error in loadBatchReactions:", error);
      } finally {
        setIsLoadingReactions(false);
      }
    };

    loadBatchReactions();
  }, [hasLoaded, user?.id]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle mobile state changes - close popup if switching to mobile
  useEffect(() => {
    if (isMobile && isCommentsPopupOpen) {
      setIsCommentsPopupOpen(false);
    }
  }, [isMobile, isCommentsPopupOpen]);

  // Handle comment popup toggle
  const handleCommentToggle = async (
    isOpen: boolean,
    featureData?: {
      id: string;
      title: string;
      images: { src: string; alt: string }[];
    },
    commentsData?: Comment[]
  ) => {
    // Only show popup on desktop
    if (!isMobile) {
      setIsCommentsPopupOpen(isOpen);
      if (isOpen && featureData) {
        setCurrentFeatureForComments(featureData);
        setIsLoadingComments(true); // Start loading when opening

        // If we don't have comments data, fetch it
        if (!commentsData || commentsData.length === 0) {
          try {
            const { comments: apiComments, error } =
              await FeatureCommentService.getFeatureCommentsWithUsers(
                featureData.id,
                true,
                undefined,
                undefined,
                user?.id
              );
            if (error) {
              console.error("Error fetching feature comments:", error);
            } else {
              console.log("Feature comments with reply counts:", apiComments);
              if (apiComments) {
                apiComments.forEach((comment, index) => {
                  console.log(
                    `Comment ${index + 1} (${comment.id}): ${
                      comment.reply_count
                    } replies, ${comment.like_count} likes`
                  );
                });
                // Update comments state with API data
                const formattedComments = apiComments.map((comment) => ({
                  ...comment,
                  showReplies: false,
                  isHearted: comment.user_has_liked || false,
                  replies:
                    comment.replies?.map((reply) => ({
                      ...reply,
                      isHearted: reply.user_has_liked || false,
                    })) || [],
                }));
                setComments(formattedComments);
              }
            }
          } catch (error) {
            console.error("Error in comment fetch:", error);
          }
        } else {
          // Use provided comments data
          setComments(commentsData);
        }
        setIsLoadingComments(false); // Stop loading
      } else if (!isOpen) {
        setCurrentFeatureForComments(null);
        setIsLoadingComments(false);
      }
    }
  };

  // Handle popup close
  const handlePopupClose = () => {
    setIsCommentsPopupOpen(false);
    setCurrentFeatureForComments(null);
    setIsLoadingComments(false);
  };

  // Handle opening signup modal
  const handleOpenSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  // Handle closing signup modal
  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  // Handle successful signup/login
  const handleSignupSuccess = () => {
    setIsSignupModalOpen(false);
    // Optionally show a success message or refresh user data
  };

  // Handle reaction update - refresh batch data
  const handleReactionUpdate = async () => {
    try {
      const featureIds = featureCards.map((card) => card.id);
      const { features, error } =
        await FeatureReactionBatchService.getFeatureReactionsBatch(
          featureIds,
          user?.id
        );

      if (error) {
        console.error("Error refreshing batch reactions:", error);
      } else {
        setFeatureReactions(features);
      }
    } catch (error) {
      console.error("Error in handleReactionUpdate:", error);
    }
  };

  // Toggle replies visibility (works recursively for nested replies)
  const toggleReplies = (commentId: string) => {
    const toggleInReplies = (replies: Reply[]): Reply[] => {
      return replies.map((reply) => {
        if (reply.id === commentId) {
          return { ...reply, showReplies: !reply.showReplies };
        }
        if (reply.replies && reply.replies.length > 0) {
          return { ...reply, replies: toggleInReplies(reply.replies) };
        }
        return reply;
      });
    };

    setComments((prevComments) =>
      prevComments.map((comment) => {
        // Check if it's the top-level comment
        if (comment.id === commentId) {
          return { ...comment, showReplies: !comment.showReplies };
        }
        // Check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: toggleInReplies(comment.replies) };
        }
        return comment;
      })
    );
  };

  // Toggle heart for comments
  const toggleCommentHeart = async (commentId: string) => {
    if (!user?.id) {
      // If user is not signed in, close popup and open signup modal
      handlePopupClose();
      handleOpenSignupModal();
      return;
    }

    // Optimistic UI update
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, isHearted: !comment.isHearted }
          : comment
      )
    );

    try {
      // Call API to toggle like
      const { error } = await FeatureCommentLikeService.toggleUserCommentLike(
        commentId,
        user.id
      );

      if (error) {
        console.error("Error toggling comment like:", error);
        // Revert optimistic update on error
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, isHearted: !comment.isHearted }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error in toggleCommentHeart:", error);
      // Revert optimistic update on error
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, isHearted: !comment.isHearted }
            : comment
        )
      );
    }
  };

  // Submit a reply to a comment or reply
  const handleSubmitReply = async (parentCommentId: string, replyContent: string) => {
    if (!user?.id || !currentFeatureForComments?.id || !replyContent.trim()) {
      return;
    }

    try {
      // Create the reply using createFeatureComment with parent_comment_id
      const { error } = await FeatureCommentService.createFeatureComment({
        feature_id: currentFeatureForComments.id,
        user_id: user.id,
        content: replyContent.trim(),
        parent_comment_id: parentCommentId,
      });

      if (error) {
        console.error("Error creating reply:", error);
        return;
      }

      // Refresh comments to show the new reply
      setIsLoadingComments(true);
      const { comments: apiComments, error: fetchError } =
        await FeatureCommentService.getFeatureCommentsWithUsers(
          currentFeatureForComments.id,
          true,
          undefined,
          undefined,
          user?.id
        );

      if (fetchError) {
        console.error("Error fetching updated comments:", fetchError);
      } else if (apiComments) {
        const formattedComments = apiComments.map((comment) => ({
          ...comment,
          showReplies: true, // Keep replies open after submitting
          isHearted: comment.user_has_liked || false,
          replies:
            comment.replies?.map((reply) => ({
              ...reply,
              isHearted: reply.user_has_liked || false,
            })) || [],
        }));
        setComments(formattedComments);
      }
      setIsLoadingComments(false);
    } catch (error) {
      console.error("Error in handleSubmitReply:", error);
      setIsLoadingComments(false);
    }
  };

  // Toggle heart for replies
  const toggleReplyHeart = async (commentId: string, replyId: string) => {
    if (!user?.id) {
      // If user is not signed in, close popup and open signup modal
      handlePopupClose();
      handleOpenSignupModal();
      return;
    }

    // Optimistic UI update
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId && comment.replies) {
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === replyId
              ? { ...reply, isHearted: !reply.isHearted }
              : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    );

    try {
      // Call API to toggle like (use replyId, not commentId)
      const { error } = await FeatureCommentLikeService.toggleUserCommentLike(
        replyId,
        user.id
      );

      if (error) {
        console.error("Error toggling reply like:", error);
        // Revert optimistic update on error
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId && comment.replies) {
              const updatedReplies = comment.replies.map((reply) =>
                reply.id === replyId
                  ? { ...reply, isHearted: !reply.isHearted }
                  : reply
              );
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          })
        );
      }
    } catch (error) {
      console.error("Error in toggleReplyHeart:", error);
      // Revert optimistic update on error
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === commentId && comment.replies) {
            const updatedReplies = comment.replies.map((reply) =>
              reply.id === replyId
                ? { ...reply, isHearted: !reply.isHearted }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
    }
  };

  // Define gradient options for alternating cards
  const gradientOptions = [
    "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)", // Teal to Blue
    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)", // Purple to Violet
    "linear-gradient(90.81deg, #E67E22 0.58%, #F39C12 99.31%)", // Orange to Golden
    "linear-gradient(90.81deg, #2ECC71 0.58%, #27AE60 99.31%)", // Light Green to Green
    "linear-gradient(90.81deg, #E74C3C 0.58%, #C0392B 99.31%)", // Light Red to Red
    "linear-gradient(90.81deg, #3498DB 0.58%, #2980B9 99.31%)", // Light Blue to Blue
  ];

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
    },
  ];

  // Update current index based on scroll position
  const updateCurrentIndex = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollLeft = container.scrollLeft;

      // Calculate which card is most visible in the viewport
      const cardWithGap = cardWidth + gap;

      // Use a more precise calculation - find the card that's most centered
      let newIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < featureCards.length; i++) {
        const cardPosition = i * cardWithGap;
        const distance = Math.abs(scrollLeft - cardPosition);
        if (distance < minDistance) {
          minDistance = distance;
          newIndex = i;
        }
      }

      // Only update if the index actually changed
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Add scroll event listener to track current position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initialize current index on mount
      updateCurrentIndex();

      container.addEventListener("scroll", updateCurrentIndex);
      return () => container.removeEventListener("scroll", updateCurrentIndex);
    }
  }, []);

  // Also update when window resizes to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateCurrentIndex, 100); // Small delay to ensure layout is updated
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollPosition = index * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      // Update the current index immediately to prevent UI lag
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      scrollToCard(newIndex);
    }
  };

  const goToNext = () => {
    if (currentIndex < featureCards.length - 1) {
      const newIndex = currentIndex + 1;
      scrollToCard(newIndex);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`pt-10 pb-16 sm:px-6 md:px-50 w-full max-w-full overflow-x-visible relative transition-opacity duration-700 ${
        hasLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-none mx-auto px-4 relative">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Features
        </h2>

        {/* Feature Cards Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth mb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featureCards.map((card, index) => {
            // Find reaction data for this feature
            const reactionData = featureReactions.find((r) => r.id === card.id);

            return (
              <div key={card.id} className="flex-none">
                <FeatureCard
                  id={card.id}
                  title={card.title}
                  description={card.description}
                  images={card.images}
                  gradient={gradientOptions[index % gradientOptions.length]}
                  onSubmitReply={handleSubmitReply}
                  onCommentToggle={handleCommentToggle}
                  isMobile={isMobile}
                  isCommentSidebarOpen={isCommentsPopupOpen}
                  isUserSignedIn={!!user}
                  onOpenSignupModal={handleOpenSignupModal}
                  reactionData={reactionData}
                  isLoadingReactions={isLoadingReactions}
                  onReactionUpdate={handleReactionUpdate}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentIndex === 0
                ? "bg-white/10 cursor-not-allowed"
                : "cursor-pointer hover:opacity-80"
            }`}
            style={{
              backgroundColor: currentIndex === 0 ? undefined : "#323817",
            }}
          >
            <ChevronLeft
              size={26}
              color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "white"}
            />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === featureCards.length - 1}
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentIndex === featureCards.length - 1
                ? "bg-white/10 cursor-not-allowed"
                : "cursor-pointer hover:opacity-80"
            }`}
            style={{
              backgroundColor:
                currentIndex === featureCards.length - 1
                  ? undefined
                  : "#323817",
            }}
          >
            <ChevronRight
              size={26}
              color={
                currentIndex === featureCards.length - 1
                  ? "rgba(255,255,255,0.3)"
                  : "white"
              }
            />
          </button>
        </div>

        {/* Desktop Comments Popup */}
        <DesktopCommentsPopup
          isOpen={isCommentsPopupOpen && !isMobile}
          onClose={handlePopupClose}
          comments={comments}
          featureData={currentFeatureForComments}
          onToggleReplies={toggleReplies}
          onToggleCommentHeart={toggleCommentHeart}
          onToggleReplyHeart={toggleReplyHeart}
          onSubmitReply={handleSubmitReply}
          isUserSignedIn={!!user}
          onOpenSignupModal={handleOpenSignupModal}
          isLoadingComments={isLoadingComments}
        />

        {/* Signup Modal */}
        <ResponsiveSignupModal
          isOpen={isSignupModalOpen}
          onClose={handleCloseSignupModal}
          onSignupSuccess={handleSignupSuccess}
        />
      </div>
    </section>
  );
}
