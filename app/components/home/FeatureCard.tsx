"use client";

import { useState, useEffect, useRef } from "react";
import { Twemoji } from "../Twemoji";
import { Send } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

type ReactionType = "dislike" | "meh" | "neutral" | "like" | "love";

interface FeatureCardProps {
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  gradient?: string;
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

export default function FeatureCard({
  title,
  description,
  images,
  gradient = "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)",
}: FeatureCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    null
  );
  const [isCommentPressed, setIsCommentPressed] = useState<boolean>(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [animatingReaction, setAnimatingReaction] =
    useState<ReactionType | null>(null);
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
  const handleReactionClick = (reactionType: ReactionType, emoji: string) => {
    setSelectedReaction(reactionType);
    setAnimatingReaction(reactionType);
    createEmojiFlurry(emoji, reactionType);
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

  return (
    <div className="flex justify-center">
      <div
        className={`feature-card-container rounded-3xl p-6 flex relative ${
          isCommentPressed ? "flex-row gap-6" : "flex-col gap-6"
        }`}
        style={{
          backgroundColor: "#323817",
          width: isCommentPressed ? "1000px" : "640px",
        }}
      >
        {/* Main Content Container */}
        <div
          className={`flex flex-col gap-6 flex-shrink-0 ${
            isCommentPressed ? "w-[640px]" : "w-full"
          }`}
          style={{ height: "100%" }}
        >
          {/* Inner Gradient Rectangle */}
          <div
            className="w-full px-8 h-28 flex flex-col justify-center text-left"
            style={{
              background: gradient,
              borderRadius: "30px",
            }}
          >
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">
              {title}
            </h3>
            <p className="text-white text-sm md:text-base">{description}</p>
          </div>

          {/* Phone Mockups */}
          <div className="flex justify-center gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className="w-[35%] h-auto object-contain"
              />
            ))}
          </div>

          {/* Reaction Buttons */}
          <div className="flex justify-between items-start mt-2">
            {/* Left side - Reaction emojis */}
            <div className="flex gap-4">
              {[
                {
                  type: "dislike" as ReactionType,
                  emoji: "1f44e",
                  label: "Dislike",
                },
                { type: "meh" as ReactionType, emoji: "1fae4", label: "Meh" },
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
              ].map((reaction) => (
                <div
                  key={reaction.type}
                  className="flex flex-col items-center gap-2"
                >
                  <button
                    ref={(el) => {
                      buttonRefs.current[reaction.type] = el;
                    }}
                    onClick={() =>
                      handleReactionClick(reaction.type, reaction.emoji)
                    }
                    className="px-4 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-110 active:scale-95"
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
                    <Twemoji hex={reaction.emoji} size={24} />
                  </button>
                  <span className="text-xs font-medium text-white text-center">
                    {reaction.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Right side - Comment button */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setIsCommentPressed(!isCommentPressed)}
                className="px-4 py-4 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: isCommentPressed ? "white" : "#2D301F",
                }}
              >
                <Twemoji hex="1f4ac" size={24} />
              </button>
              <span className="text-xs font-medium text-white text-center"></span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {isCommentPressed && (
          <div
            className="w-[300px] flex-shrink-0 bg-[#1a1a1a] rounded-3xl py-6 px-5 flex flex-col"
            style={{ height: "calc(100% - 0px)" }}
          >
            {/* Comments Header */}
            <div className="flex items-center justify-between mb-4 pb-3">
              <h4 className="text-white font-semibold text-lg">
                See what others are saying
              </h4>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm font-medium">
                          {comment.username}
                        </span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center space-x-4 pt-1">
                        <button
                          onClick={() => toggleCommentHeart(comment.id)}
                          className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                            comment.isHearted
                              ? "text-red-500 hover:text-red-400"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {comment.isHearted ? (
                            <FavoriteIcon sx={{ fontSize: 20 }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                          )}
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors text-sm">
                          Reply
                        </button>
                        {comment.replies && comment.replies.length > 0 && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
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
                      <div className="ml-11 space-y-3 border-l-2 border-gray-700 pl-4">
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
                              </div>
                              <p className="text-white text-sm leading-relaxed">
                                {reply.content}
                              </p>
                              <div className="flex items-center space-x-4 pt-1">
                                <button
                                  onClick={() =>
                                    toggleReplyHeart(comment.id, reply.id)
                                  }
                                  className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                                    reply.isHearted
                                      ? "text-red-500 hover:text-red-400"
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  {reply.isHearted ? (
                                    <FavoriteIcon sx={{ fontSize: 16 }} />
                                  ) : (
                                    <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                                  )}
                                </button>
                                <button className="text-gray-400 hover:text-white transition-colors text-sm">
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

            {/* Comment Input */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Say Something..."
                  className="w-full text-white placeholder-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ backgroundColor: "#4B5563" }}
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

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
