// Shared type definitions for feature comments and replies

export interface Comment {
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

export interface Reply {
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
