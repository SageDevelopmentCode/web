"use client";

import React from "react";
import Image from "next/image";

// Import all available emoji assets
const emojiAssets: { [key: string]: string } = {
  "1f3af": "/assets/emojis/1f3af.png", // 🎯 target/aiming
  "1f4da": "/assets/emojis/1f4da.png", // 📚 books
  "2694": "/assets/emojis/2694.png", // ⚔️ crossed swords
};

interface TwemojiProps {
  /** The hex code of the emoji (without 'U+' prefix) */
  hex: string;
  /** Size of the emoji image */
  size?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Priority loading for Next.js Image optimization */
  priority?: boolean;
}

/**
 * Twemoji component for rendering emoji images from hex codes in Next.js
 *
 * @param hex - The hex code of the emoji (e.g., "1f4da" for 📚)
 * @param size - The size of the emoji (defaults to 24)
 * @param className - Additional CSS classes to apply
 * @param alt - Alt text for accessibility (auto-generated if not provided)
 * @param style - Additional inline styles
 * @param priority - Whether to prioritize loading this image
 */
export const Twemoji: React.FC<TwemojiProps> = ({
  hex,
  size = 24,
  className = "",
  alt,
  style,
  priority = false,
}) => {
  const normalizedHex = hex.toLowerCase();
  const source = emojiAssets[normalizedHex];

  // If emoji is not available, return null or a fallback
  if (!source) {
    console.warn(`Twemoji: Emoji with hex code "${hex}" not found`);
    return null;
  }

  // Auto-generate alt text if not provided
  const altText = alt || `Emoji ${hex}`;

  const imageStyle: React.CSSProperties = {
    width: size,
    height: size,
    display: "inline-block",
    verticalAlign: "middle",
    ...style,
  };

  return (
    <Image
      src={source}
      alt={altText}
      width={size}
      height={size}
      style={imageStyle}
      className={className}
      priority={priority}
      unoptimized // For emoji assets, we might want to skip optimization
    />
  );
};

/**
 * Helper function to convert Unicode emoji to hex code
 * Usage: unicodeToHex("📚") returns "1f4da"
 */
export const unicodeToHex = (emoji: string): string => {
  const codePoint = emoji.codePointAt(0);
  return codePoint ? codePoint.toString(16).toLowerCase() : "";
};

/**
 * Helper function to check if an emoji hex code is available
 */
export const isEmojiAvailable = (hex: string): boolean => {
  return hex.toLowerCase() in emojiAssets;
};

/**
 * Get all available emoji hex codes
 */
export const getAvailableEmojis = (): string[] => {
  return Object.keys(emojiAssets);
};

/**
 * Emoji mapping for common usage
 */
export const EmojiMap = {
  TARGET: "1f3af", // 🎯
  BOOKS: "1f4da", // 📚
  SWORDS: "2694", // ⚔️
} as const;

/**
 * Convenience component with predefined emojis
 */
interface PresetEmojiProps {
  type: keyof typeof EmojiMap;
  size?: number;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const PresetEmoji: React.FC<PresetEmojiProps> = ({ type, ...props }) => {
  return <Twemoji hex={EmojiMap[type]} {...props} />;
};

export default Twemoji;
