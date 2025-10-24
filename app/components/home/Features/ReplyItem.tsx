"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MoreVertical, Check, X } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Image from "next/image";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";
import { FeatureCommentService } from "../../../../lib/supabase/feature_comments";
import type { Reply } from "./types";

interface ReplyItemProps {
  reply: Reply;
  parentCommentId: string;
  activeReplyInput: string | null;
  setActiveReplyInput: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onToggleReplyHeart: (commentId: string, replyId: string) => void;
  onSubmitReply: (
    parentCommentId: string,
    replyContent: string
  ) => Promise<void>;
  onToggleReplies: (commentId: string) => void;
  isUserSignedIn: boolean;
  onClose: () => void;
  onOpenSignupModal: () => void;
  currentUserId?: string;
  isMobile?: boolean;
  onUpdateReply?: (replyId: string, newContent: string) => void;
}

export default function ReplyItem({
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
  currentUserId,
  isMobile = false,
  onUpdateReply,
}: ReplyItemProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside menu to close it
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutsideMenu);
      return () =>
        document.removeEventListener("mousedown", handleClickOutsideMenu);
    }
  }, [openMenuId]);

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditText(reply.content);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === reply.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    // Optimistic update
    if (onUpdateReply) {
      onUpdateReply(reply.id, editText);
    }

    try {
      // Call API to update comment
      const { error } = await FeatureCommentService.updateFeatureComment(
        reply.id,
        { content: editText }
      );

      if (error) {
        console.error("Error updating reply:", error);
        // Revert optimistic update on error
        if (onUpdateReply) {
          onUpdateReply(reply.id, reply.content);
        }
        setEditText(reply.content);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error in handleSaveEdit:", error);
      // Revert optimistic update on error
      if (onUpdateReply) {
        onUpdateReply(reply.id, reply.content);
      }
      setEditText(reply.content);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(reply.content);
    setIsEditing(false);
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm font-medium">
                {reply.user?.display_name || "Anonymous"}
              </span>
            </div>
            {currentUserId && reply.user?.user_id === currentUserId && (
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === reply.id ? null : reply.id)
                  }
                  className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <MoreVertical size={14} />
                </button>
                {openMenuId === reply.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-1 w-32 bg-[#2a2a2a] rounded-lg shadow-lg border border-gray-700 z-10"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg cursor-pointer transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        // Delete functionality (not implemented)
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="relative">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-white placeholder-white rounded-xl px-4 py-3 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ backgroundColor: "#4B5563" }}
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className={`p-1.5 text-green-400 hover:text-green-300 transition-colors rounded hover:bg-gray-600 ${
                    isSaving
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  title="Save"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-green-400"></div>
                  ) : (
                    <Check size={18} />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`p-1.5 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-gray-600 ${
                    isSaving
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white text-sm leading-relaxed">
              {reply.content}
            </p>
          )}
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
            {reply.reply_count && reply.reply_count > 0 ? (
              <button
                onClick={() => onToggleReplies(reply.id)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {reply.showReplies ? "Hide" : "View"} {reply.reply_count}{" "}
                Replies
              </button>
            ) : null}
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
              currentUserId={currentUserId}
              isMobile={isMobile}
              onUpdateReply={onUpdateReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
