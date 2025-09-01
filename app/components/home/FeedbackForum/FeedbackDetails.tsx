"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { PresetEmoji } from "../../Twemoji";
import { FeedbackPost, FeedbackComment } from "./types";

interface FeedbackDetailsProps {
  post: FeedbackPost | null;
  onTogglePostHeart: (postId: number) => void;
  onToggleCommentHeart: (commentId: number) => void;
  onToggleReplyHeart: (commentId: number, replyId: number) => void;
  onToggleReplies: (commentId: number) => void;
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
}: FeedbackDetailsProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [animatingHeart, setAnimatingHeart] = useState<string | null>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Check if scrolling is needed and handle scroll hint
  useEffect(() => {
    const checkScrollable = () => {
      const container = commentsContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setShowScrollHint(isScrollable);
      }
    };

    checkScrollable();
  }, [post?.comments]);

  // Handle scroll to hide hint
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && container.scrollTop > 20) {
      setShowScrollHint(false);
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
  const handlePostHeartClick = () => {
    if (!post) return;
    const buttonId = `post-${post.id}`;
    setAnimatingHeart(buttonId);
    createEmojiFlurry(buttonId);
    onTogglePostHeart(post.id);
  };

  const handleCommentHeartClick = (commentId: number) => {
    const buttonId = `comment-${commentId}`;
    setAnimatingHeart(buttonId);
    createEmojiFlurry(buttonId);
    onToggleCommentHeart(commentId);
  };

  const handleReplyHeartClick = (commentId: number, replyId: number) => {
    const buttonId = `reply-${commentId}-${replyId}`;
    setAnimatingHeart(buttonId);
    createEmojiFlurry(buttonId);
    onToggleReplyHeart(commentId, replyId);
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
      {/* Post Header */}
      <div className="mb-6 pb-6 border-b border-gray-700 flex-shrink-0">
        {/* User Info Row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {post.username
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <span className="text-white text-base font-medium">
              {post.username}
            </span>
            <span className="text-gray-400 text-sm ml-2">{post.timestamp}</span>
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold mb-3">{post.title}</h1>
        <p className="text-gray-300 text-base leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Post Actions */}
        <div className="flex items-center gap-4">
          <button
            ref={(el) => {
              buttonRefs.current[`post-${post.id}`] = el;
            }}
            onClick={handlePostHeartClick}
            className="px-4 py-3 rounded-xl flex items-center gap-2 text-base transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: post.isHearted ? "transparent" : "#282828",
              background: post.isHearted
                ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                : "#282828",
            }}
          >
            <PresetEmoji type="HEART" size={20} />
            <span className="text-white font-medium">{post.heartsCount}</span>
          </button>
          <div
            className="px-4 py-3 rounded-xl flex items-center gap-2 text-base"
            style={{ backgroundColor: "#282828" }}
          >
            <PresetEmoji type="SPEECH_BUBBLE" size={20} />
            <span className="text-white font-medium">
              {post.commentsCount} Comments
            </span>
          </div>
        </div>
      </div>

      {/* Comments Header */}
      <div className="mb-4 flex-shrink-0">
        <h4 className="text-white font-semibold text-lg">
          Comments ({post.comments.length})
        </h4>
      </div>

      {/* Comments List */}
      <div
        ref={commentsContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-6 scrollbar-hide relative min-h-0"
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
                    className="px-3 py-2 rounded-xl flex items-center gap-1 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
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
                  </button>
                  <button
                    className="px-3 py-2 rounded-xl text-white text-sm transition-colors hover:bg-gray-600"
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
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.showReplies &&
              comment.replies &&
              comment.replies.length > 0 && (
                <div className="ml-12 space-y-4 border-l-2 border-gray-700 pl-6">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {reply.username.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 text-sm font-medium">
                            {reply.username}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">
                          {reply.content}
                        </p>
                        <div className="flex items-center space-x-4 pt-2">
                          <button
                            ref={(el) => {
                              buttonRefs.current[
                                `reply-${comment.id}-${reply.id}`
                              ] = el;
                            }}
                            onClick={() =>
                              handleReplyHeartClick(comment.id, reply.id)
                            }
                            className="px-3 py-2 rounded-xl flex items-center gap-1 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
                            style={{
                              backgroundColor: reply.isHearted
                                ? "transparent"
                                : "#282828",
                              background: reply.isHearted
                                ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                                : "#282828",
                            }}
                          >
                            <PresetEmoji type="HEART" size={12} />
                          </button>
                          <button
                            className="px-3 py-2 rounded-xl text-white text-sm transition-colors hover:bg-gray-600"
                            style={{ backgroundColor: "#282828" }}
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Scroll Hint */}
      {showScrollHint && post.comments.length > 3 && (
        <div className="text-center py-2">
          <p className="text-gray-400 text-xs">Scroll to view more comments</p>
        </div>
      )}

      {/* Comment Input */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ backgroundColor: "#4B5563" }}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300">
            <Send size={20} />
          </button>
        </div>
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
