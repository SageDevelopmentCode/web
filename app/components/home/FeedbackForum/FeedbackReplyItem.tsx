"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
import Image from "next/image";
import { PresetEmoji } from "../../Twemoji";
import { FeedbackReply } from "./types";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";
import { FeedbackCommentService } from "../../../../lib/supabase/feedback_comments";
import { toast } from "sonner";

export interface FeedbackReplyItemProps {
  reply: FeedbackReply;
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
  onToggleReplies: (replyId: string) => void;
  buttonRefs: {
    current: {
      [key: string]: HTMLButtonElement | null;
    };
  };
  handleReplyHeartClick: (commentId: string, replyId: string) => void;
  handleReplyCancel: () => void;
  isUserSignedIn: boolean;
  onClose: () => void;
  onOpenSignupModal: () => void;
  currentUserId?: string; // Current logged in user's ID
  onUpdateReply?: (replyId: string, newContent: string) => void;
  onDeleteReply?: (replyId: string) => Promise<void>;
  onDeleteClick?: (replyId: string) => void;
}

export default function FeedbackReplyItem({
  reply,
  parentCommentId,
  activeReplyInput,
  setActiveReplyInput,
  replyText,
  setReplyText,
  onToggleReplyHeart,
  onSubmitReply,
  onToggleReplies,
  buttonRefs,
  handleReplyHeartClick,
  handleReplyCancel,
  isUserSignedIn,
  onClose,
  onOpenSignupModal,
  currentUserId,
  onUpdateReply,
  onDeleteReply,
  onDeleteClick,
}: FeedbackReplyItemProps) {
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
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    // Optimistic update
    if (onUpdateReply) {
      onUpdateReply(reply.id, editText);
    }

    try {
      // Call API to update reply
      const { error } = await FeedbackCommentService.updateFeedbackComment(
        reply.id,
        { content: editText }
      );

      if (error) {
        console.error("Error updating reply:", error);
        toast.error("Failed to update reply. Please try again.");
        // Revert optimistic update on error
        if (onUpdateReply) {
          onUpdateReply(reply.id, reply.content);
        }
        setEditText(reply.content);
      } else {
        toast.success("Reply updated successfully");
      }
    } catch (error) {
      console.error("Error in handleSaveEdit:", error);
      toast.error("Failed to update reply. Please try again.");
      // Revert optimistic update on error
      if (onUpdateReply) {
        onUpdateReply(reply.id, reply.content);
      }
      setEditText(reply.content);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(reply.content);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-gray-300"
          style={{ backgroundColor: "#D6E5E2" }}
        >
          {reply.profile_picture ? (
            <Image
              src={getCharacterImageSrc(reply.profile_picture)}
              alt={reply.profile_picture}
              width={200}
              height={200}
              className="w-auto h-full object-cover opacity-100 grayscale-0"
              style={getCharacterImageStyles(reply.profile_picture)}
              quality={100}
            />
          ) : (
            <span className="text-white text-xs font-semibold">
              {reply.username.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm font-medium">
              {reply.username}
            </span>
            <span className="text-gray-500 text-xs">{reply.timestamp}</span>
          </div>
          {isEditing ? (
            <div className="relative">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <div className="flex items-center space-x-4 pt-2">
            <button
              ref={(el) => {
                buttonRefs.current[`reply-${parentCommentId}-${reply.id}`] = el;
              }}
              onClick={() => handleReplyHeartClick(parentCommentId, reply.id)}
              className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: reply.isHearted ? "transparent" : "#282828",
                background: reply.isHearted
                  ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                  : "#282828",
              }}
            >
              <PresetEmoji type="HEART" size={12} />
              <span className="text-white font-medium">
                {reply.heartsCount}
              </span>
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
              className="px-3 py-2 rounded-xl text-white text-sm transition-colors hover:bg-gray-600 cursor-pointer"
              style={{ backgroundColor: "#282828" }}
            >
              Reply
            </button>
            {reply.replies && reply.replies.length > 0 && (
              <button
                onClick={() => onToggleReplies(reply.id)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {reply.showReplies ? "Hide" : "View"} {reply.replies.length}{" "}
                Replies
              </button>
            )}
            {currentUserId && reply.user_id === currentUserId && (
              <div className="relative ml-auto">
                <button
                  onClick={() => {
                    setOpenMenuId(
                      openMenuId === `reply-${reply.id}`
                        ? null
                        : `reply-${reply.id}`
                    );
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-600 transition-all duration-200 cursor-pointer"
                  style={{ backgroundColor: "#282828" }}
                >
                  <MoreHorizontal size={12} />
                </button>
                {openMenuId === `reply-${reply.id}` && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-1 w-32 bg-[#2a2a2a] rounded-lg shadow-lg border border-gray-700 z-10"
                  >
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        if (onDeleteClick) {
                          onDeleteClick(reply.id);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
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
              placeholder={`Reply to ${reply.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ backgroundColor: "#4B5563" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && replyText.trim()) {
                  onSubmitReply(reply.id, replyText);
                  setReplyText("");
                  setActiveReplyInput(null);
                }
              }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <button
                onClick={() => {
                  if (replyText.trim()) {
                    onSubmitReply(reply.id, replyText);
                    setReplyText("");
                    setActiveReplyInput(null);
                  }
                }}
                className="text-white hover:text-purple-400 cursor-pointer transition-all duration-300 p-1"
              >
                <Send size={16} />
              </button>
              <button
                onClick={handleReplyCancel}
                className="text-gray-400 hover:text-white cursor-pointer transition-all duration-300 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {reply.showReplies && reply.replies && reply.replies.length > 0 && (
        <div className="ml-9 space-y-4 border-l-2 border-gray-700 pl-6">
          {reply.replies.map((nestedReply) => (
            <FeedbackReplyItem
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
              buttonRefs={buttonRefs}
              handleReplyHeartClick={handleReplyHeartClick}
              handleReplyCancel={handleReplyCancel}
              isUserSignedIn={isUserSignedIn}
              onClose={onClose}
              onOpenSignupModal={onOpenSignupModal}
              currentUserId={currentUserId}
              onUpdateReply={onUpdateReply}
              onDeleteReply={onDeleteReply}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
