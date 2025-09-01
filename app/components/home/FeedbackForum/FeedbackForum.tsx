"use client";

import { Plus } from "lucide-react";

export default function FeedbackForum() {
  return (
    <section
      className="pt-10 pb-16 px-4 sm:px-6 md:px-8 w-full"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Feedback Forum
        </h2>

        {/* Main Content Container */}
        <div
          className="rounded-3xl px-10 py-6"
          style={{ backgroundColor: "#282828" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                Share your feedback:
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                What could we improve to better meet your needs?
              </p>
            </div>

            {/* Right Content - Create Button */}
            <div className="flex-shrink-0">
              <button
                className="px-8 py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                }}
                type="button"
              >
                <Plus size={20} />
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
