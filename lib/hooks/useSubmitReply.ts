import { useCallback } from "react";
import { FeatureCommentService } from "../supabase/feature_comments";

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
  setComments: (comments: Comment[]) => void,
  setIsLoadingComments: (loading: boolean) => void
) {
  const handleSubmitReply = useCallback(
    async (parentCommentId: string, replyContent: string) => {
      if (!userId || !featureId || !replyContent.trim()) {
        return;
      }

      try {
        // Create the reply using createFeatureComment with parent_comment_id
        const { error } = await FeatureCommentService.createFeatureComment({
          feature_id: featureId,
          user_id: userId,
          content: replyContent.trim(),
          parent_comment_id: parentCommentId,
        });

        if (error) {
          console.error("Error creating reply:", error);
          return;
        }

        // Refresh comments to show the new reply
        setIsLoadingComments(true);
        const { comments: apiComments, error: fetchError } =
          await FeatureCommentService.getFeatureCommentsWithUsers(
            featureId,
            true,
            undefined,
            undefined,
            userId
          );

        if (fetchError) {
          console.error("Error fetching updated comments:", fetchError);
        } else if (apiComments) {
          const formattedComments = apiComments.map((comment) => ({
            ...comment,
            showReplies: true, // Keep replies open after submitting
            isHearted: comment.user_has_liked || false,
            replies:
              comment.replies?.map((reply) => ({
                ...reply,
                isHearted: reply.user_has_liked || false,
              })) || [],
          }));
          setComments(formattedComments);
        }
        setIsLoadingComments(false);
      } catch (error) {
        console.error("Error in handleSubmitReply:", error);
        setIsLoadingComments(false);
      }
    },
    [userId, featureId, setComments, setIsLoadingComments]
  );

  return handleSubmitReply;
}
