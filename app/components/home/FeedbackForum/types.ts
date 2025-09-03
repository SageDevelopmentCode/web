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
}

export const mockFeedbackPosts: FeedbackPost[] = [
  {
    id: 1,
    username: "Julius Cecilia",
    timestamp: "5d",
    title: "Have the reading duration for each book",
    description:
      "Users should be able to see the duration or remaining duration of how long it takes for them to finish the book they're reading.",
    category: "top",
    heartsCount: 5,
    commentsCount: 5,
    isHearted: true,
    comments: [
      {
        id: 1,
        username: "Tristan Kelly",
        content:
          "This was a very good verse that challenged me and spoke to my heart.",
        timestamp: "5d",
        isHearted: false,
        heartsCount: 2,
        replies: [
          {
            id: 1,
            username: "Julius Cecilia",
            content: "Glad it spoke to you too!",
            timestamp: "4d",
            isHearted: true,
            heartsCount: 1,
          },
        ],
      },
      {
        id: 2,
        username: "Sarah Johnson",
        content:
          "I love this feature idea! It would really help with planning my reading schedule.",
        timestamp: "4d",
        isHearted: true,
        heartsCount: 4,
      },
    ],
  },
  {
    id: 2,
    username: "Tristan Kelly",
    timestamp: "5d",
    title: "Better notification system",
    description:
      "The current notifications are hard to see. We need better visual indicators and sound alerts.",
    category: "new",
    heartsCount: 3,
    commentsCount: 2,
    isHearted: false,
    comments: [
      {
        id: 1,
        username: "Mike Chen",
        content: "Totally agree! Sometimes I miss important updates.",
        timestamp: "4d",
        isHearted: true,
        heartsCount: 3,
      },
    ],
  },
  {
    id: 3,
    username: "Sarah Johnson",
    timestamp: "3d",
    title: "Dark mode support",
    description:
      "It would be great to have a dark mode option for better reading at night.",
    category: "upcoming",
    heartsCount: 8,
    commentsCount: 12,
    isHearted: true,
    comments: [
      {
        id: 1,
        username: "Alex Rivera",
        content: "Dark mode is essential! My eyes would thank you.",
        timestamp: "3d",
        isHearted: true,
        heartsCount: 7,
      },
      {
        id: 2,
        username: "David Kim",
        content: "Yes please! This should be a priority feature.",
        timestamp: "2d",
        isHearted: false,
        heartsCount: 5,
      },
    ],
  },
  {
    id: 4,
    username: "Mike Chen",
    timestamp: "2d",
    title: "Offline reading capability",
    description:
      "Allow users to download content for offline reading when internet is not available.",
    category: "new",
    heartsCount: 6,
    commentsCount: 4,
    isHearted: false,
    comments: [
      {
        id: 1,
        username: "Lisa Wang",
        content: "This would be perfect for my commute!",
        timestamp: "1d",
        isHearted: true,
        heartsCount: 2,
      },
    ],
  },
  {
    id: 5,
    username: "Alex Rivera",
    timestamp: "1d",
    title: "Better search functionality",
    description:
      "The current search is limited. We need advanced filters and better keyword matching.",
    category: "top",
    heartsCount: 4,
    commentsCount: 3,
    isHearted: true,
    comments: [
      {
        id: 1,
        username: "Emma Thompson",
        content: "Search improvements would save so much time!",
        timestamp: "1d",
        isHearted: false,
        heartsCount: 1,
      },
    ],
  },
];
