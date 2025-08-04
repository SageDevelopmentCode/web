"use client";

import { useState } from "react";
import Image from "next/image";

export default function Starters() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  );

  const characters = [
    { name: "Gabriel", src: "/assets/Gabriel.png" },
    { name: "Deborah", src: "/assets/Deborah.png" },
    { name: "David", src: "/assets/David.png" },
    { name: "Ruth", src: "/assets/Ruth.png" },
    { name: "Noah", src: "/assets/Noah.png" },
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
        </div>
      </section>
    </>
  );
}
