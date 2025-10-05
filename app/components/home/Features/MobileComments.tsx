"use client";

import { useRef, useEffect, useState } from "react";
import { Send } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Image from "next/image";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  replies?: Reply[];
  reply_count?: number;
  showReplies?: boolean;
  isHearted?: boolean;
  like_count?: number;
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  user?: {
    user_id: string;
    display_name?: string;
    profile_picture?: string;
  };
  isHearted?: boolean;
  like_count?: number;
  replies?: Reply[];
  reply_count?: number;
  showReplies?: boolean;
}

interface MobileCommentsProps {
  comments: Comment[];
  isOpen: boolean;
  isClosing: boolean;
  showOverlay: boolean;
  onClose: () => void;
  onToggleReplies: (commentId: string) => void;
  onToggleCommentHeart: (commentId: string) => void;
  onToggleReplyHeart: (commentId: string, replyId: string) => void;
  onSubmitReply: (parentCommentId: string, replyContent: string) => Promise<void>;
  isUserSignedIn: boolean;
  onOpenSignupModal: () => void;
  isLoadingComments?: boolean;
}

// Recursive ReplyItem Component
function ReplyItem({
  reply,
  parentCommentId,
  activeReplyInput,
  setActiveReplyInput,
  replyText,
  setReplyText,
  onToggleReplyHeart,
  onSubmitReply,
  onToggleReplies,
  isUserSignedIn,
  onClose,
  onOpenSignupModal,
}: {
  reply: Reply;
  parentCommentId: string;
  activeReplyInput: string | null;
  setActiveReplyInput: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onToggleReplyHeart: (commentId: string, replyId: string) => void;
  onSubmitReply: (parentCommentId: string, replyContent: string) => Promise<void>;
  onToggleReplies: (commentId: string) => void;
  isUserSignedIn: boolean;
  onClose: () => void;
  onOpenSignupModal: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-300"
          style={{ backgroundColor: "#D6E5E2" }}
        >
          {reply.user?.profile_picture ? (
            <Image
              src={getCharacterImageSrc(reply.user.profile_picture)}
              alt={reply.user.profile_picture}
              width={200}
              height={200}
              className="w-auto h-full object-cover opacity-100 grayscale-0"
              style={getCharacterImageStyles(reply.user.profile_picture)}
              quality={100}
            />
          ) : (
            <div className="w-full h-full bg-blue-500 rounded-full"></div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm font-medium">
              {reply.user?.display_name || "Anonymous"}
            </span>
          </div>
          <p className="text-white text-sm leading-relaxed">{reply.content}</p>
          <div className="flex items-center space-x-4 pt-1">
            <button
              onClick={() => onToggleReplyHeart(parentCommentId, reply.id)}
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
              {reply.like_count && reply.like_count > 0 ? (
                <span className="text-xs">{reply.like_count}</span>
              ) : null}
            </button>
            <button
              onClick={() => {
                if (!isUserSignedIn) {
                  onClose();
                  onOpenSignupModal();
                } else {
                  setActiveReplyInput(
                    activeReplyInput === reply.id ? null : reply.id
                  );
                }
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
            >
              Reply
            </button>
            {reply.reply_count && reply.reply_count > 0 && (
              <button
                onClick={() => onToggleReplies(reply.id)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {reply.showReplies ? "Hide" : "View"} {reply.reply_count} Replies
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {activeReplyInput === reply.id && (
        <div className="ml-9">
          <div className="relative">
            <input
              type="text"
              placeholder="Say Something..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && replyText.trim()) {
                  onSubmitReply(reply.id, replyText);
                  setReplyText("");
                  setActiveReplyInput(null);
                }
              }}
              className="w-full text-white placeholder-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: "#4B5563" }}
            />
            <button
              onClick={() => {
                if (replyText.trim()) {
                  onSubmitReply(reply.id, replyText);
                  setReplyText("");
                  setActiveReplyInput(null);
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {reply.showReplies && reply.replies && reply.replies.length > 0 && (
        <div className="ml-9 space-y-3 border-l-2 border-gray-700 pl-4">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              parentCommentId={parentCommentId}
              activeReplyInput={activeReplyInput}
              setActiveReplyInput={setActiveReplyInput}
              replyText={replyText}
              setReplyText={setReplyText}
              onToggleReplyHeart={onToggleReplyHeart}
              onSubmitReply={onSubmitReply}
              onToggleReplies={onToggleReplies}
              isUserSignedIn={isUserSignedIn}
              onClose={onClose}
              onOpenSignupModal={onOpenSignupModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileComments({
  comments,
  isOpen,
  isClosing,
  showOverlay,
  onClose,
  onToggleReplies,
  onToggleCommentHeart,
  onToggleReplyHeart,
  onSubmitReply,
  isUserSignedIn,
  onOpenSignupModal,
  isLoadingComments = false,
}: MobileCommentsProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [activeReplyInput, setActiveReplyInput] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
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
  }, [comments, isOpen]);

  // Handle scroll to hide hint
  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (container && container.scrollTop > 20) {
      setShowScrollHint(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] transition-opacity duration-300"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: showOverlay && !isClosing ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-0 z-[101] flex items-end pointer-events-none">
        <div
          className={`w-full bg-[#1a1a1a] rounded-t-3xl pointer-events-auto ${
            isClosing ? "animate-slide-down" : "animate-slide-up"
          }`}
          style={{ height: "75vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottom Sheet Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h4 className="text-white font-semibold text-lg">
              See what others are saying
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Comments List */}
          <div
            ref={commentsContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            style={{ height: "calc(75vh - 160px)" }}
          >
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-gray-400">
                  No comments yet. Be the first to comment!
                </span>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="flex space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-300"
                      style={{ backgroundColor: "#D6E5E2" }}
                    >
                      {comment.user?.profile_picture ? (
                        <Image
                          src={getCharacterImageSrc(
                            comment.user.profile_picture
                          )}
                          alt={comment.user.profile_picture}
                          width={200}
                          height={200}
                          className="w-auto h-full object-cover opacity-100 grayscale-0"
                          style={getCharacterImageStyles(
                            comment.user.profile_picture
                          )}
                          quality={100}
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm font-medium">
                          {comment.user?.display_name || "Anonymous"}
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
                          {comment.like_count && comment.like_count > 0 ? (
                            <span className="text-xs">{comment.like_count}</span>
                          ) : null}
                        </button>
                        <button
                          onClick={() => {
                            if (!isUserSignedIn) {
                              onClose();
                              onOpenSignupModal();
                            } else {
                              setActiveReplyInput(activeReplyInput === comment.id ? null : comment.id);
                            }
                          }}
                          className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
                        >
                          Reply
                        </button>
                        {comment.reply_count && comment.reply_count > 0 && (
                          <button
                            onClick={() => onToggleReplies(comment.id)}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            {comment.showReplies ? "Hide" : "View"}{" "}
                            {comment.reply_count} Replies
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reply Input for Comment */}
                  {activeReplyInput === comment.id && (
                    <div className="ml-11 mt-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Say Something..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && replyText.trim()) {
                              onSubmitReply(comment.id, replyText);
                              setReplyText("");
                              setActiveReplyInput(null);
                            }
                          }}
                          className="w-full text-white placeholder-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ backgroundColor: "#4B5563" }}
                        />
                        <button
                          onClick={() => {
                            if (replyText.trim()) {
                              onSubmitReply(comment.id, replyText);
                              setReplyText("");
                              setActiveReplyInput(null);
                            }
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-400 cursor-pointer transition-all duration-300"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.showReplies &&
                    comment.replies &&
                    comment.replies.length > 0 && (
                      <div className="ml-11 space-y-3 border-l-2 border-gray-700 pl-4">
                        {comment.replies.map((reply) => (
                          <ReplyItem
                            key={reply.id}
                            reply={reply}
                            parentCommentId={comment.id}
                            activeReplyInput={activeReplyInput}
                            setActiveReplyInput={setActiveReplyInput}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            onToggleReplyHeart={onToggleReplyHeart}
                            onSubmitReply={onSubmitReply}
                            onToggleReplies={onToggleReplies}
                            isUserSignedIn={isUserSignedIn}
                            onClose={onClose}
                            onOpenSignupModal={onOpenSignupModal}
                          />
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input or Signup Button */}
          <div className="px-4 py-4 border-t border-gray-700">
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

      {/* CSS Styles */}
      <style jsx>{`
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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
    </>
  );
}
