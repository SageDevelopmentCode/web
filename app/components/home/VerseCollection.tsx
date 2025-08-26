"use client";

import { Twemoji } from "../Twemoji";

interface VerseCollectionProps {
  characterName: string;
  title: string;
  subtitle: string;
}

export default function VerseCollection({
  characterName,
  title,
  subtitle,
}: VerseCollectionProps) {
  return (
    <div
      className="rounded-2xl p-6 space-y-3"
      style={{ backgroundColor: "#323817" }}
    >
      {/* Mobile: centered layout, Desktop: original left-aligned layout */}
      <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-3">
        <Twemoji
          hex="1f4da"
          size={24}
          className="text-blue-400 mb-2 md:mb-0 md:mt-1 md:w-[30px]"
          alt="Books - Verse Collection"
        />
        <div className="w-full">
          <span className="font-bold text-white text-lg md:text-xl">
            Verse Collection:
          </span>
          <div className="mt-2 flex justify-center md:justify-start">
            <div
              className="inline-flex items-center gap-3 rounded-3xl p-3"
              style={{ backgroundColor: "#262626" }}
            >
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: `url('/assets/${characterName}Background.jpg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {/* Optional overlay if needed for contrast */}
                <div className="absolute inset-0 bg-black opacity-20" />
              </div>
              <div>
                <div className="font-bold text-white text-sm md:text-base">
                  {title}
                </div>
                <div className="text-xs md:text-sm text-gray-400">
                  {subtitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
