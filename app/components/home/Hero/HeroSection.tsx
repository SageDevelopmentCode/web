"use client";

import { useState } from "react";

export default function HeroSection() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    // Handle subscription logic here
    console.log("Subscribing email:", email);
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-4 sm:px-6 md:px-8"
      style={{ zIndex: 10, position: "relative", pointerEvents: "auto" }}
    >
      <div
        className="mb-3 px-3 py-1.5 rounded-full text-white font-bold text-xs sm:text-sm fade-in-up delay-1"
        style={{ backgroundColor: "#BF8EFF" }}
      >
        Out April 15, 2026
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white fade-in-up delay-2 text-center">
        Sage
      </h1>
      <p className="text-white text-sm sm:text-base mt-4 text-center font-bold max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg fade-in-up delay-3 px-2">
        A{" "}
        <span
          className="px-1 py-0.5 rounded"
          style={{
            background:
              "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
            borderRadius: "10px",
          }}
        >
          Christian Self-Care
        </span>{" "}
        App. Sign up for early access and updates before launch.
      </p>

      {/* Mobile Layout - Separated Components */}
      <div className="mt-8 sm:hidden w-full max-w-xs fade-in-up delay-4 px-0 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-white placeholder-gray-400 px-6 py-4 rounded-full focus:outline-none text-sm"
          style={{
            backgroundColor: "#282828",
          }}
        />
        <button
          onClick={handleSubscribe}
          className="w-full px-6 py-3 text-white font-semibold rounded-full text-sm cursor-pointer"
          style={{
            background:
              "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
            pointerEvents: "auto",
          }}
          type="button"
        >
          Subscribe
        </button>
      </div>

      {/* Desktop Layout - Connected Components */}
      <div className="hidden sm:block mt-12 w-full max-w-md fade-in-up delay-4 px-4">
        <div
          className="relative flex items-center rounded-full p-2"
          style={{
            backgroundColor: "#282828",
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-2 rounded-full focus:outline-none text-base"
          />
          <button
            onClick={handleSubscribe}
            className="px-6 py-2 text-white font-semibold rounded-full text-base cursor-pointer"
            style={{
              background:
                "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
              pointerEvents: "auto",
            }}
            type="button"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
