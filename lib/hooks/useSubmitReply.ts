import { useCallback } from "react";
import { FeatureCommentService } from "../supabase/feature_comments";
import { UserService } from "../supabase/users";

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

/**
 * Custom hook for handling reply submission and comment refresh
 * Used by both desktop and mobile comment components
 */
export function useSubmitReply(
  featureId: string | undefined,
  userId: string | undefined,
  setComments: (updateFn: (prevComments: Comment[]) => Comment[]) => void,
  setIsLoadingComments: (loading: boolean) => void
) {
  const handleSubmitReply = useCallback(
    async (parentCommentId: string, replyContent: string) => {
      if (!userId || !featureId || !replyContent.trim()) {
        return;
      }

      try {
        // Get user profile for optimistic update
        const { user: userProfile } = await UserService.getUserById(userId);

        // Generate temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const now = new Date().toISOString();

        // Create optimistic reply
        const optimisticReply: Reply = {
          id: tempId,
          content: replyContent.trim(),
          created_at: now,
          user: userProfile
            ? {
                user_id: userProfile.user_id,
                display_name: userProfile.display_name,
                profile_picture: userProfile.profile_picture,
              }
            : { user_id: userId },
          isHearted: false,
          like_count: 0,
          replies: [],
          reply_count: 0,
          showReplies: false,
        };

        // Recursive function to add reply to the correct parent
        const addReplyToComment = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), optimisticReply],
                reply_count: (comment.reply_count || 0) + 1,
                showReplies: true,
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToReplies(comment.replies),
              };
            }
            return comment;
          });
        };

        const addReplyToReplies = (replies: Reply[]): Reply[] => {
          return replies.map((reply) => {
            if (reply.id === parentCommentId) {
              return {
                ...reply,
                replies: [...(reply.replies || []), optimisticReply],
                reply_count: (reply.reply_count || 0) + 1,
                showReplies: true,
              };
            }
            if (reply.replies && reply.replies.length > 0) {
              return {
                ...reply,
                replies: addReplyToReplies(reply.replies),
              };
            }
            return reply;
          });
        };

        // Optimistic update
        setComments((prevComments) => addReplyToComment(prevComments));

        // Create the reply using createFeatureComment with parent_comment_id
        const { comment, error } =
          await FeatureCommentService.createFeatureComment({
            feature_id: featureId,
            user_id: userId,
            content: replyContent.trim(),
            parent_comment_id: parentCommentId,
          });

        if (error || !comment) {
          console.error("Error creating reply:", error);
          // Revert optimistic update on error
          const removeReplyFromComment = (comments: Comment[]): Comment[] => {
            return comments.map((c) => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: c.replies?.filter((r) => r.id !== tempId) || [],
                  reply_count: Math.max((c.reply_count || 1) - 1, 0),
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: removeReplyFromReplies(c.replies),
                };
              }
              return c;
            });
          };

          const removeReplyFromReplies = (replies: Reply[]): Reply[] => {
            return replies.map((r) => {
              if (r.id === parentCommentId) {
                return {
                  ...r,
                  replies: r.replies?.filter((rep) => rep.id !== tempId) || [],
                  reply_count: Math.max((r.reply_count || 1) - 1, 0),
                };
              }
              if (r.replies && r.replies.length > 0) {
                return {
                  ...r,
                  replies: removeReplyFromReplies(r.replies),
                };
              }
              return r;
            });
          };

          setComments((prevComments) => removeReplyFromComment(prevComments));
          return;
        }

        // Replace temporary reply with real one
        const replaceReplyInComment = (comments: Comment[]): Comment[] => {
          return comments.map((c) => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies:
                  c.replies?.map((r) =>
                    r.id === tempId
                      ? {
                          ...optimisticReply,
                          id: comment.id,
                          created_at: comment.created_at,
                        }
                      : r
                  ) || [],
              };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: replaceReplyInReplies(c.replies),
              };
            }
            return c;
          });
        };

        const replaceReplyInReplies = (replies: Reply[]): Reply[] => {
          return replies.map((r) => {
            if (r.id === parentCommentId) {
              return {
                ...r,
                replies:
                  r.replies?.map((rep) =>
                    rep.id === tempId
                      ? {
                          ...optimisticReply,
                          id: comment.id,
                          created_at: comment.created_at,
                        }
                      : rep
                  ) || [],
              };
            }
            if (r.replies && r.replies.length > 0) {
              return {
                ...r,
                replies: replaceReplyInReplies(r.replies),
              };
            }
            return r;
          });
        };

        setComments((prevComments) => replaceReplyInComment(prevComments));
      } catch (error) {
        console.error("Error in handleSubmitReply:", error);
      }
    },
    [userId, featureId, setComments, setIsLoadingComments]
  );

  return handleSubmitReply;
}
