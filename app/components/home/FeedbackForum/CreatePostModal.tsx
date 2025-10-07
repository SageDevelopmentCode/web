"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    profile_picture: string;
  };
  user: {
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function CreatePostModal({
  isOpen,
  onClose,
  userProfile,
  user,
}: CreatePostModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    // Reset form
    setTitle("");
    setDescription("");
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = () => {
    // TODO: Handle post submission
    console.log("Post submitted:", { title, description });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-[90vw] max-w-2xl mx-4 rounded-3xl overflow-hidden transition-all duration-300 transform ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{ backgroundColor: "#282828" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-gray-300"
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

        <div className="p-8">
          {/* User Avatar */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600"
              style={{ backgroundColor: "#D6E5E2" }}
            >
              <Image
                src={getCharacterImageSrc(userProfile.profile_picture)}
                alt={userProfile.profile_picture}
                width={200}
                height={200}
                className="w-auto h-full object-cover opacity-100 grayscale-0"
                style={getCharacterImageStyles(userProfile.profile_picture)}
                quality={100}
              />
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title of your post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 py-3 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg font-semibold"
              style={{ color: "#FFFFFF" }}
            />
          </div>

          {/* Description Textarea */}
          <div className="mb-8">
            <textarea
              placeholder="Post description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="w-full px-0 py-3 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500 text-base resize-none"
              style={{ color: "#D1D5DB" }}
            />
          </div>

          {/* Suggested Section */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Suggested</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-4 py-2 text-white font-semibold rounded-full text-sm cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                }}
              >
                + Select a Feature
              </button>
              <button className="px-4 py-2 text-white font-medium rounded-full text-sm cursor-pointer transition-all hover:bg-opacity-80 bg-[#3B3B3B]">
                + Add a Tag
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: "#778554",
              boxShadow: "0px 4px 0px 1px #57613B",
              borderRadius: "15px",
            }}
          >
            Submit Post
          </button>
        </div>
      </div>
    </div>
  );
}
