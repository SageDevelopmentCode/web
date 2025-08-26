"use client";

import { Twemoji } from "../Twemoji";

interface BestForProps {
  description: string;
}

export default function BestFor({ description }: BestForProps) {
  return (
    <div
      className="rounded-2xl p-6 space-y-2"
      style={{ backgroundColor: "#323817" }}
    >
      {/* Mobile: centered layout, Desktop: original left-aligned layout */}
      <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-3">
        <Twemoji
          hex="1f3af"
          size={24}
          className="text-green-400 mb-2 md:mb-0 md:mt-1 md:w-[30px]"
          alt="Target - Best For"
        />
        <div>
          <span className="font-bold text-white text-lg md:text-xl">
            Best For:
          </span>
          <p className="text-sm md:text-base text-gray-200 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
