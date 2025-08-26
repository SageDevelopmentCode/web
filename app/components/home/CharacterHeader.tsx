"use client";

import Image from "next/image";

interface CharacterHeaderProps {
  name: string;
  number: number;
  title: string;
  rarity: string;
}

export default function CharacterHeader({
  name,
  number,
  title,
  rarity,
}: CharacterHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#518ED2" }}
        >
          <Image
            src="/assets/PatienceLogo.png"
            alt="Patience Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-white">{name}</span>
            <span
              className="px-2 py-1 rounded-lg text-base font-bold text-white"
              style={{ backgroundColor: "#323232" }}
            >
              #{number}
            </span>
          </div>
          <span
            className="text-base font-bold tracking-wider"
            style={{ color: "#518ED2" }}
          >
            {title}
          </span>
        </div>
      </div>
      <span
        className="px-6 py-2 rounded-full text-base font-bold text-white"
        style={{
          background:
            "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
        }}
      >
        {rarity}
      </span>
    </div>
  );
}
