"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft } from "lucide-react";
import { PresetEmoji } from "../../Twemoji";
import FeedbackList from "./FeedbackList";
import FeedbackDetails from "./FeedbackDetails";
import CreatePostModal from "./CreatePostModal";
import { mockFeedbackPosts, FeedbackPost } from "./types";
import { useSectionLazyLoad } from "../../../../lib/hooks/useSectionLazyLoad";

interface FeedbackForumProps {
  isUserSignedIn?: boolean;
  onOpenSignupModal?: () => void;
  onCloseFeedbackForum?: () => void;
  userProfile?: {
    profile_picture: string;
  };
  user?: {
    id: string;
    user_metadata?: {
      display_name?: string;
    };
  };
}

export default function FeedbackForum({
  isUserSignedIn = false,
  onOpenSignupModal = () => {},
  onCloseFeedbackForum = () => {},
  userProfile,
  user,
}: FeedbackForumProps) {
  const [posts, setPosts] = useState<FeedbackPost[]>(mockFeedbackPosts);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isClosingBottomSheet, setIsClosingBottomSheet] = useState(false);
  const [bottomSheetView, setBottomSheetView] = useState<"list" | "details">(
    "list"
  );
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Section lazy loading
  const { ref: sectionRef, hasLoaded } = useSectionLazyLoad({
    threshold: 0.2,
    rootMargin: "100px",
    triggerOnce: true,
  });

  const selectedPost = posts.find((post) => post.id === selectedPostId) || null;

  // Define gradient options for feature cards
  const gradientOptions = [
    "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)", // Teal to Blue
    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)", // Purple to Violet
    "linear-gradient(90.81deg, #E67E22 0.58%, #F39C12 99.31%)", // Orange to Golden
    "linear-gradient(90.81deg, #2ECC71 0.58%, #27AE60 99.31%)", // Light Green to Green
    "linear-gradient(90.81deg, #E74C3C 0.58%, #C0392B 99.31%)", // Light Red to Red
    "linear-gradient(90.81deg, #3498DB 0.58%, #2980B9 99.31%)", // Light Blue to Blue
  ];

  // Feature cards data with gradients
  const featureCards = [
    {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      title: "Get Started Easily",
      description:
        "Simple sign-up process to begin your spiritual journey with personalized guidance.",
      images: [
        {
          src: "/assets/feature_mockups/SignUp.png",
          alt: "Sign Up Interface",
        },
        {
          src: "/assets/feature_mockups/Dashboard.png",
          alt: "Dashboard Overview",
        },
      ],
      gradient: gradientOptions[0],
    },
    {
      id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      title: "Set Meaningful Goals",
      description:
        "Create and track spiritual goals with inspiring ideas to grow your faith.",
      images: [
        {
          src: "/assets/feature_mockups/GoalsList.png",
          alt: "Goals List",
        },
        {
          src: "/assets/feature_mockups/GoalsIdeas.png",
          alt: "Goal Ideas",
        },
      ],
      gradient: gradientOptions[1],
    },
    {
      id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      title: "Navigate Daily Challenges",
      description:
        "Balance your workday priorities while staying connected to your spiritual struggles.",
      images: [
        {
          src: "/assets/feature_mockups/Workday.png",
          alt: "Workday Planning",
        },
        {
          src: "/assets/feature_mockups/Struggles.png",
          alt: "Spiritual Struggles",
        },
      ],
      gradient: gradientOptions[2],
    },
    {
      id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
      title: "Daily Check-ins",
      description:
        "Regular spiritual check-ins to maintain accountability and track your progress.",
      images: [
        {
          src: "/assets/feature_mockups/CheckInOne.png",
          alt: "Check-in Step One",
        },
        {
          src: "/assets/feature_mockups/CheckInTwo.png",
          alt: "Check-in Step Two",
        },
      ],
      gradient: gradientOptions[3],
    },
    {
      id: "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
      title: "Immersive Bible Reading",
      description:
        "Engage with Scripture through interactive reading experiences and detailed insights.",
      images: [
        {
          src: "/assets/feature_mockups/Reading.png",
          alt: "Bible Reading",
        },
        {
          src: "/assets/feature_mockups/ReadingDetails.png",
          alt: "Reading Details",
        },
      ],
      gradient: gradientOptions[4],
    },
    {
      id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
      title: "Community Discussions",
      description:
        "Connect with others through verse comments and meaningful conversation threads.",
      images: [
        {
          src: "/assets/feature_mockups/VerseComments.png",
          alt: "Verse Comments",
        },
        {
          src: "/assets/feature_mockups/VerseThreads.png",
          alt: "Discussion Threads",
        },
      ],
      gradient: gradientOptions[5],
    },
    {
      id: "6ba7b815-9dad-11d1-80b4-00c04fd430c8",
      title: "Spiritual Battles",
      description:
        "Engage in spiritual warfare through interactive battles that strengthen your faith.",
      images: [
        {
          src: "/assets/feature_mockups/Battle.png",
          alt: "Battle Interface",
        },
        {
          src: "/assets/feature_mockups/Battling.png",
          alt: "Active Battle",
        },
      ],
      gradient: gradientOptions[0],
    },
    {
      id: "6ba7b816-9dad-11d1-80b4-00c04fd430c8",
      title: "Challenge Selection",
      description:
        "Choose your difficulty level and answer questions to test your biblical knowledge.",
      images: [
        {
          src: "/assets/feature_mockups/DifficultySelection.png",
          alt: "Difficulty Selection",
        },
        {
          src: "/assets/feature_mockups/AnswerSelection.png",
          alt: "Answer Selection",
        },
      ],
      gradient: gradientOptions[1],
    },
  ];

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
      ref={sectionRef}
      id="feedback-forum"
      className={`pt-10 pb-16 px-4 sm:px-6 md:px-8 w-full transition-opacity duration-700 ${
        hasLoaded ? "opacity-100" : "opacity-0"
      }`}
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
                  What could we build or improve to better meet your needs?
                </p>
              </div>
              <button
                className="w-full py-3 text-white font-semibold rounded-full text-base cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                }}
                type="button"
                onClick={() => setShowCreatePostModal(true)}
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
                  What could we build or improve to better meet your needs?
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
                  onClick={() => setShowCreatePostModal(true)}
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
                isUserSignedIn={isUserSignedIn}
                onOpenSignupModal={() => {
                  onCloseFeedbackForum();
                  onOpenSignupModal();
                }}
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

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs rounded-full bg-[#4A4A4A] text-gray-300"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

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
                boxShadow: "0px 4px 0px 1px #764B6F",
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
                      isUserSignedIn={isUserSignedIn}
                      onOpenSignupModal={() => {
                        handleCloseBottomSheet();
                        onOpenSignupModal();
                      }}
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

      {/* Create Post Modal */}
      {userProfile && user && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          userProfile={userProfile}
          user={user}
          features={featureCards}
        />
      )}
    </section>
  );
}
