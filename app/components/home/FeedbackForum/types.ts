export interface FeedbackComment {
  id: string; // Changed from number to string (UUID from database)
  user_id: string; // User ID of the comment author
  username: string;
  profile_picture?: string;
  content: string;
  timestamp: string;
  replies?: FeedbackReply[];
  showReplies?: boolean;
  isHearted?: boolean;
  heartsCount: number;
}

export interface FeedbackReply {
  id: string; // Changed from number to string (UUID from database)
  user_id: string; // User ID of the reply author
  username: string;
  profile_picture?: string;
  content: string;
  timestamp: string;
  isHearted?: boolean;
  heartsCount: number;
  replies?: FeedbackReply[]; // Support nested replies
  reply_count?: number;
  showReplies?: boolean;
}

export interface FeedbackTag {
  id: string;
  name: string;
  description?: string | null;
}

export interface FeedbackPost {
  id: number;
  user_id: string; // User ID of the post author
  username: string;
  profile_picture?: string;
  timestamp: string;
  title: string;
  description: string;
  category: "top" | "new" | "upcoming";
  heartsCount: number;
  commentsCount: number;
  isHearted?: boolean;
  comments: FeedbackComment[];
  tags?: FeedbackTag[];
}
