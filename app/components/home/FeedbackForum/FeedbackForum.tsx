"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import FeedbackList from "./FeedbackList";
import FeedbackDetails from "./FeedbackDetails";
import { mockFeedbackPosts, FeedbackPost } from "./types";

export default function FeedbackForum() {
  const [posts, setPosts] = useState<FeedbackPost[]>(mockFeedbackPosts);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const selectedPost = posts.find((post) => post.id === selectedPostId) || null;

  const handleSelectPost = (postId: number) => {
    setSelectedPostId(postId);
  };

  const handleTogglePostHeart = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isHearted: !post.isHearted,
              heartsCount: post.isHearted
                ? post.heartsCount - 1
                : post.heartsCount + 1,
            }
          : post
      )
    );
  };

  const handleToggleCommentHeart = (commentId: number) => {
    if (!selectedPost) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, isHearted: !comment.isHearted }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const handleToggleReplyHeart = (commentId: number, replyId: number) => {
    if (!selectedPost) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: comment.replies?.map((reply) =>
                        reply.id === replyId
                          ? { ...reply, isHearted: !reply.isHearted }
                          : reply
                      ),
                    }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const handleToggleReplies = (commentId: number) => {
    if (!selectedPost) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, showReplies: !comment.showReplies }
                  : comment
              ),
            }
          : post
      )
    );
  };

  return (
    <section
      className="pt-10 pb-16 px-4 sm:px-6 md:px-8 w-full"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Feedback Forum
        </h2>

        {/* Header Section */}
        <div
          className="rounded-3xl px-10 py-6 mb-8"
          style={{ backgroundColor: "#282828" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                Share your feedback:
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                What could we improve to better meet your needs?
              </p>
            </div>

            {/* Right Content - Create Button */}
            <div className="flex-shrink-0">
              <button
                className="px-8 py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                }}
                type="button"
              >
                <Plus size={20} />
                Create
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex gap-6" style={{ height: "80vh" }}>
          {/* Left Side - Feedback List (40%) */}
          <div className="w-2/5 flex-shrink-0 h-full">
            <FeedbackList
              posts={posts}
              selectedPostId={selectedPostId}
              onSelectPost={handleSelectPost}
              onToggleHeart={handleTogglePostHeart}
            />
          </div>

          {/* Right Side - Feedback Details (60%) */}
          <div
            className="w-3/5 flex-shrink-0 rounded-3xl p-6 h-full"
            style={{ backgroundColor: "#323817" }}
          >
            <FeedbackDetails
              post={selectedPost}
              onTogglePostHeart={handleTogglePostHeart}
              onToggleCommentHeart={handleToggleCommentHeart}
              onToggleReplyHeart={handleToggleReplyHeart}
              onToggleReplies={handleToggleReplies}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
