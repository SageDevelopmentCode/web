"use client";

import { ChevronDown } from "lucide-react";

export default function BottomText() {
  const scrollToFeedbackForum = () => {
    const feedbackSection = document.getElementById("feedback-forum");
    if (feedbackSection) {
      feedbackSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div
      className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center px-4"
      style={{ zIndex: 10, pointerEvents: "auto" }}
    >
      <button
        onClick={scrollToFeedbackForum}
        className="text-white text-sm opacity-80 text-center font-bold hover:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center gap-2"
      >
        Have an idea you want us to implement?
        <ChevronDown size={16} className="opacity-80" />
      </button>
    </div>
  );
}
