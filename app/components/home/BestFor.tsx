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
      <div className="flex items-start gap-3">
        <Twemoji
          hex="1f3af"
          size={30}
          className="text-green-400 mt-1"
          alt="Target - Best For"
        />
        <div>
          <span className="font-bold text-white text-xl">Best For:</span>
          <p className="text-base text-gray-200 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
