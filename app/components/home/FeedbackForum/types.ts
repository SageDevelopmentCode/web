export interface FeedbackComment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  replies?: FeedbackReply[];
  showReplies?: boolean;
  isHearted?: boolean;
  heartsCount: number;
}

export interface FeedbackReply {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isHearted?: boolean;
  heartsCount: number;
}

export interface FeedbackTag {
  id: string;
  name: string;
  description?: string | null;
}

export interface FeedbackPost {
  id: number;
  username: string;
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
