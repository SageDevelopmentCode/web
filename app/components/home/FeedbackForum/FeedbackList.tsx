"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { PresetEmoji } from "../../Twemoji";
import { FeedbackPost } from "./types";

interface FeedbackListProps {
  posts: FeedbackPost[];
  selectedPostId: number | null;
  onSelectPost: (postId: number) => void;
  onToggleHeart: (postId: number) => void;
  isMobile?: boolean;
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

export default function FeedbackList({
  posts,
  selectedPostId,
  onSelectPost,
  onToggleHeart,
  isMobile = false,
}: FeedbackListProps) {
  const [activeFilter, setActiveFilter] = useState<
    "top" | "new" | "upcoming" | "all"
  >("all");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [animatingHeart, setAnimatingHeart] = useState<number | null>(null);
  const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts.filter((post) => post.category === activeFilter);

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
  const createEmojiFlurry = (postId: number) => {
    const button = buttonRefs.current[postId];
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const containerRect = button
      .closest(".feedback-list-container")
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

  // Enhanced heart handler
  const handleHeartClick = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    setAnimatingHeart(postId);
    createEmojiFlurry(postId);
    onToggleHeart(postId);
  };

  return (
    <div
      className={`w-full h-full flex flex-col feedback-list-container relative ${
        isMobile ? "pb-4" : ""
      }`}
    >
      {/* Filter Tabs - Fixed position in mobile */}
      <div
        className={`flex rounded-xl p-0 flex-shrink-0 ${
          isMobile ? "sticky top-0 z-10 mb-4 mx-4" : "mb-6"
        }`}
        style={{ backgroundColor: "#4D5915" }}
      >
        <button
          onClick={() => setActiveFilter("all")}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all text-white flex-1 cursor-pointer"
          style={{
            backgroundColor: activeFilter === "all" ? "#7A873D" : "transparent",
          }}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter("top")}
          className={`px-4 ${
            isMobile ? "py-2" : "py-3"
          } rounded-xl text-sm font-medium transition-all text-white flex items-center justify-center ${
            isMobile ? "" : "gap-2"
          } flex-1 cursor-pointer`}
          style={{
            backgroundColor: activeFilter === "top" ? "#7A873D" : "transparent",
          }}
        >
          {!isMobile && <PresetEmoji type="TOP" size={20} />}
          Top
        </button>
        <button
          onClick={() => setActiveFilter("new")}
          className={`px-4 ${
            isMobile ? "py-2" : "py-3"
          } rounded-xl text-sm font-medium transition-all text-white flex items-center justify-center ${
            isMobile ? "" : "gap-2"
          } flex-1 cursor-pointer`}
          style={{
            backgroundColor: activeFilter === "new" ? "#7A873D" : "transparent",
          }}
        >
          {!isMobile && <PresetEmoji type="NEW" size={20} />}
          New
        </button>
        <button
          onClick={() => setActiveFilter("upcoming")}
          className={`px-4 ${
            isMobile ? "py-2" : "py-3"
          } rounded-xl text-sm font-medium transition-all text-white flex items-center justify-center ${
            isMobile ? "" : "gap-2"
          } flex-1 cursor-pointer`}
          style={{
            backgroundColor:
              activeFilter === "upcoming" ? "#7A873D" : "transparent",
          }}
        >
          {!isMobile && <PresetEmoji type="UPCOMING" size={20} />}
          Upcoming
        </button>
      </div>

      {/* Posts List */}
      <div
        className={`flex-1 overflow-y-auto space-y-4 scrollbar-hide min-h-0 ${
          isMobile ? "px-4" : ""
        }`}
      >
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post.id)}
            className="p-4 rounded-2xl cursor-pointer transition-all duration-200"
            style={{
              backgroundColor:
                selectedPostId === post.id ? "#7A873D" : "#323817",
            }}
          >
            {/* Post Content */}
            <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-300 text-sm line-clamp-3 mb-3">
              {post.description}
            </p>

            {/* Combined User Info and Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {post.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
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
                  ref={(el) => {
                    buttonRefs.current[post.id] = el;
                  }}
                  onClick={(e) => handleHeartClick(e, post.id)}
                  className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: post.isHearted ? "transparent" : "#282828",
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
                {!isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle more options menu
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "#282828" }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
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

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
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
