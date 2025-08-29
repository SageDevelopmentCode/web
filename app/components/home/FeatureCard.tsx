"use client";

import { useState, useEffect, useRef } from "react";
import { Twemoji } from "../Twemoji";

type ReactionType = "dislike" | "meh" | "neutral" | "like" | "love";

interface FeatureCardProps {
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
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

export default function FeatureCard({
  title,
  description,
  images,
}: FeatureCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    null
  );
  const [isCommentPressed, setIsCommentPressed] = useState<boolean>(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [animatingReaction, setAnimatingReaction] =
    useState<ReactionType | null>(null);
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
    const containerRect = button.closest(".w-160")?.getBoundingClientRect();
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

  return (
    <div className="flex justify-center">
      <div
        className="w-160 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden"
        style={{ backgroundColor: "#323817" }}
      >
        {/* Inner Gradient Rectangle */}
        <div
          className="w-full px-6 rounded-2xl h-30 flex flex-col justify-center text-left"
          style={{
            background:
              "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)",
          }}
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
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
              className="w-[37%] h-auto object-contain"
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
                  className="px-6 py-6 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor:
                      selectedReaction === reaction.type
                        ? "transparent"
                        : "#2D301F",
                    background:
                      selectedReaction === reaction.type
                        ? "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)"
                        : "#2D301F",
                  }}
                >
                  <Twemoji hex={reaction.emoji} size={30} />
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
              className="px-6 py-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: isCommentPressed ? "white" : "#2D301F",
              }}
            >
              <Twemoji hex="1f4ac" size={24} />
            </button>
            <span className="text-xs font-medium text-white text-center"></span>
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
