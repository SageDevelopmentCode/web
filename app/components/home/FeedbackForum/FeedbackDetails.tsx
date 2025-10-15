"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { PresetEmoji } from "../../Twemoji";
import { FeedbackPost, FeedbackComment } from "./types";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";
import { FeedbackCommentService } from "../../../../lib/supabase/feedback_comments";
import FeedbackReplyItem from "./FeedbackReplyItem";

interface FeedbackDetailsProps {
  post: FeedbackPost | null;
  onTogglePostHeart: (postId: number) => Promise<void>;
  onToggleCommentHeart: (commentId: string) => void;
  onToggleReplyHeart: (commentId: string, replyId: string) => void;
  onToggleReplies: (commentId: string) => void;
  isMobile?: boolean;
  isUserSignedIn?: boolean;
  onOpenSignupModal?: () => void;
  userId?: string;
  feedbackId?: string;
  userDisplayName?: string;
  userProfilePicture?: string;
  onCommentAdded?: (comment: FeedbackComment) => void;
  onReplyAdded?: (parentCommentId: string, reply: FeedbackComment) => void;
  onCommentSubmitted?: () => void;
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

export default function FeedbackDetails({
  post,
  onTogglePostHeart,
  onToggleCommentHeart,
  onToggleReplyHeart,
  onToggleReplies,
  isMobile = false,
  isUserSignedIn = false,
  onOpenSignupModal = () => {},
  userId,
  feedbackId,
  userDisplayName,
  userProfilePicture,
  onCommentAdded = () => {},
  onReplyAdded = () => {},
  onCommentSubmitted = () => {},
}: FeedbackDetailsProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [animatingHeart, setAnimatingHeart] = useState<string | null>(null);
  const [activeReplyInput, setActiveReplyInput] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isContentScrollable, setIsContentScrollable] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Check if scrolling is needed and handle scroll hint
  useEffect(() => {
    const checkScrollable = () => {
      if (isMobile) {
        const container = mobileScrollContainerRef.current;
        if (container) {
          const isScrollable = container.scrollHeight > container.clientHeight;
          setIsContentScrollable(isScrollable);
        }
      } else {
        const container = commentsContainerRef.current;
        if (container) {
          const isScrollable = container.scrollHeight > container.clientHeight;
          setShowScrollHint(isScrollable);
        }
      }
    };

    checkScrollable();
    // Add a small delay to ensure content is rendered
    const timer = setTimeout(checkScrollable, 100);
    return () => clearTimeout(timer);
  }, [post?.comments, isMobile]);

  // Handle scroll to hide hint
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && container.scrollTop > 20) {
      setShowScrollHint(false);
    }
  };

  // Handle touch events to prevent scrolling when content doesn't need it
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isContentScrollable) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isContentScrollable) {
      e.preventDefault();
    }
  };

  // Clean up floating emojis after animation
  useEffect(() => {
    if (floatingEmojis.length > 0) {
      const timer = setTimeout(() => {
        setFloatingEmojis([]);
        setAnimatingHeart(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [floatingEmojis]);

  // Function to create floating emoji animation
  const createEmojiFlurry = (buttonId: string) => {
    const button = buttonRefs.current[buttonId];
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = button
      .closest(".feedback-details-container")
      ?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate button position relative to container
    const startX = buttonRect.left + buttonRect.width / 2 - containerRect.left;
    const startY = buttonRect.top + buttonRect.height / 2 - containerRect.top;

    const newEmojis: FloatingEmoji[] = [];
    for (let i = 0; i < 6; i++) {
      newEmojis.push({
        id: Math.random(),
        emoji: "2764",
        startX,
        startY,
        x: Math.random() * 80 - 40, // Random x spread (-40 to 40)
        y: -(Math.random() * 60 + 40), // Upward movement (-40 to -100)
        delay: Math.random() * 0.2, // Random delay (0 to 0.2s)
      });
    }
    setFloatingEmojis(newEmojis);
  };

  // Enhanced heart handlers
  const handlePostHeartClick = async () => {
    if (!post) return;
    const buttonId = `post-${post.id}`;

    // Only show animation if user is signed in
    if (isUserSignedIn) {
      setAnimatingHeart(buttonId);
      createEmojiFlurry(buttonId);
    }

    await onTogglePostHeart(post.id);
  };

  const handleCommentHeartClick = (commentId: string) => {
    const buttonId = `comment-${commentId}`;
    setAnimatingHeart(buttonId);
    createEmojiFlurry(buttonId);
    onToggleCommentHeart(commentId);
  };

  const handleReplyHeartClick = (commentId: string, replyId: string) => {
    const buttonId = `reply-${commentId}-${replyId}`;
    setAnimatingHeart(buttonId);
    createEmojiFlurry(buttonId);
    onToggleReplyHeart(commentId, replyId);
  };

  // Reply input handlers
  const handleReplySubmit = async (
    parentCommentId: string,
    replyContent: string
  ) => {
    if (!replyContent.trim()) return;

    // Check if user is signed in
    if (!isUserSignedIn || !userId) {
      onOpenSignupModal();
      return;
    }

    // Check if we have the feedback ID
    if (!feedbackId) {
      console.error("Feedback ID is required to submit a reply");
      return;
    }

    const contentToSubmit = replyContent.trim();

    // Create optimistic reply
    const optimisticReply: FeedbackComment = {
      id: `temp-${Date.now()}`,
      username: userDisplayName || "You",
      content: contentToSubmit,
      timestamp: "Just now",
      heartsCount: 0,
      isHearted: false,
      replies: [],
      showReplies: false,
    };

    // Optimistically update UI immediately
    onReplyAdded(parentCommentId, optimisticReply);

    // Submit to backend in the background (non-blocking)
    try {
      const { comment, error } =
        await FeedbackCommentService.createFeedbackComment({
          feedback_id: feedbackId,
          user_id: userId,
          content: contentToSubmit,
          parent_comment_id: parentCommentId, // Set parent for nested reply
        });

      if (error) {
        console.error("Error creating reply:", error);
        // TODO: Show error toast/notification to user
      } else {
        console.log("Reply created successfully:", comment);
      }

      // Silently refetch in the background to sync with server data
      onCommentSubmitted();
    } catch (error) {
      console.error("Failed to submit reply:", error);
      // Keep the optimistic update visible even on error
    }
  };

  const handleReplyCancel = () => {
    setActiveReplyInput(null);
    setReplyText("");
  };

  // Handle main comment submission with optimistic update
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    // Check if user is signed in
    if (!isUserSignedIn || !userId) {
      onOpenSignupModal();
      return;
    }

    // Check if we have the feedback ID
    if (!feedbackId) {
      console.error("Feedback ID is required to submit a comment");
      return;
    }

    const contentToSubmit = commentText.trim();

    // Create optimistic comment
    const optimisticComment: FeedbackComment = {
      id: `temp-${Date.now()}`, // Temporary ID
      username: userDisplayName || "You",
      content: contentToSubmit,
      timestamp: "Just now",
      heartsCount: 0,
      isHearted: false,
      replies: [],
      showReplies: false,
    };

    // Optimistically update UI immediately
    onCommentAdded(optimisticComment);
    setCommentText(""); // Clear input immediately for better UX
    setIsSubmittingComment(false); // Remove loading state immediately

    // Submit to backend in the background (non-blocking)
    try {
      const { comment, error } =
        await FeedbackCommentService.createFeedbackComment({
          feedback_id: feedbackId,
          user_id: userId,
          content: contentToSubmit,
          parent_comment_id: null, // This is a top-level comment
        });

      if (error) {
        console.error("Error creating comment:", error);
        // TODO: Show error toast/notification to user
        // Note: We keep the optimistic comment even on error since it was "submitted"
      } else {
        console.log("Comment created successfully:", comment);
      }

      // Silently refetch in the background to sync with server data
      onCommentSubmitted();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // Keep the optimistic update visible even on error
    }
  };

  if (!post) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <PresetEmoji
              type="SPEECH_BUBBLE"
              size={48}
              style={{ filter: "grayscale(1)" }}
            />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Select a feedback post
          </h3>
          <p className="text-gray-400 text-sm">
            Choose a post from the left to view details and comments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col feedback-details-container relative">
      {/* Scrollable content wrapper for mobile, or normal layout for desktop */}
      <div
        ref={isMobile ? mobileScrollContainerRef : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        className={
          isMobile
            ? "overflow-y-auto flex-1 scrollbar-hide"
            : "flex flex-col h-full"
        }
        style={{}}
      >
        {/* Post Header */}
        <div className={`mb-6 pb-6  ${isMobile ? "" : "flex-shrink-0"}`}>
          {/* User Info Row */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-300"
              style={{ backgroundColor: "#D6E5E2" }}
            >
              {post.profile_picture ? (
                <Image
                  src={getCharacterImageSrc(post.profile_picture)}
                  alt={post.profile_picture}
                  width={200}
                  height={200}
                  className="w-auto h-full object-cover opacity-100 grayscale-0"
                  style={getCharacterImageStyles(post.profile_picture)}
                  quality={100}
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {post.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              )}
            </div>
            <div>
              <span className="text-white text-base font-medium">
                {post.username}
              </span>
              <span className="text-gray-400 text-sm ml-2">
                {post.timestamp}
              </span>
            </div>
          </div>

          <h1 className="text-white text-2xl font-bold mb-3">{post.title}</h1>
          <p className="text-gray-300 text-base leading-relaxed mb-4">
            {post.description}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => {
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
                    className="px-3 py-1.5 text-sm rounded-full font-medium capitalize"
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

          {/* Post Actions */}
          <div className="flex items-center gap-3">
            <button
              ref={(el) => {
                buttonRefs.current[`post-${post.id}`] = el;
              }}
              onClick={handlePostHeartClick}
              className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: post.isHearted ? "transparent" : "#282828",
                background: post.isHearted
                  ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                  : "#282828",
              }}
            >
              <PresetEmoji type="HEART" size={16} />
              <span className="text-white font-medium">{post.heartsCount}</span>
            </button>
            <div
              className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-sm"
              style={{ backgroundColor: "#282828" }}
            >
              <PresetEmoji type="SPEECH_BUBBLE" size={16} />
              <span className="text-white font-medium">
                {post.commentsCount} Comments
              </span>
            </div>
          </div>
        </div>

        {/* Comments Header */}
        <div className={`mb-4 ${isMobile ? "" : "flex-shrink-0"}`}>
          <h4 className="text-white font-semibold text-lg">
            Comments ({post.comments.length})
          </h4>
        </div>

        {/* Mobile Comment Input - Below Comments Header */}
        {isMobile && (
          <div className="mb-6 border-gray-700">
            {isUserSignedIn ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmittingComment) {
                      handleCommentSubmit();
                    }
                  }}
                  disabled={isSubmittingComment}
                  className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  style={{ backgroundColor: "#4B5563" }}
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSignupModal}
                className="w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: "#778554",
                  boxShadow: "0px 4px 0px 1px #57613B",
                  borderRadius: "15px",
                }}
              >
                Sign up or login to comment
              </button>
            )}
          </div>
        )}

        {/* Comments List */}
        <div
          ref={commentsContainerRef}
          onScroll={handleScroll}
          className={`space-y-6 scrollbar-hide relative ${
            isMobile ? "" : "flex-1 overflow-y-auto min-h-0"
          }`}
        >
          {post.comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {/* Main Comment */}
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {comment.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm font-medium">
                      {comment.username}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center space-x-4 pt-2">
                    <button
                      ref={(el) => {
                        buttonRefs.current[`comment-${comment.id}`] = el;
                      }}
                      onClick={() => handleCommentHeartClick(comment.id)}
                      className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: comment.isHearted
                          ? "transparent"
                          : "#282828",
                        background: comment.isHearted
                          ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                          : "#282828",
                      }}
                    >
                      <PresetEmoji type="HEART" size={14} />
                      <span className="text-white font-medium">
                        {comment.heartsCount}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (!isUserSignedIn) {
                          onOpenSignupModal();
                        } else {
                          setActiveReplyInput(
                            activeReplyInput === comment.id ? null : comment.id
                          );
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-white text-sm transition-colors hover:bg-gray-600 cursor-pointer"
                      style={{ backgroundColor: "#282828" }}
                    >
                      Reply
                    </button>
                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        onClick={() => onToggleReplies(comment.id)}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {comment.showReplies ? "Hide" : "View"}{" "}
                        {comment.replies.length} Replies
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // Handle more options menu for comment
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-600 transition-all duration-200 cursor-pointer ml-auto"
                      style={{ backgroundColor: "#282828" }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reply Input for Comment */}
              {activeReplyInput === comment.id && (
                <div className="ml-12 mt-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Reply to ${comment.username}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ backgroundColor: "#4B5563" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && replyText.trim()) {
                          handleReplySubmit(comment.id, replyText);
                          setReplyText("");
                          setActiveReplyInput(null);
                        }
                      }}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <button
                        onClick={() => {
                          if (replyText.trim()) {
                            handleReplySubmit(comment.id, replyText);
                            setReplyText("");
                            setActiveReplyInput(null);
                          }
                        }}
                        className="text-white hover:text-purple-400 cursor-pointer transition-all duration-300 p-1"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={handleReplyCancel}
                        className="text-gray-400 hover:text-white cursor-pointer transition-all duration-300 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.showReplies &&
                comment.replies &&
                comment.replies.length > 0 && (
                  <div className="ml-12 space-y-4 border-l-2 border-gray-700 pl-6">
                    {comment.replies.map((reply) => (
                      <FeedbackReplyItem
                        key={reply.id}
                        reply={reply}
                        parentCommentId={comment.id}
                        activeReplyInput={activeReplyInput}
                        setActiveReplyInput={setActiveReplyInput}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onToggleReplyHeart={onToggleReplyHeart}
                        onSubmitReply={handleReplySubmit}
                        onToggleReplies={onToggleReplies}
                        buttonRefs={buttonRefs}
                        handleReplyHeartClick={handleReplyHeartClick}
                        handleReplyCancel={handleReplyCancel}
                        isUserSignedIn={isUserSignedIn}
                        onClose={() => {}}
                        onOpenSignupModal={onOpenSignupModal}
                      />
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Scroll Hint */}
        {!isMobile && showScrollHint && post.comments.length > 3 && (
          <div className="text-center py-2">
            <p className="text-gray-400 text-xs">
              Scroll to view more comments
            </p>
          </div>
        )}

        {/* Comment Input - Desktop only (mobile version is positioned fixed below) */}
        {!isMobile && (
          <div className="mt-2 pt-2 flex-shrink-0">
            {isUserSignedIn ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmittingComment) {
                      handleCommentSubmit();
                    }
                  }}
                  disabled={isSubmittingComment}
                  className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  style={{ backgroundColor: "#4B5563" }}
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSignupModal}
                className="w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: "#778554",
                  boxShadow: "0px 4px 0px 1px #57613B",
                  borderRadius: "15px",
                }}
              >
                Sign up or login to comment
              </button>
            )}
          </div>
        )}
      </div>

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
            <PresetEmoji type="HEART" size={16} />
          </div>
        </div>
      ))}

      {/* CSS Styles */}
      <style jsx>{`
        /* Hide scrollbar while keeping scroll functionality */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

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
  );
}
