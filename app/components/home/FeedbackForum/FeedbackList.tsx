"use client";

import { useState } from "react";
import { PresetEmoji } from "../../Twemoji";
import { FeedbackPost } from "./types";

interface FeedbackListProps {
  posts: FeedbackPost[];
  selectedPostId: number | null;
  onSelectPost: (postId: number) => void;
  onToggleHeart: (postId: number) => void;
}

export default function FeedbackList({
  posts,
  selectedPostId,
  onSelectPost,
  onToggleHeart,
}: FeedbackListProps) {
  const [activeFilter, setActiveFilter] = useState<
    "top" | "new" | "upcoming" | "all"
  >("all");

  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts.filter((post) => post.category === activeFilter);

  const getCategoryEmoji = (category: "top" | "new" | "upcoming") => {
    switch (category) {
      case "top":
        return <PresetEmoji type="TOP" size={16} />;
      case "new":
        return <PresetEmoji type="NEW" size={16} />;
      case "upcoming":
        return <PresetEmoji type="UPCOMING" size={16} />;
    }
  };

  const getCategoryColor = (category: "top" | "new" | "upcoming") => {
    switch (category) {
      case "top":
        return "#FF6B6B";
      case "new":
        return "#4ECDC4";
      case "upcoming":
        return "#45B7D1";
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filter Tabs */}
      <div
        className="flex mb-6 rounded-full p-1 flex-shrink-0"
        style={{ backgroundColor: "#4D5915" }}
      >
        <button
          onClick={() => setActiveFilter("all")}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all text-white flex-1"
          style={{
            backgroundColor: activeFilter === "all" ? "#7A873D" : "transparent",
          }}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter("top")}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all text-white flex items-center justify-center gap-2 flex-1"
          style={{
            backgroundColor: activeFilter === "top" ? "#7A873D" : "transparent",
          }}
        >
          <PresetEmoji type="TOP" size={16} />
          Top
        </button>
        <button
          onClick={() => setActiveFilter("new")}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all text-white flex items-center justify-center gap-2 flex-1"
          style={{
            backgroundColor: activeFilter === "new" ? "#7A873D" : "transparent",
          }}
        >
          <PresetEmoji type="NEW" size={16} />
          New
        </button>
        <button
          onClick={() => setActiveFilter("upcoming")}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all text-white flex items-center justify-center gap-2 flex-1"
          style={{
            backgroundColor:
              activeFilter === "upcoming" ? "#7A873D" : "transparent",
          }}
        >
          <PresetEmoji type="UPCOMING" size={16} />
          Upcoming
        </button>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide min-h-0">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onSelectPost(post.id)}
            className="p-4 rounded-2xl cursor-pointer transition-all duration-200"
            style={{
              backgroundColor:
                selectedPostId === post.id ? "#7A873D" : "#323817",
            }}
          >
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {post.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300 text-sm font-medium">
                    {post.username}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {post.timestamp}
                  </span>
                </div>
              </div>
              <div
                className="px-2 py-1 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: getCategoryColor(post.category) + "20",
                }}
              >
                {getCategoryEmoji(post.category)}
                <span
                  className="text-xs font-medium capitalize"
                  style={{ color: getCategoryColor(post.category) }}
                >
                  {post.category}
                </span>
              </div>
            </div>

            {/* Post Content */}
            <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-300 text-sm line-clamp-3 mb-3">
              {post.description}
            </p>

            {/* Post Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHeart(post.id);
                }}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  post.isHearted
                    ? "text-red-400 hover:text-red-300"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <PresetEmoji
                  type="HEART"
                  size={16}
                  style={{
                    filter: post.isHearted ? "none" : "grayscale(1)",
                  }}
                />
                {post.heartsCount}
              </button>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <PresetEmoji
                  type="SPEECH_BUBBLE"
                  size={16}
                  style={{ filter: "grayscale(1)" }}
                />
                {post.commentsCount}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
