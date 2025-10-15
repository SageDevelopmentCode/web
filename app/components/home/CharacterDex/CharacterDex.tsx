"use client";

import { useSectionLazyLoad } from "../../../../lib/hooks/useSectionLazyLoad";

const characters = [
  "Daniel.PNG",
  "David.png",
  "Deborah.png",
  "Elijah.png",
  "Esther.PNG",
  "Gabriel.png",
  "Job.PNG",
  "JohnTheBaptist.PNG",
  "Moses.PNG",
  "Noah.png",
  "Paul.png",
  "Ruth.png",
  "Samson.png",
  "Solomon.PNG",
];

export default function CharacterDex() {
  // Section lazy loading
  const { ref: sectionRef, hasLoaded } = useSectionLazyLoad({
    threshold: 0.2,
    rootMargin: "100px",
    triggerOnce: true,
  });

  // Duplicate the characters array multiple times for seamless infinite scrolling
  const duplicatedCharacters = [
    ...characters,
    ...characters,
    ...characters,
    ...characters,
  ];

  return (
    <section
      ref={sectionRef}
      className={`pt-16 pb-16 px-4 sm:px-6 md:px-8 w-full transition-opacity duration-700 ${
        hasLoaded ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title and Badge */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-4">
            CharacterDex
          </h2>
          <div
            className="px-3 py-1.5 rounded-full text-white font-bold text-xs sm:text-sm"
            style={{ backgroundColor: "#BF8EFF" }}
          >
            Coming Soon
          </div>
        </div>

        {/* Scrolling Characters Container */}
        <div className="relative overflow-hidden">
          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }

            .scroll-container {
              display: flex;
              animation: scroll 60s linear infinite;
              width: fit-content;
            }

            .scroll-container:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="scroll-container">
            {duplicatedCharacters.map((character, index) => (
              <div
                key={`${character}-${index}`}
                className="flex-shrink-0 px-4"
              >
                <img
                  src={`/assets/Characters/${character}`}
                  alt={character.replace(/\.(PNG|png)$/, "")}
                  className="h-64 sm:h-72 md:h-80 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
