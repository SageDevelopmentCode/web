"use client";

import { useRef, useEffect, useState } from "react";
import { Send, X } from "lucide-react";
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

interface DesktopCommentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  featureData: { title: string; images: { src: string; alt: string }[] } | null;
  onToggleReplies: (commentId: number) => void;
  onToggleCommentHeart: (commentId: number) => void;
  onToggleReplyHeart: (commentId: number, replyId: number) => void;
  isUserSignedIn: boolean;
  onOpenSignupModal: () => void;
}

export default function DesktopCommentsPopup({
  isOpen,
  onClose,
  comments,
  featureData,
  onToggleReplies,
  onToggleCommentHeart,
  onToggleReplyHeart,
  isUserSignedIn,
  onOpenSignupModal,
}: DesktopCommentsPopupProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure the component is rendered before starting animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      setTimeout(() => setShouldRender(false), 200);
    }
  }, [isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (shouldRender) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Store the scroll position for restoration
      document.body.setAttribute("data-scroll-y", scrollY.toString());

      return () => {
        // Restore scroll position and unlock body
        const scrollY = parseInt(
          document.body.getAttribute("data-scroll-y") || "0"
        );
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
        document.body.removeAttribute("data-scroll-y");
      };
    }
  }, [shouldRender]);

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [isOpen, onClose]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

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
    if (isOpen) {
      checkScrollable();
    }
  }, [comments, isOpen]);

  // Handle scroll to hide hint
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && container.scrollTop > 20) {
      setShowScrollHint(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className={`relative bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-7xl h-[80vh] mx-4 flex flex-col transition-all duration-200 ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h4 className="text-white font-semibold text-lg">
            {featureData?.title
              ? `${featureData.title} - Comments`
              : "See what others are saying"}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 transition-colors rounded-lg hover:bg-gray-700 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Feature Images */}
          {featureData && (
            <div className="w-2/5 p-6 flex flex-col">
              <div className="flex space-x-4 h-full">
                {featureData.images.map((image, index) => (
                  <div key={index} className="flex-1">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right Side - Comments */}
          <div
            className={`${
              featureData ? "w-3/5 border-l border-gray-700" : "w-full"
            } p-6 overflow-hidden`}
          >
            <div className="flex-1 flex flex-col h-full">
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
                                      <FavoriteBorderIcon
                                        sx={{ fontSize: 16 }}
                                      />
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
                  <p className="text-gray-400 text-xs">
                    Scroll to view more comments
                  </p>
                </div>
              )}

              {/* Comment Input or Signup Button */}
              <div className="mt-4 border-t border-gray-700 pt-4">
                {isUserSignedIn ? (
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
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSignupModal();
                    }}
                    className="w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer"
                    style={{
                      backgroundColor: "#778554",
                      boxShadow: "0px 4px 0px 1px #57613B",
                      borderRadius: "15px",
                    }}
                  >
                    Sign up or login to comment
                  </button>
                )}
              </div>
            </div>
          </div>
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
