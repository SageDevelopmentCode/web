"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../../lib/character-utils";
import FeatureSelector from "./FeatureSelector";
import { Tag, TagsService } from "../../../../lib/supabase/tags";
import { FeedbackService } from "../../../../lib/supabase/feedback";
import { FeedbackTagsService } from "../../../../lib/supabase/feedback_tags";

interface Feature {
  id: string;
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  gradient: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    profile_picture: string;
  };
  user: {
    id: string;
    user_metadata?: {
      display_name?: string;
    };
  };
  features?: Feature[];
  onSuccess?: () => void;
  // Edit mode props
  editMode?: boolean;
  existingFeedbackId?: string;
  existingTitle?: string;
  existingDescription?: string;
  existingFeatureId?: string | null;
  existingTagIds?: string[];
}

// User Avatar Component
function UserAvatar({ profilePicture }: { profilePicture: string }) {
  return (
    <div className="flex justify-center mb-6">
      <div
        className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600"
        style={{ backgroundColor: "#D6E5E2" }}
      >
        <Image
          src={getCharacterImageSrc(profilePicture)}
          alt={profilePicture}
          width={200}
          height={200}
          className="w-auto h-full object-cover opacity-100 grayscale-0"
          style={getCharacterImageStyles(profilePicture)}
          quality={100}
        />
      </div>
    </div>
  );
}

// Title and Description Component
function TitleAndDescription({
  title,
  description,
  isMobile,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  isMobile: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}) {
  return (
    <>
      {/* Title Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title of your post"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-0 py-3 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg font-semibold"
          style={{ color: "#FFFFFF" }}
        />
      </div>

      {/* Description Textarea */}
      <div className={isMobile ? "flex-1 mb-6" : "mb-8"}>
        <textarea
          placeholder="Post description..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={isMobile ? undefined : 8}
          className={`w-full px-0 py-3 bg-transparent border-none outline-none text-gray-300 placeholder-gray-500 text-base resize-none ${
            isMobile ? "h-64" : ""
          }`}
          style={{ color: "#D1D5DB" }}
        />
      </div>
    </>
  );
}

// Suggested Buttons and Submit Component
function SuggestedAndSubmit({
  selectedFeature,
  onFeatureButtonClick,
  onSubmit,
  availableTags,
  selectedTagIds,
  isTagDropdownOpen,
  onToggleTagDropdown,
  onSelectTag,
  onDeleteTag,
  dropdownRef,
  editMode = false,
  isSubmitting = false,
}: {
  selectedFeature: Feature | undefined;
  onFeatureButtonClick: () => void;
  onSubmit: () => void;
  availableTags: Tag[];
  selectedTagIds: string[];
  isTagDropdownOpen: boolean;
  onToggleTagDropdown: () => void;
  onSelectTag: (tagId: string) => void;
  onDeleteTag: (tagId: string) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  editMode?: boolean;
  isSubmitting?: boolean;
}) {
  // Get selected tags objects
  const selectedTags = availableTags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );
  return (
    <>
      {/* Suggested Section */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-3">Suggested</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onFeatureButtonClick}
            className="px-4 py-2 text-white font-semibold rounded-full text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{
              background: selectedFeature
                ? selectedFeature.gradient
                : "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
            }}
          >
            {selectedFeature ? selectedFeature.title : "+ Select a Feature"}
          </button>

          {/* Render selected tags */}
          {selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B3B3B] rounded-full text-sm text-white font-medium"
            >
              <span className="capitalize">{tag.name}</span>
              <button
                onClick={() => onDeleteTag(tag.id)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
                title="Delete tag"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}

          {/* Tag dropdown button */}
          {availableTags.length > 0 &&
            selectedTagIds.length < availableTags.length && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={onToggleTagDropdown}
                  className="px-4 py-2 text-white font-medium rounded-full text-sm cursor-pointer transition-all hover:bg-opacity-80 bg-[#3B3B3B]"
                >
                  + Add a Tag
                </button>

                {/* Dropdown menu */}
                {isTagDropdownOpen && (
                  <div
                    className="absolute bottom-full left-0 mb-2 w-48 max-h-60 overflow-y-auto bg-[#3B3B3B] rounded-lg shadow-lg z-50"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {availableTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => onSelectTag(tag.id)}
                          disabled={isSelected}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            isSelected
                              ? "text-gray-500 cursor-not-allowed bg-[#2A2A2A]"
                              : "text-white hover:bg-[#4A4A4A] cursor-pointer"
                          }`}
                        >
                          <span className="capitalize">{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className={`w-full py-3 text-white font-bold transition-all flex items-center justify-center gap-2 ${
          isSubmitting
            ? "opacity-70 cursor-not-allowed"
            : "hover:opacity-90 cursor-pointer"
        }`}
        style={{
          backgroundColor: "#778554",
          boxShadow: "0px 4px 0px 1px #57613B",
          borderRadius: "15px",
        }}
      >
        {isSubmitting && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        )}
        {isSubmitting
          ? editMode
            ? "Saving..."
            : "Submitting..."
          : editMode
          ? "Save Changes"
          : "Submit Post"}
      </button>
    </>
  );
}

export default function CreatePostModal({
  isOpen,
  onClose,
  userProfile,
  user,
  features = [],
  onSuccess,
  editMode = false,
  existingFeedbackId,
  existingTitle = "",
  existingDescription = "",
  existingFeatureId = null,
  existingTagIds = [],
}: CreatePostModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState(existingTitle);
  const [description, setDescription] = useState(existingDescription);
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    existingFeatureId
  );
  const [isMobile, setIsMobile] = useState(false);
  const [mobileStep, setMobileStep] = useState<"form" | "selectFeature">(
    "form"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] =
    useState<string[]>(existingTagIds);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Set initial values when opening in edit mode
      if (editMode) {
        setTitle(existingTitle);
        setDescription(existingDescription);
        setSelectedFeatureId(existingFeatureId);
        setSelectedTagIds(existingTagIds);
      }
      // Fetch tags when modal opens
      const fetchTags = async () => {
        const { tags, error } = await TagsService.getAllTags();
        if (!error && tags) {
          setAvailableTags(tags);
        }
      };
      fetchTags();
    } else {
      setIsVisible(false);
    }
  }, [
    isOpen,
    editMode,
    existingTitle,
    existingDescription,
    existingFeatureId,
    existingTagIds,
  ]);

  // Handle body scroll lock
  useEffect(() => {
    if (isVisible) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Store the scroll position for restoration
      document.body.setAttribute("data-scroll-y", scrollY.toString());

      return () => {
        // Restore scroll position and unlock body
        const scrollY = parseInt(
          document.body.getAttribute("data-scroll-y") || "0"
        );
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
        document.body.removeAttribute("data-scroll-y");
      };
    }
  }, [isVisible]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }
    };

    if (isTagDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isTagDropdownOpen]);

  const handleClose = () => {
    setIsVisible(false);
    // Reset form
    setTitle("");
    setDescription("");
    setShowFeatureSelector(false);
    setSelectedFeatureId(null);
    setMobileStep("form");
    setSelectedTagIds([]);
    setIsTagDropdownOpen(false);
    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSelectFeature = (featureId: string) => {
    if (selectedFeatureId === featureId) {
      // Deselect if clicking the same feature
      setSelectedFeatureId(null);
    } else {
      setSelectedFeatureId(featureId);
      // On desktop: close the feature selector panel
      if (!isMobile) {
        setShowFeatureSelector(false);
      } else {
        // On mobile: animate transition back to form step
        setIsTransitioning(true);
        setTimeout(() => {
          setMobileStep("form");
          setIsTransitioning(false);
        }, 300);
      }
    }
  };

  const handleFeatureButtonClick = () => {
    if (isMobile) {
      setIsTransitioning(true);
      setTimeout(() => {
        setMobileStep("selectFeature");
        setIsTransitioning(false);
      }, 300);
    } else {
      setShowFeatureSelector(!showFeatureSelector);
    }
  };

  const selectedFeature = features.find((f) => f.id === selectedFeatureId);

  const handleToggleTagDropdown = () => {
    setIsTagDropdownOpen(!isTagDropdownOpen);
  };

  const handleSelectTag = (tagId: string) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
    setIsTagDropdownOpen(false);
  };

  const handleDeleteTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim()) {
      console.error("Title is required");
      return;
    }

    if (!user?.id) {
      console.error("User must be logged in to submit feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editMode && existingFeedbackId) {
        // Update existing feedback
        const { error: feedbackError } = await FeedbackService.updateFeedback(
          existingFeedbackId,
          {
            title: title.trim(),
            description: description.trim() || null,
            feature_id: selectedFeatureId,
          }
        );

        if (feedbackError) {
          console.error("Error updating feedback:", feedbackError);
          setIsSubmitting(false);
          return;
        }

        // Update tags - replace existing tags with new ones
        const { error: tagsError } =
          await FeedbackTagsService.updateFeedbackTags(
            existingFeedbackId,
            selectedTagIds,
            user.id
          );

        if (tagsError) {
          console.error("Error updating tags:", tagsError);
        }

        console.log("Feedback updated successfully");
      } else {
        // Create new feedback post
        const { feedback, error: feedbackError } =
          await FeedbackService.createFeedback({
            user_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            feature_id: selectedFeatureId,
          });

        if (feedbackError || !feedback) {
          console.error("Error creating feedback:", feedbackError);
          setIsSubmitting(false);
          return;
        }

        // Add tags to the feedback if any were selected
        if (selectedTagIds.length > 0) {
          const { error: tagsError } =
            await FeedbackTagsService.addTagsToFeedback(
              feedback.id,
              selectedTagIds,
              user.id
            );

          if (tagsError) {
            console.error("Error adding tags to feedback:", tagsError);
            // Note: Feedback was created successfully, only tags failed
          }
        }

        console.log("Feedback submitted successfully:", feedback);
      }

      // Call onSuccess callback to refetch feedback list
      if (onSuccess) {
        onSuccess();
      }

      // Reset form and close modal
      setTitle("");
      setDescription("");
      setSelectedTagIds([]);
      setSelectedFeatureId(null);
      setIsSubmitting(false);
      handleClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Mobile Bottom Sheet
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-[100] flex items-end justify-center transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          onClick={handleClose}
        />

        {/* Bottom Sheet */}
        <div
          className={`relative w-full h-[85vh] rounded-t-3xl transition-all duration-300 transform overflow-hidden ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          }`}
          style={{ backgroundColor: "#282828" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: "#3B3B3B" }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Sliding container */}
          <div className="relative w-full h-full overflow-x-hidden">
            {/* Form Step */}
            <div
              className={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ${
                mobileStep === "form" ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6">
                <UserAvatar profilePicture={userProfile.profile_picture} />
                <TitleAndDescription
                  title={title}
                  description={description}
                  isMobile={true}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                />
              </div>

              {/* Fixed Bottom Section */}
              <div className="flex-shrink-0 px-6 pb-20">
                <SuggestedAndSubmit
                  selectedFeature={selectedFeature}
                  onFeatureButtonClick={handleFeatureButtonClick}
                  onSubmit={handleSubmit}
                  availableTags={availableTags}
                  selectedTagIds={selectedTagIds}
                  isTagDropdownOpen={isTagDropdownOpen}
                  onToggleTagDropdown={handleToggleTagDropdown}
                  onSelectTag={handleSelectTag}
                  onDeleteTag={handleDeleteTag}
                  dropdownRef={dropdownRef}
                  editMode={editMode}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>

            {/* Feature Selection Step */}
            <div
              className={`absolute inset-0 w-full h-full overflow-y-auto px-6 pb-6 transition-transform duration-300 ${
                mobileStep === "selectFeature"
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            >
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setMobileStep("form")}
                  className="p-2 text-white hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <h3 className="text-white font-bold text-lg flex-1 text-center">
                  Select a Feature
                </h3>
                <div className="w-10"></div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                <FeatureSelector
                  features={features}
                  selectedFeatureId={selectedFeatureId}
                  onSelectFeature={handleSelectFeature}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative mx-4 rounded-3xl overflow-hidden transition-all duration-300 transform ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        } ${showFeatureSelector ? "w-[90vw] max-w-5xl" : "w-[90vw] max-w-2xl"}`}
        style={{ backgroundColor: "#282828" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all cursor-pointer"
        >
          <svg
            className="w-5 h-5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className={`flex ${showFeatureSelector ? "gap-6" : ""}`}>
          {/* Left Side - Form */}
          <div className={`p-8 ${showFeatureSelector ? "flex-1" : "w-full"}`}>
            <UserAvatar profilePicture={userProfile.profile_picture} />
            <TitleAndDescription
              title={title}
              description={description}
              isMobile={false}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
            />
            <SuggestedAndSubmit
              selectedFeature={selectedFeature}
              onFeatureButtonClick={handleFeatureButtonClick}
              onSubmit={handleSubmit}
              availableTags={availableTags}
              selectedTagIds={selectedTagIds}
              isTagDropdownOpen={isTagDropdownOpen}
              onToggleTagDropdown={handleToggleTagDropdown}
              onSelectTag={handleSelectTag}
              onDeleteTag={handleDeleteTag}
              dropdownRef={dropdownRef}
              editMode={editMode}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Right Side - Feature Selector */}
          {showFeatureSelector && (
            <div
              className="w-[400px] p-6 relative"
              style={{
                maxHeight: "80vh",
                borderLeft: "1px solid #3B3B3B",
              }}
            >
              {/* Collapse Button - centered vertically on the left border */}
              <button
                onClick={() => setShowFeatureSelector(false)}
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-80 cursor-pointer z-10"
                style={{ backgroundColor: "#3B3B3B" }}
                title="Collapse"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div className="mb-4">
                <h3 className="text-white font-bold text-lg">
                  Select a Feature
                </h3>
              </div>
              <FeatureSelector
                features={features}
                selectedFeatureId={selectedFeatureId}
                onSelectFeature={handleSelectFeature}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
