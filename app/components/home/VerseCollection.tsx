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
      <div className="flex items-start gap-3">
        <Twemoji
          hex="1f4da"
          size={30}
          className="text-blue-400 mt-1"
          alt="Books - Verse Collection"
        />
        <div>
          <span className="font-bold text-white text-xl">
            Verse Collection:
          </span>
          <div className="mt-2">
            <div
              className="inline-flex items-center gap-3 rounded-3xl p-3"
              style={{ backgroundColor: "#262626" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
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
                <div className="font-bold text-white">{title}</div>
                <div className="text-sm text-gray-400">{subtitle}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
