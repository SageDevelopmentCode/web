"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft } from "lucide-react";
import { PresetEmoji } from "../../Twemoji";
import FeedbackList from "./FeedbackList";
import FeedbackDetails from "./FeedbackDetails";
import { mockFeedbackPosts, FeedbackPost } from "./types";

export default function FeedbackForum() {
  const [posts, setPosts] = useState<FeedbackPost[]>(mockFeedbackPosts);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isClosingBottomSheet, setIsClosingBottomSheet] = useState(false);
  const [bottomSheetView, setBottomSheetView] = useState<"list" | "details">(
    "list"
  );

  const selectedPost = posts.find((post) => post.id === selectedPostId) || null;

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectPost = (postId: number) => {
    setSelectedPostId(postId);
    if (isMobile) {
      setShowBottomSheet(true);
      setBottomSheetView("details");
    }
  };

  const handleViewAll = () => {
    setShowBottomSheet(true);
    setBottomSheetView("list");
  };

  const handleCloseBottomSheet = () => {
    setIsClosingBottomSheet(true);
    setTimeout(() => {
      setShowBottomSheet(false);
      setIsClosingBottomSheet(false);
      setSelectedPostId(null);
    }, 300); // Match the animation duration
  };

  const handleBackToList = () => {
    setBottomSheetView("list");
    setSelectedPostId(null);
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
      id="feedback-forum"
      className="pt-10 pb-16 px-4 sm:px-6 md:px-8 w-full"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Feedback Forum
        </h2>

        {/* Header Section */}
        <div
          className={`rounded-3xl mb-8 ${
            isMobile ? "px-4 py-4" : "px-10 py-6"
          }`}
          style={{ backgroundColor: "#282828" }}
        >
          {isMobile ? (
            /* Mobile Layout - Compact */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-white text-lg font-bold mb-1">
                  Share your feedback:
                </h3>
                <p className="text-gray-300 text-sm">
                  What could we improve to better meet your needs?
                </p>
              </div>
              <button
                className="w-full py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
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
          ) : (
            /* Desktop Layout */
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
          )}
        </div>

        {/* Desktop Layout */}
        {!isMobile && (
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
        )}

        {/* Mobile Layout - Top 3 Posts */}
        {isMobile && (
          <div className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                onClick={() => handleSelectPost(post.id)}
                className="p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ backgroundColor: "#323817" }}
              >
                {/* Post Content */}
                <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                  {post.description}
                </p>

                {/* Combined User Info and Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        {post.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-300 text-sm font-medium">
                        {post.username}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePostHeart(post.id);
                      }}
                      className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: post.isHearted
                          ? "transparent"
                          : "#282828",
                        background: post.isHearted
                          ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                          : "#282828",
                      }}
                    >
                      <PresetEmoji type="HEART" size={16} />
                      <span className="text-white font-medium">
                        {post.heartsCount}
                      </span>
                    </button>
                    <div
                      className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm"
                      style={{ backgroundColor: "#282828" }}
                    >
                      <PresetEmoji type="SPEECH_BUBBLE" size={16} />
                      <span className="text-white font-medium">
                        {post.commentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* View All Button */}
            <button
              onClick={handleViewAll}
              className="w-full py-4 mt-6 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90"
              style={{
                background:
                  "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
              }}
            >
              View All Feedback
            </button>
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && showBottomSheet && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 z-[100] transition-opacity duration-300"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                opacity: showBottomSheet && !isClosingBottomSheet ? 1 : 0,
              }}
              onClick={handleCloseBottomSheet}
            />

            {/* Bottom Sheet */}
            <div
              className={`fixed bottom-0 left-0 right-0 rounded-t-3xl z-[101] ${
                isClosingBottomSheet ? "animate-slide-down" : "animate-slide-up"
              }`}
              style={{ height: "95vh", backgroundColor: "#3C4806" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 ">
                {bottomSheetView === "details" && (
                  <button
                    onClick={handleBackToList}
                    className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <h3 className="text-white font-semibold text-lg flex-1 text-center">
                  {bottomSheetView === "details"
                    ? "Feedback Details"
                    : "All Feedback"}
                </h3>
                <button
                  onClick={handleCloseBottomSheet}
                  className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="h-full overflow-hidden">
                {bottomSheetView === "list" ? (
                  <FeedbackList
                    posts={posts}
                    selectedPostId={selectedPostId}
                    onSelectPost={handleSelectPost}
                    onToggleHeart={handleTogglePostHeart}
                    isMobile={true}
                  />
                ) : (
                  <div className="p-4 h-full">
                    <FeedbackDetails
                      post={selectedPost}
                      onTogglePostHeart={handleTogglePostHeart}
                      onToggleCommentHeart={handleToggleCommentHeart}
                      onToggleReplyHeart={handleToggleReplyHeart}
                      onToggleReplies={handleToggleReplies}
                      isMobile={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slideUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </section>
  );
}
