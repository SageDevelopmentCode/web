"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { PresetEmoji } from "../../Twemoji";
import { FeedbackPost, FeedbackComment } from "./types";

interface FeedbackDetailsProps {
  post: FeedbackPost | null;
  onTogglePostHeart: (postId: number) => void;
  onToggleCommentHeart: (commentId: number) => void;
  onToggleReplyHeart: (commentId: number, replyId: number) => void;
  onToggleReplies: (commentId: number) => void;
}

export default function FeedbackDetails({
  post,
  onTogglePostHeart,
  onToggleCommentHeart,
  onToggleReplyHeart,
  onToggleReplies,
}: FeedbackDetailsProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [commentText, setCommentText] = useState("");
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Check if scrolling is needed and handle scroll hint
  useEffect(() => {
    const checkScrollable = () => {
      const container = commentsContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setShowScrollHint(isScrollable);
      }
    };

    checkScrollable();
  }, [post?.comments]);

  // Handle scroll to hide hint
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && container.scrollTop > 20) {
      setShowScrollHint(false);
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

  if (!post) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <PresetEmoji
              type="SPEECH_BUBBLE"
              size={48}
              style={{ filter: "grayscale(1)" }}
            />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Select a feedback post
          </h3>
          <p className="text-gray-400 text-sm">
            Choose a post from the left to view details and comments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Post Header */}
      <div className="mb-6 pb-6 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {post.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <span className="text-white text-base font-medium">
                {post.username}
              </span>
              <span className="text-gray-400 text-sm ml-2">
                {post.timestamp}
              </span>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full flex items-center gap-2"
            style={{ backgroundColor: getCategoryColor(post.category) + "20" }}
          >
            {getCategoryEmoji(post.category)}
            <span
              className="text-sm font-medium capitalize"
              style={{ color: getCategoryColor(post.category) }}
            >
              {post.category}
            </span>
          </div>
        </div>

        <h1 className="text-white text-2xl font-bold mb-3">{post.title}</h1>
        <p className="text-gray-300 text-base leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Post Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTogglePostHeart(post.id)}
            className={`flex items-center gap-2 text-base transition-colors ${
              post.isHearted
                ? "text-red-400 hover:text-red-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <PresetEmoji
              type="HEART"
              size={20}
              style={{
                filter: post.isHearted ? "none" : "grayscale(1)",
              }}
            />
            {post.heartsCount}
          </button>
          <div className="flex items-center gap-2 text-gray-400 text-base">
            <PresetEmoji
              type="SPEECH_BUBBLE"
              size={20}
              style={{ filter: "grayscale(1)" }}
            />
            {post.commentsCount} Comments
          </div>
        </div>
      </div>

      {/* Comments Header */}
      <div className="mb-4 flex-shrink-0">
        <h4 className="text-white font-semibold text-lg">
          Comments ({post.comments.length})
        </h4>
      </div>

      {/* Comments List */}
      <div
        ref={commentsContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-6 scrollbar-hide relative min-h-0"
      >
        {post.comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Main Comment */}
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {comment.username
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm font-medium">
                    {comment.username}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  {comment.content}
                </p>
                <div className="flex items-center space-x-4 pt-1">
                  <button
                    onClick={() => onToggleCommentHeart(comment.id)}
                    className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                      comment.isHearted
                        ? "text-red-500 hover:text-red-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <PresetEmoji
                      type="HEART"
                      size={16}
                      style={{
                        filter: comment.isHearted ? "none" : "grayscale(1)",
                      }}
                    />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors text-sm">
                    Reply
                  </button>
                  {comment.replies && comment.replies.length > 0 && (
                    <button
                      onClick={() => onToggleReplies(comment.id)}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {comment.showReplies ? "Hide" : "View"}{" "}
                      {comment.replies.length} Replies
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.showReplies &&
              comment.replies &&
              comment.replies.length > 0 && (
                <div className="ml-12 space-y-4 border-l-2 border-gray-700 pl-6">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {reply.username.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 text-sm font-medium">
                            {reply.username}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">
                          {reply.content}
                        </p>
                        <div className="flex items-center space-x-4 pt-1">
                          <button
                            onClick={() =>
                              onToggleReplyHeart(comment.id, reply.id)
                            }
                            className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                              reply.isHearted
                                ? "text-red-500 hover:text-red-400"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            <PresetEmoji
                              type="HEART"
                              size={14}
                              style={{
                                filter: reply.isHearted
                                  ? "none"
                                  : "grayscale(1)",
                              }}
                            />
                          </button>
                          <button className="text-gray-400 hover:text-white transition-colors text-sm">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Scroll Hint */}
      {showScrollHint && post.comments.length > 3 && (
        <div className="text-center py-2">
          <p className="text-gray-400 text-xs">Scroll to view more comments</p>
        </div>
      )}

      {/* Comment Input */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ backgroundColor: "#4B5563" }}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        /* Hide scrollbar while keeping scroll functionality */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
}
