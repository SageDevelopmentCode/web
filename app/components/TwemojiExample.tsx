"use client";

import React from "react";
import {
  Twemoji,
  PresetEmoji,
  EmojiMap,
  unicodeToHex,
  isEmojiAvailable,
} from "./Twemoji";

/**
 * Example usage component demonstrating how to use the Twemoji component
 */
export default function TwemojiExample() {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">Twemoji Usage Examples</h2>

      {/* Basic Usage */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Usage</h3>
        <div className="flex items-center gap-4">
          <Twemoji hex="1f4da" size={32} alt="Books emoji" />
          <span>Books emoji (📚) - hex: 1f4da</span>
        </div>
        <div className="flex items-center gap-4">
          <Twemoji hex="2694" size={32} alt="Crossed swords" />
          <span>Crossed swords (⚔️) - hex: 2694</span>
        </div>
        <div className="flex items-center gap-4">
          <Twemoji hex="1f3af" size={32} alt="Target" />
          <span>Target (🎯) - hex: 1f3af</span>
        </div>
      </section>

      {/* Different Sizes */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Different Sizes</h3>
        <div className="flex items-center gap-4">
          <Twemoji hex="1f4da" size={16} />
          <Twemoji hex="1f4da" size={24} />
          <Twemoji hex="1f4da" size={32} />
          <Twemoji hex="1f4da" size={48} />
          <Twemoji hex="1f4da" size={64} />
        </div>
      </section>

      {/* Using Preset Component */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Preset Emoji Component</h3>
        <div className="flex items-center gap-4">
          <PresetEmoji type="BOOKS" size={32} />
          <PresetEmoji type="SWORDS" size={32} />
          <PresetEmoji type="TARGET" size={32} />
        </div>
      </section>

      {/* With Custom Styling */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Styling</h3>
        <div className="flex items-center gap-4">
          <Twemoji
            hex="1f4da"
            size={32}
            className="border-2 border-blue-500 rounded-full p-1"
          />
          <Twemoji
            hex="2694"
            size={32}
            style={{
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
              transform: "rotate(15deg)",
            }}
          />
        </div>
      </section>

      {/* Helper Functions Demo */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Helper Functions</h3>
        <div className="space-y-1 text-sm">
          <p>unicodeToHex("📚"): {unicodeToHex("📚")}</p>
          <p>unicodeToHex("⚔️"): {unicodeToHex("⚔️")}</p>
          <p>
            isEmojiAvailable("1f4da"): {isEmojiAvailable("1f4da").toString()}
          </p>
          <p>
            isEmojiAvailable("1f600"): {isEmojiAvailable("1f600").toString()}
          </p>
        </div>
      </section>

      {/* Replace Existing Emojis in Your Code */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Replacing Text Emojis</h3>
        <p className="text-sm text-gray-600">
          Instead of using text emojis like 📖, you can use:
        </p>
        <div className="bg-gray-100 p-4 rounded-lg">
          <code className="text-sm">
            {`<Twemoji hex="1f4da" size={20} alt="Books" />`}
          </code>
        </div>
      </section>
    </div>
  );
}
