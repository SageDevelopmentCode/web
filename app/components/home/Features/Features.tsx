"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeatureCard from "./FeatureCard";
import DesktopCommentsPopup from "./DesktopCommentsPopup";
import ResponsiveSignupModal from "../../navigation/ResponsiveSignupModal";
import { useAuth } from "../../../../contexts/auth-context";

// Comment and Reply interfaces
interface Comment {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  replies?: Reply[];
  showReplies?: boolean;
  isHearted?: boolean;
}

interface Reply {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isHearted?: boolean;
}

export default function Features() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCommentsPopupOpen, setIsCommentsPopupOpen] = useState(false);
  const [currentFeatureForComments, setCurrentFeatureForComments] = useState<{
    id: string;
    title: string;
    images: { src: string; alt: string }[];
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [
        {
          id: 1,
          username: "Sarah M • 4d",
          content: "I completely agree! This verse really touched me too.",
          timestamp: "4d",
          isHearted: false,
        },
        {
          id: 2,
          username: "David L • 3d",
          content: "Such a powerful message. Thanks for sharing your thoughts!",
          timestamp: "3d",
          isHearted: false,
        },
      ],
    },
    {
      id: 2,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [
        {
          id: 3,
          username: "Mary J • 2d",
          content: "Beautiful reflection. God bless!",
          timestamp: "2d",
          isHearted: false,
        },
      ],
    },
    {
      id: 3,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [],
    },
    {
      id: 4,
      username: "Tristan Kelly • 5d",
      content:
        "This was a very good verse that challenged me and spoke to my heart.",
      timestamp: "5d",
      showReplies: false,
      isHearted: false,
      replies: [],
    },
  ]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle mobile state changes - close popup if switching to mobile
  useEffect(() => {
    if (isMobile && isCommentsPopupOpen) {
      setIsCommentsPopupOpen(false);
    }
  }, [isMobile, isCommentsPopupOpen]);

  // Handle comment popup toggle
  const handleCommentToggle = (
    isOpen: boolean,
    featureData?: {
      id: string;
      title: string;
      images: { src: string; alt: string }[];
    }
  ) => {
    // Only show popup on desktop
    if (!isMobile) {
      setIsCommentsPopupOpen(isOpen);
      if (isOpen && featureData) {
        setCurrentFeatureForComments(featureData);
      } else if (!isOpen) {
        setCurrentFeatureForComments(null);
      }
    }
  };

  // Handle popup close
  const handlePopupClose = () => {
    setIsCommentsPopupOpen(false);
    setCurrentFeatureForComments(null);
  };

  // Handle opening signup modal
  const handleOpenSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  // Handle closing signup modal
  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  // Handle successful signup/login
  const handleSignupSuccess = () => {
    setIsSignupModalOpen(false);
    // Optionally show a success message or refresh user data
  };

  // Toggle replies visibility
  const toggleReplies = (commentId: number) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, showReplies: !comment.showReplies }
          : comment
      )
    );
  };

  // Toggle heart for comments
  const toggleCommentHeart = (commentId: number) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, isHearted: !comment.isHearted }
          : comment
      )
    );
  };

  // Toggle heart for replies
  const toggleReplyHeart = (commentId: number, replyId: number) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId && comment.replies) {
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === replyId
              ? { ...reply, isHearted: !reply.isHearted }
              : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    );
  };

  // Define gradient options for alternating cards
  const gradientOptions = [
    "linear-gradient(90.81deg, #4AA78B 0.58%, #68AFFF 99.31%)", // Teal to Blue
    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)", // Purple to Violet
    "linear-gradient(90.81deg, #E67E22 0.58%, #F39C12 99.31%)", // Orange to Golden
    "linear-gradient(90.81deg, #2ECC71 0.58%, #27AE60 99.31%)", // Light Green to Green
    "linear-gradient(90.81deg, #E74C3C 0.58%, #C0392B 99.31%)", // Light Red to Red
    "linear-gradient(90.81deg, #3498DB 0.58%, #2980B9 99.31%)", // Light Blue to Blue
  ];

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
    },
  ];

  // Update current index based on scroll position
  const updateCurrentIndex = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollLeft = container.scrollLeft;

      // Calculate which card is most visible in the viewport
      const cardWithGap = cardWidth + gap;

      // Use a more precise calculation - find the card that's most centered
      let newIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < featureCards.length; i++) {
        const cardPosition = i * cardWithGap;
        const distance = Math.abs(scrollLeft - cardPosition);
        if (distance < minDistance) {
          minDistance = distance;
          newIndex = i;
        }
      }

      // Only update if the index actually changed
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  // Add scroll event listener to track current position
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initialize current index on mount
      updateCurrentIndex();

      container.addEventListener("scroll", updateCurrentIndex);
      return () => container.removeEventListener("scroll", updateCurrentIndex);
    }
  }, []);

  // Also update when window resizes to recalculate positions
  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateCurrentIndex, 100); // Small delay to ensure layout is updated
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.children[0]?.clientWidth || 0;
      const gap = 32; // 2rem gap between cards
      const scrollPosition = index * (cardWidth + gap);

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      // Update the current index immediately to prevent UI lag
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      scrollToCard(newIndex);
    }
  };

  const goToNext = () => {
    if (currentIndex < featureCards.length - 1) {
      const newIndex = currentIndex + 1;
      scrollToCard(newIndex);
    }
  };

  return (
    <section
      className="pt-10 pb-16 sm:px-6 md:px-50 w-full max-w-full overflow-x-visible relative"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-none mx-auto px-4 relative">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Features
        </h2>

        {/* Feature Cards Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth mb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featureCards.map((card, index) => (
            <div key={card.id} className="flex-none">
              <FeatureCard
                id={card.id}
                title={card.title}
                description={card.description}
                images={card.images}
                gradient={gradientOptions[index % gradientOptions.length]}
                onCommentToggle={handleCommentToggle}
                isMobile={isMobile}
                isCommentSidebarOpen={isCommentsPopupOpen}
                isUserSignedIn={!!user}
                onOpenSignupModal={handleOpenSignupModal}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentIndex === 0
                ? "bg-white/10 cursor-not-allowed"
                : "cursor-pointer hover:opacity-80"
            }`}
            style={{
              backgroundColor: currentIndex === 0 ? undefined : "#323817",
            }}
          >
            <ChevronLeft
              size={26}
              color={currentIndex === 0 ? "rgba(255,255,255,0.3)" : "white"}
            />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === featureCards.length - 1}
            className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
              currentIndex === featureCards.length - 1
                ? "bg-white/10 cursor-not-allowed"
                : "cursor-pointer hover:opacity-80"
            }`}
            style={{
              backgroundColor:
                currentIndex === featureCards.length - 1
                  ? undefined
                  : "#323817",
            }}
          >
            <ChevronRight
              size={26}
              color={
                currentIndex === featureCards.length - 1
                  ? "rgba(255,255,255,0.3)"
                  : "white"
              }
            />
          </button>
        </div>

        {/* Desktop Comments Popup */}
        <DesktopCommentsPopup
          isOpen={isCommentsPopupOpen && !isMobile}
          onClose={handlePopupClose}
          comments={comments}
          featureData={currentFeatureForComments}
          onToggleReplies={toggleReplies}
          onToggleCommentHeart={toggleCommentHeart}
          onToggleReplyHeart={toggleReplyHeart}
          isUserSignedIn={!!user}
          onOpenSignupModal={handleOpenSignupModal}
        />

        {/* Signup Modal */}
        <ResponsiveSignupModal
          isOpen={isSignupModalOpen}
          onClose={handleCloseSignupModal}
          onSignupSuccess={handleSignupSuccess}
        />
      </div>
    </section>
  );
}
