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
 * Custom hook for handling top-level comment submission
 * Used by both desktop and mobile comment components
 */
export function useSubmitComment(
  featureId: string | undefined,
  userId: string | undefined,
  setComments: (updateFn: (prevComments: Comment[]) => Comment[]) => void,
  setIsLoadingComments: (loading: boolean) => void
) {
  const handleSubmitComment = useCallback(
    async (commentContent: string) => {
      if (!userId || !featureId || !commentContent.trim()) {
        return;
      }

      try {
        // Get user profile for optimistic update
        const { user: userProfile } = await UserService.getUserById(userId);

        // Generate temporary ID for optimistic update
        const tempId = `temp-${Date.now()}`;
        const now = new Date().toISOString();

        // Optimistic update - add new comment to the top
        const optimisticComment: Comment = {
          id: tempId,
          content: commentContent.trim(),
          created_at: now,
          user: userProfile
            ? {
                user_id: userProfile.user_id,
                display_name: userProfile.display_name,
                profile_picture: userProfile.profile_picture,
              }
            : { user_id: userId },
          replies: [],
          reply_count: 0,
          showReplies: false,
          isHearted: false,
          like_count: 0,
        };

        setComments((prevComments) => [optimisticComment, ...prevComments]);

        // Create the comment using createFeatureComment without parent_comment_id
        const { comment, error } =
          await FeatureCommentService.createFeatureComment({
            feature_id: featureId,
            user_id: userId,
            content: commentContent.trim(),
            parent_comment_id: null, // This makes it a top-level comment
          });

        if (error || !comment) {
          console.error("Error creating comment:", error);
          // Revert optimistic update on error
          setComments((prevComments) =>
            prevComments.filter((c) => c.id !== tempId)
          );
          return;
        }

        // Replace temporary comment with real one
        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === tempId
              ? {
                  ...optimisticComment,
                  id: comment.id,
                  created_at: comment.created_at,
                }
              : c
          )
        );
      } catch (error) {
        console.error("Error in handleSubmitComment:", error);
      }
    },
    [userId, featureId, setComments, setIsLoadingComments]
  );

  return handleSubmitComment;
}
