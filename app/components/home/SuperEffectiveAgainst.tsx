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
      className="rounded-2xl p-6 space-y-3"
      style={{ backgroundColor: "#323817" }}
    >
      <div className="flex items-start gap-3">
        <Twemoji
          hex="2694"
          size={30}
          className="text-red-400 mt-1"
          alt="Crossed Swords - Super Effective Against"
        />
        <div>
          <span className="font-bold text-white text-xl">
            Super Effective Against:
          </span>
          <div className="flex mt-3">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="flex flex-col items-center mr-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: "#7A1B1B" }}
                >
                  <Image
                    src="/assets/PatienceLogo.png"
                    alt="Patience Logo"
                    width={32}
                    height={32}
                    className="object-contain"
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
