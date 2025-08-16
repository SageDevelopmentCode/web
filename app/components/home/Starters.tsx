"use client";

import { useState } from "react";
import Image from "next/image";

export default function Starters() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    "Gabriel"
  );

  const characters = [
    {
      name: "Gabriel",
      src: "/assets/Gabriel.png",
      rarity: "Rare",
      title: "MESSENGER",
      description:
        "Gabriel is known as God's messenger, delivering divine announcements and revelations to prophets and people throughout biblical history.",
      bestFor:
        "People who value clear communication, are in leadership positions, or work in teaching and guidance roles.",
      superEffectiveAgainst: ["Doubt", "Fear", "Confusion"],
      verseCollection: {
        title: "Divine Messages",
        subtitle: "Collection • 42 Verses",
      },
    },
    {
      name: "Deborah",
      src: "/assets/Deborah.png",
      rarity: "Rare",
      title: "PATIENCE",
      description:
        "Noah's life teaches us that walking with God may set us apart, but it positions us for preservation, purpose, and legacy.",
      bestFor:
        "People who struggle with impatience, are in waiting seasons, or working on long-term dreams.",
      superEffectiveAgainst: ["Doubt", "Delay", "Doubt"],
      verseCollection: {
        title: "Promises in the storm",
        subtitle: "Collection • 28 Verses",
      },
    },
    {
      name: "David",
      src: "/assets/David.png",
      rarity: "Epic",
      title: "COURAGE",
      description:
        "David shows us that with faith in God, even the smallest person can overcome the greatest giants and obstacles in life.",
      bestFor:
        "People facing overwhelming challenges, dealing with fear, or needing to step up as leaders.",
      superEffectiveAgainst: ["Fear", "Pride", "Oppression"],
      verseCollection: {
        title: "Songs of Victory",
        subtitle: "Collection • 73 Verses",
      },
    },
    {
      name: "Ruth",
      src: "/assets/Ruth.png",
      rarity: "Legendary",
      title: "LOYALTY",
      description:
        "Ruth's unwavering loyalty and faithfulness demonstrate how dedication and love can transform lives and create lasting legacies.",
      bestFor:
        "People working on relationships, dealing with family transitions, or learning about commitment.",
      superEffectiveAgainst: ["Abandonment", "Betrayal", "Isolation"],
      verseCollection: {
        title: "Faithful Devotion",
        subtitle: "Collection • 34 Verses",
      },
    },
    {
      name: "Solomon",
      src: "/assets/Solomon.PNG",
      rarity: "Legendary",
      title: "WISDOM",
      description:
        "Solomon's pursuit of wisdom above all else shows us the value of seeking divine understanding in all life decisions.",
      bestFor:
        "People making important decisions, seeking guidance, or wanting to grow in understanding.",
      superEffectiveAgainst: ["Foolishness", "Confusion", "Poor Judgment"],
      verseCollection: {
        title: "Proverbs of Life",
        subtitle: "Collection • 156 Verses",
      },
    },
  ];

  return (
    <>
      <style jsx>{`
        .horizontal-scroll {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <section
        className="pt-30 pb-16 px-4 sm:px-6 md:px-8"
        style={{ backgroundColor: "#3C4806" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
            Meet the Starters.
          </h2>

          {/* Characters Grid */}
          <div className="horizontal-scroll flex overflow-x-auto gap-4 md:gap-8 md:flex-wrap md:justify-center md:overflow-visible pb-4 md:pb-0">
            {characters.map((character, index) => (
              <div
                key={character.name}
                className="cursor-pointer transition-transform duration-200 hover:scale-105 flex-shrink-0"
                onClick={() => setSelectedCharacter(character.name)}
              >
                {/* Character Background */}
                <div
                  className="rounded-3xl p-0 transition-colors duration-300 w-32 h-32 md:w-48 md:h-48"
                  style={{
                    backgroundColor:
                      selectedCharacter === character.name
                        ? "#323817"
                        : "#37400F",
                  }}
                >
                  {/* Character Image Container */}
                  <div className="relative w-full h-full overflow-hidden rounded-2xl">
                    <Image
                      src={character.src}
                      alt={character.name}
                      width={192}
                      height={192}
                      quality={95}
                      className="object-cover w-full h-full scale-125"
                      style={{
                        objectPosition: "center -50%",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Character Details Section */}
          {selectedCharacter && (
            <div className="mt-12 px-4 sm:px-6 md:px-8">
              <div className="max-w-7xl mx-auto">
                {(() => {
                  const character = characters.find(
                    (c) => c.name === selectedCharacter
                  );
                  if (!character) return null;

                  return (
                    <div className="flex flex-col md:flex-row overflow-hidden min-h-[500px] rounded-3xl md:gap-6">
                      {/* Left Section - Character Background & Image */}
                      <div className="w-full md:w-80 relative overflow-hidden rounded-3xl md:rounded-l-3xl md:rounded-r-3xl">
                        {/* Background Image */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url('/assets/${character.name}Background.jpg')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            minHeight: "100%",
                          }}
                        />
                        {/* 35% Black Overlay */}
                        <div className="absolute inset-0 bg-black opacity-35" />
                        <div className="relative z-10 flex items-center justify-center h-full p-4">
                          <div className="w-64 h-64 md:w-72 md:h-72">
                            <Image
                              src={character.src}
                              alt={character.name}
                              width={288}
                              height={288}
                              quality={95}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Character Info */}
                      <div
                        className="flex-1 p-8 md:p-12 space-y-6 rounded-3xl md:rounded-l-xl md:rounded-r-3xl"
                        style={{ backgroundColor: "#3C4806" }}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold">👤</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                              {character.name}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              character.rarity === "Legendary"
                                ? "bg-yellow-600"
                                : character.rarity === "Epic"
                                ? "bg-purple-600"
                                : "bg-blue-600"
                            }`}
                          >
                            {character.rarity}
                          </span>
                        </div>

                        <div className="text-sm text-gray-300 font-semibold tracking-wider">
                          {character.title}
                        </div>

                        <p className="text-sm leading-relaxed text-gray-200">
                          {character.description}
                        </p>

                        {/* Best For Section */}
                        <div
                          className="rounded-lg p-4 space-y-2"
                          style={{ backgroundColor: "#323817" }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">😊</span>
                            <span className="font-semibold text-green-400">
                              Best For:
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 ml-6">
                            {character.bestFor}
                          </p>
                        </div>

                        {/* Super Effective Against */}
                        <div
                          className="rounded-lg p-4 space-y-3"
                          style={{ backgroundColor: "#323817" }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-red-400">⚔️</span>
                            <span className="font-semibold text-red-400">
                              Super Effective Against:
                            </span>
                          </div>
                          <div className="flex gap-2 ml-6">
                            {character.superEffectiveAgainst.map(
                              (weakness, index) => (
                                <div
                                  key={index}
                                  className="bg-red-900 bg-opacity-50 px-3 py-1 rounded-lg"
                                >
                                  <span className="text-sm font-medium">
                                    {weakness}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Verse Collection */}
                        <div
                          className="rounded-lg p-4 space-y-3"
                          style={{ backgroundColor: "#323817" }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400">📖</span>
                            <span className="font-semibold text-blue-400">
                              Verse Collection:
                            </span>
                          </div>
                          <div className="ml-6 bg-gray-800 bg-opacity-50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  📜
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {character.verseCollection.title}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {character.verseCollection.subtitle}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
