"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BestFor from "./BestFor";
import SuperEffectiveAgainst from "./SuperEffectiveAgainst";
import VerseCollection from "./VerseCollection";
import CharacterHeader from "./CharacterHeader";
import { Twemoji, EmojiMap } from "../../Twemoji";

export default function Starters() {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    "student"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  // Handle option selection with transition
  const handleOptionSelect = (optionKey: string) => {
    if (optionKey === selectedOption) return;

    setIsTransitioning(true);
    setShowMobileDetails(false); // Reset mobile details visibility when changing options
    setTimeout(() => {
      setSelectedOption(optionKey);
      setAnimationKey((prev) => prev + 1);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  // Option data mapping to characters
  const optionData: { [key: string]: any } = {
    student: {
      key: "student",
      title: "I'm a Student",
      emoji: EmojiMap.STUDENT,
      character: {
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
    },
    professional: {
      key: "professional",
      title: "I'm a Professional",
      emoji: EmojiMap.PROFESSIONAL,
      character: {
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
    },
    struggling: {
      key: "struggling",
      title: "I'm Struggling",
      emoji: EmojiMap.STRUGGLING,
      character: {
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
    },
    relationship: {
      key: "relationship",
      title: "I have Relationship Issues",
      emoji: EmojiMap.WILTED,
      character: {
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
    },
    growth: {
      key: "growth",
      title: "I Want Growth",
      emoji: EmojiMap.GROWTH,
      character: {
        name: "Deborah",
        src: "/assets/Deborah.png",
        rarity: "Rare",
        title: "PATIENCE",
        description:
          "Deborah's life teaches us that walking with God may set us apart, but it positions us for preservation, purpose, and legacy.",
        bestFor:
          "People who struggle with impatience, are in waiting seasons, or working on long-term dreams.",
        superEffectiveAgainst: ["Doubt", "Delay", "Impatience"],
        verseCollection: {
          title: "Promises in the storm",
          subtitle: "Collection • 28 Verses",
        },
      },
    },
    seeking: {
      key: "seeking",
      title: "I'm Seeking God",
      emoji: EmojiMap.SEEKING_GOD,
      character: {
        name: "Solomon", // Duplicate as requested
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
    },
  };

  const options = Object.values(optionData);

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

        .character-details-enter {
          opacity: 0;
          transform: translateY(20px);
        }

        .character-details-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        }

        .background-transition {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .character-image-transition {
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .character-container {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .text-section {
          opacity: 0;
          transform: translateY(15px);
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .text-section:nth-child(1) {
          animation-delay: 0.1s;
        }
        .text-section:nth-child(2) {
          animation-delay: 0.2s;
        }
        .text-section:nth-child(3) {
          animation-delay: 0.3s;
        }
        .text-section:nth-child(4) {
          animation-delay: 0.4s;
        }
        .text-section:nth-child(5) {
          animation-delay: 0.5s;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <section
        className="pt-30 pb-16 px-4 md:px-35 w-full max-w-full overflow-x-hidden"
        style={{ backgroundColor: "#3C4806" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
            Life Happens. God's Wisdom Responds.
          </h2>

          {/* Option Buttons - Mobile Horizontal Scroll, Desktop Grid */}
          <div className="mb-8">
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden horizontal-scroll flex overflow-x-auto gap-5 pb-4 px-2">
              {options.map((option) => (
                <button
                  key={option.key}
                  className={`
                    relative p-4 rounded-2xl transition-all duration-300 cursor-pointer flex-shrink-0
                    flex flex-col items-center justify-center text-center min-h-[120px] min-w-[140px]
                    ${
                      selectedOption === option.key
                        ? "bg-[#7A873D] shadow-lg"
                        : "bg-[#37400F] hover:bg-[#454D15]"
                    }
                  `}
                  onClick={() => handleOptionSelect(option.key)}
                >
                  {/* Emoji */}
                  <div className="mb-2">
                    <Twemoji hex={option.emoji} size={36} />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-sm leading-tight">
                    {option.title}
                  </h3>
                </button>
              ))}
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              {options.map((option) => (
                <button
                  key={option.key}
                  className={`
                    relative p-6 rounded-3xl transition-all duration-300 hover:scale-105 cursor-pointer
                    flex flex-col items-center justify-center text-center min-h-[140px]
                    ${
                      selectedOption === option.key
                        ? "bg-[#7A873D] shadow-lg"
                        : "bg-[#37400F] hover:bg-[#454D15]"
                    }
                  `}
                  onClick={() => handleOptionSelect(option.key)}
                >
                  {/* Emoji */}
                  <div className="mb-3">
                    <Twemoji hex={option.emoji} size={48} />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-base md:text-lg leading-tight">
                    {option.title}
                  </h3>
                </button>
              ))}
            </div>
          </div>

          {/* Character Details Section */}
          {selectedOption && (
            <div className="mt-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
                {(() => {
                  const optionInfo = optionData[selectedOption];
                  if (!optionInfo) return null;
                  const character = optionInfo.character;

                  return (
                    <div
                      key={animationKey}
                      className="flex flex-col md:flex-row overflow-hidden min-h-[400px] rounded-3xl md:gap-2 md:items-center"
                    >
                      {/* Left Section - Character Background & Image */}
                      <div
                        className={`w-full md:w-80 h-80 md:h-145 relative overflow-hidden rounded-3xl md:rounded-l-3xl md:rounded-r-3xl character-container ${
                          isTransitioning
                            ? "opacity-0 transform scale-98"
                            : "opacity-100 transform scale-100"
                        }`}
                      >
                        {/* Background Image */}
                        <div
                          className="absolute inset-0 background-transition"
                          style={{
                            backgroundImage: `url('/assets/${character.name}Background.jpg')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            minHeight: "100%",
                            transform: isTransitioning
                              ? "scale(1.05)"
                              : "scale(1)",
                            filter: isTransitioning ? "blur(2px)" : "blur(0px)",
                          }}
                        />
                        {/* 35% Black Overlay */}
                        <div className="absolute inset-0 bg-black opacity-35" />
                        <div className="relative z-10 flex items-end justify-center h-full p-1">
                          <div
                            className={`w-64 h-64 md:w-[34rem] md:h-[34rem] character-image-transition ${
                              isTransitioning
                                ? "opacity-0 transform scale-90 rotate-1"
                                : "opacity-100 transform scale-100 rotate-0"
                            }`}
                          >
                            <Image
                              src={character.src}
                              alt={character.name}
                              width={480}
                              height={480}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Character Info */}
                      <div
                        className="flex-1 py-8 px-0 md:py-12 md:pl-12 space-y-3 rounded-3xl md:rounded-l-xl md:rounded-r-3xl"
                        style={{ backgroundColor: "#3C4806" }}
                      >
                        <div className="text-section">
                          <CharacterHeader
                            name={character.name}
                            number={
                              options.findIndex(
                                (o) => o.key === selectedOption
                              ) + 1
                            }
                            title={character.title}
                            rarity={character.rarity}
                          />
                        </div>

                        <div className="text-section">
                          <p className="text-base font-semibold leading-relaxed text-gray-200">
                            {character.description}
                          </p>
                        </div>

                        {/* Mobile Toggle Button */}
                        <div className="md:hidden text-section">
                          <button
                            onClick={() =>
                              setShowMobileDetails(!showMobileDetails)
                            }
                            className="w-full py-3 px-4 mt-4 mb-2 bg-[#7A873D] hover:bg-[#8B9A47] text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <span>
                              {showMobileDetails
                                ? "Hide Details"
                                : "Show Details"}
                            </span>
                            <svg
                              className={`w-5 h-5 transition-transform duration-200 ${
                                showMobileDetails ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Character Details - Hidden by default on mobile, always visible on desktop */}
                        <div
                          className={`${
                            showMobileDetails ? "block" : "hidden"
                          } md:block space-y-3`}
                        >
                          <div className="text-section">
                            <BestFor description={character.bestFor} />
                          </div>

                          <div className="text-section">
                            <SuperEffectiveAgainst
                              weaknesses={character.superEffectiveAgainst}
                            />
                          </div>

                          <div className="text-section">
                            <VerseCollection
                              characterName={character.name}
                              title={character.verseCollection.title}
                              subtitle={character.verseCollection.subtitle}
                            />
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
