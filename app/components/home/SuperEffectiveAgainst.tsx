"use client";

import Image from "next/image";
import { Twemoji } from "../Twemoji";

interface SuperEffectiveAgainstProps {
  weaknesses: string[];
}

export default function SuperEffectiveAgainst({
  weaknesses,
}: SuperEffectiveAgainstProps) {
  return (
    <div
      className="rounded-2xl px-6 py-4 space-y-3"
      style={{ backgroundColor: "#323817" }}
    >
      {/* Mobile: centered layout, Desktop: original left-aligned layout */}
      <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-3">
        <Twemoji
          hex="2694"
          size={24}
          className="text-red-400 mb-2 md:mb-0 md:mt-1 md:w-[30px]"
          alt="Crossed Swords - Super Effective Against"
        />
        <div className="w-full">
          <span className="font-bold text-white text-lg md:text-xl">
            Super Effective Against:
          </span>
          <div className="flex justify-center md:justify-start mt-3">
            {weaknesses.map((weakness, index) => (
              <div
                key={index}
                className="flex flex-col items-center mr-3 md:mr-4"
              >
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: "#7A1B1B" }}
                >
                  <Image
                    src="/assets/PatienceLogo.png"
                    alt="Patience Logo"
                    width={24}
                    height={24}
                    className="object-contain md:w-8 md:h-8"
                  />
                </div>
                <span className="text-xs font-bold text-white tracking-wider">
                  {weakness.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
