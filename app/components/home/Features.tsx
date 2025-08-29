"use client";

import { useState, useRef, useEffect } from "react";
import FeatureCard from "./FeatureCard";

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Define gradient options for alternating cards
  const gradientOptions = [
    "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)", // Teal to Blue
    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)", // Purple to Violet
    "linear-gradient(90.81deg, #E67E22 0.58%, #F39C12 99.31%)", // Orange to Golden
    "linear-gradient(90.81deg, #2ECC71 0.58%, #27AE60 99.31%)", // Light Green to Green
    "linear-gradient(90.81deg, #E74C3C 0.58%, #C0392B 99.31%)", // Light Red to Red
    "linear-gradient(90.81deg, #3498DB 0.58%, #2980B9 99.31%)", // Light Blue to Blue
  ];

  const featureCards = [
    {
      title: "Set goals with purpose",
      description: "Stay close to God throughout your busy day.",
      images: [
        {
          src: "/assets/feature_mockups/BibleReading.png",
          alt: "Goals Interface",
        },
        {
          src: "/assets/feature_mockups/BibleReadingCharacterPopup.png",
          alt: "Goals Tracking",
        },
      ],
    },
    {
      title: "See what others are saying",
      description:
        "Connect with your community through shared experiences and insights.",
      images: [
        {
          src: "/assets/feature_mockups/BibleReading.png",
          alt: "Community Interface",
        },
        {
          src: "/assets/feature_mockups/BibleReadingCharacterPopup.png",
          alt: "Community Comments",
        },
      ],
    },
    {
      title: "Deeper Bible Reading",
      description:
        "Tap anything in Scripture for immediate context, character backgrounds, and historical details",
      images: [
        {
          src: "/assets/feature_mockups/BibleReading.png",
          alt: "Bible Reading Interface",
        },
        {
          src: "/assets/feature_mockups/BibleReadingCharacterPopup.png",
          alt: "Character Information Popup",
        },
      ],
    },
  ];

  // Update current index based on scroll position
  const updateCurrentIndex = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.max(0, Math.min(newIndex, featureCards.length - 1)));
    }
  };

  // Add scroll event listener to track current position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateCurrentIndex);
      return () => container.removeEventListener("scroll", updateCurrentIndex);
    }
  }, []);

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth =
        scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollPosition = index * (cardWidth + gap);

      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      scrollToCard(newIndex);
    }
  };

  const goToNext = () => {
    if (currentIndex < featureCards.length - 1) {
      const newIndex = currentIndex + 1;
      scrollToCard(newIndex);
    }
  };

  return (
    <section
      className="pt-30 pb-16 sm:px-6 md:px-50 w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Features
        </h2>

        {/* Feature Cards Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth mb-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featureCards.map((card, index) => (
            <div key={index} className="flex-none">
              <FeatureCard
                title={card.title}
                description={card.description}
                images={card.images}
                gradient={gradientOptions[index % gradientOptions.length]}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full transition-colors duration-200 flex items-center justify-center ${
              currentIndex === 0
                ? "bg-white/10 cursor-not-allowed"
                : "bg-white/20 hover:bg-white/30 cursor-pointer"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === featureCards.length - 1}
            className={`w-12 h-12 rounded-full transition-colors duration-200 flex items-center justify-center ${
              currentIndex === featureCards.length - 1
                ? "bg-white/10 cursor-not-allowed"
                : "bg-white/20 hover:bg-white/30 cursor-pointer"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={
                currentIndex === featureCards.length - 1
                  ? "rgba(255,255,255,0.3)"
                  : "white"
              }
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
