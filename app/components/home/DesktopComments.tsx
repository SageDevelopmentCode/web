"use client";

import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

interface Comment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  replies?: Reply[];
  showReplies?: boolean;
  isHearted?: boolean;
}

interface Reply {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isHearted?: boolean;
}

interface DesktopCommentsProps {
  comments: Comment[];
  onToggleReplies: (commentId: number) => void;
  onToggleCommentHeart: (commentId: number) => void;
  onToggleReplyHeart: (commentId: number, replyId: number) => void;
}

export default function DesktopComments({
  comments,
  onToggleReplies,
  onToggleCommentHeart,
  onToggleReplyHeart,
}: DesktopCommentsProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
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

    // Check initially and when comments change
    checkScrollable();
  }, [comments]);

  // Handle scroll to hide hint
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && container.scrollTop > 20) {
      setShowScrollHint(false);
    }
  };

  return (
    <div
      className="w-[300px] flex-shrink-0 bg-[#1a1a1a] rounded-3xl py-4 px-5 flex flex-col animate-slide-in"
      style={{ height: "100%" }}
    >
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-4 pb-3">
        <h4 className="text-white font-semibold text-lg">
          See what others are saying
        </h4>
      </div>

      {/* Comments List */}
      <div
        ref={commentsContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-4 scrollbar-hide relative"
      >
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Main Comment */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0"></div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm font-medium">
                    {comment.username}
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
                    {comment.isHearted ? (
                      <FavoriteIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                    )}
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
                <div className="ml-11 space-y-3 border-l-2 border-gray-700 pl-4">
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
                            {reply.isHearted ? (
                              <FavoriteIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                            )}
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
      {showScrollHint && (
        <div className="text-center py-2">
          <p className="text-gray-400 text-xs">Scroll to view more comments</p>
        </div>
      )}

      {/* Comment Input */}
      <div className="mt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Say Something..."
            className="w-full text-white placeholder-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ backgroundColor: "#4B5563" }}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

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
