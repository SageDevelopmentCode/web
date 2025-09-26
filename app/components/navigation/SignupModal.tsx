"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Start showing avatars with a slight delay after modal appears
      const timer = setTimeout(() => {
        setShowAvatars(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setShowAvatars(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setShowAvatars(false);
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Black overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={handleClose}
      />

      {/* Modal content */}
      <div
        className={`relative w-[90vw] max-w-lg mx-4 rounded-3xl overflow-hidden transition-all duration-300 transform ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{ backgroundColor: "#CBE2D8" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-10 pb-0">
          {/* Title */}
          <h2
            className="text-xl font-bold text-center mb-8"
            style={{ color: "#2F4A5D" }}
          >
            Sign Up to Provide Feedback or Comment
          </h2>

          {/* Email Input */}
          <div className="mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-3 rounded-full border-none outline-none placeholder-gray-500"
              style={{
                backgroundColor: "#D6E5E2",
                color: "#2F4A5D",
              }}
            />
          </div>

          {/* Password Input */}
          <div className="mb-8">
            <input
              type="password"
              placeholder="Create a Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-3 rounded-full border-none outline-none placeholder-gray-500"
              style={{
                backgroundColor: "#D6E5E2",
                color: "#2F4A5D",
              }}
            />
          </div>

          {/* Avatar Selection */}
          <div className="mb-8">
            <p className="text-sm font-bold mb-4" style={{ color: "#2F4A5D" }}>
              Select an Avatar
            </p>
            <div className="grid grid-cols-7 gap-3">
              {characters.map((character, index) => (
                <button
                  key={character}
                  onClick={() => setSelectedAvatar(character)}
                  className={`w-12 h-12 cursor-pointer rounded-full overflow-hidden border-2 transition-all duration-300 transform ${
                    showAvatars
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-75 translate-y-2"
                  } ${
                    selectedAvatar === character
                      ? "border-gray-600 scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{
                    backgroundColor: "#D6E5E2",
                    transitionDelay: showAvatars ? `${index * 50}ms` : "0ms",
                  }}
                >
                  <Image
                    src={`/assets/Characters/${character}`}
                    alt={character.split(".")[0]}
                    width={200}
                    height={200}
                    className="w-auto h-full object-cover"
                    style={{
                      transform:
                        character === "Ruth.png"
                          ? "scale(3.5) translateY(30%) translateX(10%)"
                          : character === "Samson.png"
                          ? "scale(3.5) translateY(28%) translateX(4%)"
                          : character === "Deborah.png"
                          ? "scale(3.5) translateY(30%) translateX(4%)"
                          : character === "Noah.png"
                          ? "scale(3.5) translateY(26%) translateX(4%)"
                          : "scale(3.5) translateY(33%) translateX(4%)",
                      objectPosition: "center 30%",
                    }}
                    quality={100}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            className="w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: "#778554",
              boxShadow: "0px 4px 0px 1px #57613B",
              borderRadius: "15px",
            }}
          >
            Sign Up
          </button>

          {/* Login Link */}
          <button
            onClick={handleClose}
            className="w-full items-center justify-center cursor-pointer"
          >
            <p
              className="text-center text-sm mt-6 mb-6"
              style={{ color: "#6B764C" }}
            >
              Login with existing account
            </p>
          </button>
        </div>

        {/* Background Image */}
        <div className="relative h-28 overflow-hidden">
          <Image
            src="/assets/AuthBackground.jpg"
            alt="Background"
            width={1200}
            height={400}
            className="w-full h-auto object-cover object-top"
            quality={100}
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
