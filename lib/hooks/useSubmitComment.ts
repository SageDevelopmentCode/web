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
 * Custom hook for handling top-level comment submission
 * Used by both desktop and mobile comment components
 */
export function useSubmitComment(
  featureId: string | undefined,
  userId: string | undefined,
  setComments: (comments: Comment[]) => void,
  setIsLoadingComments: (loading: boolean) => void
) {
  const handleSubmitComment = useCallback(
    async (commentContent: string) => {
      if (!userId || !featureId || !commentContent.trim()) {
        return;
      }

      try {
        // Create the comment using createFeatureComment without parent_comment_id
        const { error } = await FeatureCommentService.createFeatureComment({
          feature_id: featureId,
          user_id: userId,
          content: commentContent.trim(),
          parent_comment_id: null, // This makes it a top-level comment
        });

        if (error) {
          console.error("Error creating comment:", error);
          return;
        }

        // Refresh comments to show the new comment
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
            showReplies: false,
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
        console.error("Error in handleSubmitComment:", error);
        setIsLoadingComments(false);
      }
    },
    [userId, featureId, setComments, setIsLoadingComments]
  );

  return handleSubmitComment;
}
