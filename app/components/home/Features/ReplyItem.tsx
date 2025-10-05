"use client";

import { Send } from "lucide-react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Image from "next/image";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";

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

interface ReplyItemProps {
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
}: ReplyItemProps) {
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
            {reply.reply_count && reply.reply_count > 0 ? (
              <button
                onClick={() => onToggleReplies(reply.id)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                {reply.showReplies ? "Hide" : "View"} {reply.reply_count} Replies
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
