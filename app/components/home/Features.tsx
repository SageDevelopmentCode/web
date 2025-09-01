"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

      // Calculate which card is most visible in the viewport
      const cardWithGap = cardWidth + gap;

      // Use a more precise calculation - find the card that's most centered
      let newIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < featureCards.length; i++) {
        const cardPosition = i * cardWithGap;
        const distance = Math.abs(scrollLeft - cardPosition);
        if (distance < minDistance) {
          minDistance = distance;
          newIndex = i;
        }
      }

      // Only update if the index actually changed
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Add scroll event listener to track current position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initialize current index on mount
      updateCurrentIndex();

      container.addEventListener("scroll", updateCurrentIndex);
      return () => container.removeEventListener("scroll", updateCurrentIndex);
    }
  }, []);

  // Also update when window resizes to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateCurrentIndex, 100); // Small delay to ensure layout is updated
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollPosition = index * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      // Update the current index immediately to prevent UI lag
      setCurrentIndex(index);
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
      className="pt-10 pb-16 sm:px-6 md:px-50 w-full max-w-full overflow-x-visible"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-none mx-auto px-4">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Features
        </h2>

        {/* Feature Cards Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth mb-6"
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
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentIndex === 0
                ? "bg-white/10 cursor-not-allowed"
                : "cursor-pointer hover:opacity-80"
            }`}
            style={{
              backgroundColor: currentIndex === 0 ? undefined : "#323817",
            }}
          >
            <ChevronLeft
              size={26}
              color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "white"}
            />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === featureCards.length - 1}
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentIndex === featureCards.length - 1
                ? "bg-white/10 cursor-not-allowed"
                : "cursor-pointer hover:opacity-80"
            }`}
            style={{
              backgroundColor:
                currentIndex === featureCards.length - 1
                  ? undefined
                  : "#323817",
            }}
          >
            <ChevronRight
              size={26}
              color={
                currentIndex === featureCards.length - 1
                  ? "rgba(255,255,255,0.3)"
                  : "white"
              }
            />
          </button>
        </div>
      </div>
    </section>
  );
}
