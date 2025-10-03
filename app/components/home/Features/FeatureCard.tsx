"use client";

import { useState, useEffect, useRef } from "react";
import { Twemoji } from "../../Twemoji";
import MobileComments from "./MobileComments";
import {
  FeatureReactionService,
  ReactionType,
} from "../../../../lib/supabase/feature_reactions";
import { FeatureCommentService } from "../../../../lib/supabase/feature_comments";
import { useAuth } from "../../../../contexts/auth-context";

interface FeatureCardProps {
  id: string;
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  gradient?: string;
  onCommentToggle?: (
    isOpen: boolean,
    featureData?: {
      id: string;
      title: string;
      images: { src: string; alt: string }[];
    }
  ) => void;
  isMobile?: boolean;
  isCommentSidebarOpen?: boolean;
  isUserSignedIn?: boolean;
  onOpenSignupModal?: () => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  delay: number;
}

interface Comment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  replies?: Reply[];
  showReplies?: boolean;
  isHearted?: boolean;
}

interface Reply {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isHearted?: boolean;
}

interface CounterAnimationProps {
  target: number;
  duration?: number;
}

// Counter Animation Component
function CounterAnimation({ target, duration = 1000 }: CounterAnimationProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * target);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);

  return <span>{count}</span>;
}

export default function FeatureCard({
  id,
  title,
  description,
  images,
  gradient = "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)",
  onCommentToggle,
  isMobile = false,
  isCommentSidebarOpen = false,
  isUserSignedIn = false,
  onOpenSignupModal,
}: FeatureCardProps) {
  const { user } = useAuth();
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    null
  );
  const [isCommentPressed, setIsCommentPressed] = useState<boolean>(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [animatingReaction, setAnimatingReaction] =
    useState<ReactionType | null>(null);
  const [showReactionCounts, setShowReactionCounts] = useState<boolean>(false);
  const [isClosingBottomSheet, setIsClosingBottomSheet] =
    useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  // Dynamic reaction counts from API
  const [reactionCounts, setReactionCounts] = useState({
    love: 0,
    like: 0,
    neutral: 0,
    dislike: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [hasUserReacted, setHasUserReacted] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [
        {
          id: 1,
          username: "Sarah M • 4d",
          content: "I completely agree! This verse really touched me too.",
          timestamp: "4d",
          isHearted: false,
        },
        {
          id: 2,
          username: "David L • 3d",
          content: "Such a powerful message. Thanks for sharing your thoughts!",
          timestamp: "3d",
          isHearted: false,
        },
      ],
    },
    {
      id: 2,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [
        {
          id: 3,
          username: "Mary J • 2d",
          content: "Beautiful reflection. God bless!",
          timestamp: "2d",
          isHearted: false,
        },
      ],
    },
    {
      id: 3,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [],
    },
    {
      id: 4,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [],
    },
  ]);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Sync comment button state with sidebar state
  useEffect(() => {
    if (!isMobile && !isCommentSidebarOpen && isCommentPressed) {
      setIsCommentPressed(false);
    }
  }, [isCommentSidebarOpen, isMobile, isCommentPressed]);

  // Handle overlay timing for bottom sheet
  useEffect(() => {
    if (isCommentPressed && isMobile) {
      // Small delay to allow the sheet to start sliding up before showing overlay
      setTimeout(() => setShowOverlay(true), 50);
    } else {
      setShowOverlay(false);
    }
  }, [isCommentPressed, isMobile]);

  // Load initial reaction counts and check user reaction on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load reaction counts
        const { counts, error: countsError } =
          await FeatureReactionService.getFeatureReactionCounts(id);
        if (countsError) {
          console.error("Error fetching initial reaction counts:", countsError);
        } else {
          setReactionCounts(counts);
          // Show reaction counts if there are any reactions
          const hasAnyReactions = Object.values(counts).some(
            (count) => count > 0
          );
          setShowReactionCounts(hasAnyReactions);
        }

        // Check if user has reacted (only if user is signed in)
        if (user?.id) {
          const {
            hasReacted,
            reaction,
            error: reactionError,
          } = await FeatureReactionService.hasUserReactedToFeature(id, user.id);

          if (reactionError) {
            console.error("Error checking user reaction:", reactionError);
          } else {
            setHasUserReacted(hasReacted);
            setUserReaction(reaction);
            setSelectedReaction(reaction);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [id, user?.id]);

  // Handle user authentication state changes
  useEffect(() => {
    if (!user?.id) {
      // User logged out - reset reaction state
      setUserReaction(null);
      setHasUserReacted(false);
      setSelectedReaction(null);
    }
  }, [user?.id]);

  // Clean up floating emojis after animation
  useEffect(() => {
    if (floatingEmojis.length > 0) {
      const timer = setTimeout(() => {
        setFloatingEmojis([]);
        setAnimatingReaction(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [floatingEmojis]);

  // Function to create floating emoji animation
  const createEmojiFlurry = (emoji: string, reactionType: ReactionType) => {
    const button = buttonRefs.current[reactionType];
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = button
      .closest(".feature-card-container")
      ?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate button position relative to container
    const startX = buttonRect.left + buttonRect.width / 2 - containerRect.left;
    const startY = buttonRect.top + buttonRect.height / 2 - containerRect.top;

    const newEmojis: FloatingEmoji[] = [];
    for (let i = 0; i < 8; i++) {
      newEmojis.push({
        id: Math.random(),
        emoji,
        startX,
        startY,
        x: Math.random() * 120 - 60, // Random x spread (-60 to 60)
        y: -(Math.random() * 100 + 80), // Upward movement (-80 to -180)
        delay: Math.random() * 0.3, // Random delay (0 to 0.3s)
      });
    }
    setFloatingEmojis(newEmojis);
  };

  // Enhanced reaction handler
  const handleReactionClick = async (
    reactionType: ReactionType,
    emoji: string
  ) => {
    setSelectedReaction(reactionType);
    setAnimatingReaction(reactionType);
    setShowReactionCounts(true);
    createEmojiFlurry(emoji, reactionType);

    // Check if user is signed in
    if (!user?.id) {
      console.log("User not signed in, cannot react");
      return;
    }

    // Call toggleUserReaction with feature id, user id, and reaction
    try {
      const { reaction, error } =
        await FeatureReactionService.toggleUserReaction(
          id,
          user.id,
          reactionType
        );

      if (error) {
        console.error("Error toggling user reaction:", error);
      } else {
        console.log("Toggle reaction response for feature", id, ":", reaction);

        // Update user reaction state
        if (reaction) {
          // User added or changed reaction
          setUserReaction(reactionType);
          setHasUserReacted(true);
          setSelectedReaction(reactionType);
        } else {
          // User removed reaction
          setUserReaction(null);
          setHasUserReacted(false);
          setSelectedReaction(null);
        }
      }
    } catch (error) {
      console.error("Error in handleReactionClick:", error);
    }

    // Also call getFeatureReactionCounts to see updated counts
    try {
      const { counts, error } =
        await FeatureReactionService.getFeatureReactionCounts(id);
      if (error) {
        console.error("Error fetching reaction counts:", error);
      } else {
        console.log("Updated reaction counts for feature", id, ":", counts);
        // Update the state with the actual counts from the API
        setReactionCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching reaction counts:", error);
    }
  };

  // Toggle replies visibility
  const toggleReplies = (commentId: number) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, showReplies: !comment.showReplies }
          : comment
      )
    );
  };

  // Toggle heart for comments
  const toggleCommentHeart = (commentId: number) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, isHearted: !comment.isHearted }
          : comment
      )
    );
  };

  // Toggle heart for replies
  const toggleReplyHeart = (commentId: number, replyId: number) => {
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
  };

  // Handle bottom sheet close with animation
  const handleCloseBottomSheet = () => {
    setIsClosingBottomSheet(true);
    setTimeout(() => {
      setIsCommentPressed(false);
      setIsClosingBottomSheet(false);
    }, 300); // Match the animation duration
  };

  return (
    <div className="flex justify-center">
      <div
        className={`feature-card-container rounded-3xl flex flex-col gap-6 relative ${
          isMobile ? "p-4" : "p-6"
        }`}
        style={{
          backgroundColor: "#323817",
          width: isMobile ? "340px" : "540px",
          height: isMobile ? "520px" : "590px",
        }}
      >
        {/* Main Content Container */}
        <div
          className="flex flex-col flex-shrink-0 gap-6 w-full"
          style={{
            height: "100%",
          }}
        >
          {/* Inner Gradient Rectangle */}
          <div
            className={`w-full flex items-center ${
              isMobile ? "px-4 h-24" : "px-8 h-28"
            }`}
            style={{
              background: gradient,
              borderRadius: isMobile ? "20px" : "30px",
            }}
          >
            {/* Text content - 80% of the width */}
            <div
              className="flex flex-col justify-center text-left"
              style={{ width: "90%" }}
            >
              <h3
                className={`font-extrabold text-white ${
                  isMobile ? "text-lg" : "text-xl md:text-2xl mb-2"
                }`}
              >
                {title}
              </h3>
              {!isMobile && (
                <p className="text-white text-sm md:text-base">{description}</p>
              )}
            </div>

            {/* Comment button - 20% of the width */}
            <div
              className="flex justify-center items-center"
              style={{ width: "10%" }}
            >
              <button
                onClick={async () => {
                  const newState = !isCommentPressed;
                  setIsCommentPressed(newState);

                  // If opening comments, fetch comments from API
                  if (newState) {
                    try {
                      const { comments, error } =
                        await FeatureCommentService.getFeatureCommentsWithUsers(
                          id,
                          true
                        );
                      if (error) {
                        console.error(
                          "Error fetching feature comments:",
                          error
                        );
                      } else {
                        console.log(
                          "Feature comments with reply counts:",
                          comments
                        );
                        // Log reply counts for each comment
                        if (comments) {
                          comments.forEach((comment, index) => {
                            console.log(
                              `Comment ${index + 1} (${comment.id}): ${
                                comment.reply_count
                              } replies`
                            );
                          });
                        }
                      }
                    } catch (error) {
                      console.error("Error in comment fetch:", error);
                    }
                  }

                  if (onCommentToggle) {
                    onCommentToggle(newState, { id, title, images });
                  }
                }}
                className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isMobile ? "px-3 py-3" : "px-4 py-4"
                }`}
                style={{
                  backgroundColor: isCommentPressed
                    ? "white"
                    : "rgba(255, 255, 255, 0.2)",
                }}
              >
                <Twemoji hex="1f4ac" size={isMobile ? 18 : 24} />
              </button>
            </div>
          </div>

          {/* Phone Mockups and Reaction Buttons */}
          <div
            className={`${
              isMobile
                ? "flex flex-col gap-4"
                : "flex justify-between items-center gap-2"
            }`}
          >
            {/* Phone Mockups */}
            <div
              className={`flex gap-4 ${
                isMobile ? "justify-center" : "justify-start flex-1"
              }`}
            >
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className={`h-auto object-contain ${
                    isMobile ? "w-[150px]" : "w-[200px]"
                  }`}
                />
              ))}
            </div>

            {/* Reaction Buttons */}
            <div
              className={`flex items-center ${
                isMobile ? "flex-row justify-center gap-6" : "flex-col gap-4"
              }`}
            >
              {(isMobile
                ? [
                    {
                      type: "dislike" as ReactionType,
                      emoji: "1f44e",
                      label: "Dislike",
                    },
                    {
                      type: "neutral" as ReactionType,
                      emoji: "1f610",
                      label: "Neutral",
                    },
                    {
                      type: "like" as ReactionType,
                      emoji: "1f44d",
                      label: "Like",
                    },
                    {
                      type: "love" as ReactionType,
                      emoji: "2764",
                      label: "Love It!",
                    },
                  ]
                : [
                    {
                      type: "love" as ReactionType,
                      emoji: "2764",
                      label: "Love It!",
                    },
                    {
                      type: "like" as ReactionType,
                      emoji: "1f44d",
                      label: "Like",
                    },
                    {
                      type: "neutral" as ReactionType,
                      emoji: "1f610",
                      label: "Neutral",
                    },
                    {
                      type: "dislike" as ReactionType,
                      emoji: "1f44e",
                      label: "Dislike",
                    },
                  ]
              ).map((reaction) => (
                <div
                  key={reaction.type}
                  className="flex flex-col items-center gap-1"
                >
                  <button
                    ref={(el) => {
                      buttonRefs.current[reaction.type] = el;
                    }}
                    onClick={() =>
                      handleReactionClick(reaction.type, reaction.emoji)
                    }
                    className={`rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-110 active:scale-95 ${
                      isMobile ? "px-4 py-4" : "px-4 py-4"
                    }`}
                    style={{
                      backgroundColor:
                        selectedReaction === reaction.type
                          ? "transparent"
                          : "#2D301F",
                      background:
                        selectedReaction === reaction.type
                          ? gradient
                          : "#2D301F",
                    }}
                  >
                    <Twemoji hex={reaction.emoji} size={isMobile ? 22 : 24} />
                  </button>
                  <span
                    className={`font-medium text-white text-center ${
                      isMobile ? "text-xs" : "text-xs"
                    }`}
                  >
                    {showReactionCounts ? (
                      <CounterAnimation
                        target={
                          reactionCounts[
                            reaction.type as keyof typeof reactionCounts
                          ] || 0
                        }
                        duration={800}
                      />
                    ) : isMobile ? (
                      reaction.type
                    ) : (
                      reaction.label
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop comments are now handled by sidebar in Features component */}

        {/* Mobile Bottom Sheet - Comments */}
        <MobileComments
          comments={comments}
          isOpen={isCommentPressed && isMobile}
          isClosing={isClosingBottomSheet}
          showOverlay={showOverlay}
          onClose={handleCloseBottomSheet}
          onToggleReplies={toggleReplies}
          onToggleCommentHeart={toggleCommentHeart}
          onToggleReplyHeart={toggleReplyHeart}
          isUserSignedIn={isUserSignedIn}
          onOpenSignupModal={onOpenSignupModal || (() => {})}
        />

        {/* Floating Emoji Animation */}
        {floatingEmojis.map((floatingEmoji) => (
          <div
            key={floatingEmoji.id}
            className="absolute pointer-events-none z-10"
            style={
              {
                left: `${floatingEmoji.startX}px`,
                top: `${floatingEmoji.startY}px`,
                transform: `translate(-50%, -50%)`,
                animation: `floatUpFromButton 2s ease-out ${floatingEmoji.delay}s forwards`,
                "--random-x": `${floatingEmoji.x}px`,
                "--random-y": `${floatingEmoji.y}px`,
              } as React.CSSProperties & {
                "--random-x": string;
                "--random-y": string;
              }
            }
          >
            <div
              className="animate-bounce"
              style={{
                animationDelay: `${floatingEmoji.delay}s`,
                animationDuration: "0.6s",
                animationIterationCount: "3",
              }}
            >
              <Twemoji hex={floatingEmoji.emoji} size={20} />
            </div>
          </div>
        ))}

        {/* CSS Animation Styles */}
        <style jsx>{`
          @keyframes floatUpFromButton {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) translate(0, 0) scale(1);
            }
            25% {
              opacity: 1;
              transform: translate(-50%, -50%)
                translate(
                  calc(var(--random-x) * 0.3),
                  calc(var(--random-y) * 0.3)
                )
                scale(1.1);
            }
            75% {
              opacity: 0.6;
              transform: translate(-50%, -50%)
                translate(
                  calc(var(--random-x) * 0.8),
                  calc(var(--random-y) * 0.8)
                )
                scale(1.2);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%)
                translate(var(--random-x), var(--random-y)) scale(0.7);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
