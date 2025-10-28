"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  getCharacterImageSrc,
  getCharacterImageStyles,
} from "../../../lib/character-utils";

interface UserAvatarProps {
  user: {
    email?: string;
    user_metadata?: {
      display_name?: string;
    };
  };
  userProfile: {
    profile_picture: string;
  };
  isLoading: boolean;
  onSignOut: () => Promise<void>;
  size?: "small" | "medium" | "large";
  dropdownPosition?: "left" | "right";
  isMobile?: boolean;
}

export default function UserAvatar({
  user,
  userProfile,
  isLoading,
  onSignOut,
  size = "medium",
  dropdownPosition = "right",
  isMobile = false,
}: UserAvatarProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".user-dropdown-container")) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await onSignOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      avatarSize: "w-8 h-8",
      dropdownWidth: "w-32",
      textSize: "text-sm",
      padding: "px-3 py-2",
    },
    medium: {
      avatarSize: "w-10 h-10",
      dropdownWidth: "w-40",
      textSize: "text-base",
      padding: "px-4 py-2",
    },
    large: {
      avatarSize: "w-12 h-12",
      dropdownWidth: "w-40",
      textSize: "text-base",
      padding: "px-4 py-2",
    },
  };

  const config = sizeConfig[size];
  const dropdownPositionClass =
    dropdownPosition === "left" ? "left-0" : "right-0";

  return (
    <>
      <div className="relative user-dropdown-container">
        <button
          onClick={toggleUserDropdown}
          disabled={isLoading}
          className={`${
            config.avatarSize
          } cursor-pointer rounded-full overflow-hidden border-2 transition-all duration-150 transform hover:border-gray-400 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "border-gray-300"
          }`}
          style={{
            backgroundColor: "#D6E5E2",
            pointerEvents: "auto",
          }}
          type="button"
        >
          <Image
            src={getCharacterImageSrc(userProfile.profile_picture)}
            alt={userProfile.profile_picture}
            width={200}
            height={200}
            className="w-auto h-full object-cover opacity-100 grayscale-0"
            style={getCharacterImageStyles(userProfile.profile_picture)}
            quality={100}
          />
        </button>

        {/* Desktop Dropdown Menu */}
        {!isMobile && isUserDropdownOpen && (
          <div
            className={`absolute ${dropdownPositionClass} top-full mt-2 py-5 px-1 w-72 rounded-lg shadow-lg transition-all duration-200 z-50`}
            style={{
              backgroundColor: "#CBE2D8",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* User Info Section */}
            <div className="px-4 pb-3 border-b border-gray-300">
              {/* Avatar */}
              <div className="flex justify-center mb-3">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300"
                  style={{ backgroundColor: "#D6E5E2" }}
                >
                  <Image
                    src={getCharacterImageSrc(userProfile.profile_picture)}
                    alt={userProfile.profile_picture}
                    width={200}
                    height={200}
                    className="w-auto h-full object-cover opacity-100 grayscale-0"
                    style={getCharacterImageStyles(userProfile.profile_picture)}
                    quality={100}
                  />
                </div>
              </div>

              {/* Display Name */}
              <div className="text-center mb-1">
                <div className="font-bold text-lg" style={{ color: "#2F4A5D" }}>
                  {user.user_metadata?.display_name || "User"}
                </div>
              </div>

              {/* Email */}
              <div className="text-center">
                <div
                  className="text-sm opacity-75"
                  style={{ color: "#2F4A5D" }}
                >
                  {user.email}
                </div>
              </div>
            </div>

            {/* Options Section */}
            <div className="py-2">
              <button
                className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-white hover:bg-opacity-30 cursor-pointer"
                style={{ color: "#2F4A5D" }}
                onClick={() => {
                  /* TODO: Change Email */
                }}
              >
                Change Email
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-white hover:bg-opacity-30 cursor-pointer"
                style={{ color: "#2F4A5D" }}
                onClick={() => {
                  /* TODO: Change Display Name */
                }}
              >
                Change Display Name
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-white hover:bg-opacity-30 cursor-pointer"
                style={{ color: "#2F4A5D" }}
                onClick={() => {
                  /* TODO: Change Avatar */
                }}
              >
                Change Avatar
              </button>
            </div>

            {/* Sign Out Button */}
            <div className="px-4 pt-2 border-t border-gray-300">
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className={`w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: "#778554",
                  boxShadow: "0px 4px 0px 1px #57613B",
                  borderRadius: "15px",
                }}
              >
                {isLoading ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Sheet - Rendered via Portal */}
        {isMobile &&
          isUserDropdownOpen &&
          mounted &&
          createPortal(
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9998]"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                onClick={() => setIsUserDropdownOpen(false)}
              />

              {/* Bottom Sheet */}
              <div
                className="fixed bottom-0 left-0 right-0 z-[9999] transform transition-transform duration-300 ease-out"
                style={{
                  backgroundColor: "#CBE2D8",
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                  animation: isUserDropdownOpen
                    ? "slideUp 0.3s ease-out"
                    : "slideDown 0.3s ease-out",
                }}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div
                    className="w-12 h-1 rounded-full"
                    style={{ backgroundColor: "rgba(47, 74, 93, 0.3)" }}
                  />
                </div>

                {/* Content */}
                <div className="px-6 pb-8">
                  {/* User Info Section */}
                  <div className="pb-6 border-b border-gray-300 mb-6">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div
                        className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300"
                        style={{ backgroundColor: "#D6E5E2" }}
                      >
                        <Image
                          src={getCharacterImageSrc(
                            userProfile.profile_picture
                          )}
                          alt={userProfile.profile_picture}
                          width={200}
                          height={200}
                          className="w-auto h-full object-cover opacity-100 grayscale-0"
                          style={getCharacterImageStyles(
                            userProfile.profile_picture
                          )}
                          quality={100}
                        />
                      </div>
                    </div>

                    {/* Display Name */}
                    <div className="text-center mb-2">
                      <div
                        className="font-bold text-xl"
                        style={{ color: "#2F4A5D" }}
                      >
                        {user.user_metadata?.display_name || "User"}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="text-center">
                      <div
                        className="text-base opacity-75"
                        style={{ color: "#2F4A5D" }}
                      >
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Options Section */}
                  <div className="space-y-3 mb-6">
                    <button
                      className="w-full text-center py-3 text-base font-medium rounded-lg transition-all hover:bg-white hover:bg-opacity-30"
                      style={{ color: "#2F4A5D" }}
                      onClick={() => {
                        /* TODO: Change Email */
                      }}
                    >
                      Change Email
                    </button>
                    <button
                      className="w-full text-center py-3 text-base font-medium rounded-lg transition-all hover:bg-white hover:bg-opacity-30"
                      style={{ color: "#2F4A5D" }}
                      onClick={() => {
                        /* TODO: Change Display Name */
                      }}
                    >
                      Change Display Name
                    </button>
                    <button
                      className="w-full text-center py-3 text-base font-medium rounded-lg transition-all hover:bg-white hover:bg-opacity-30"
                      style={{ color: "#2F4A5D" }}
                      onClick={() => {
                        /* TODO: Change Avatar */
                      }}
                    >
                      Change Avatar
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className={`w-full py-4 text-white font-bold text-lg transition-all hover:opacity-90 cursor-pointer ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{
                      backgroundColor: "#778554",
                      boxShadow: "0px 4px 0px 1px #57613B",
                      borderRadius: "15px",
                    }}
                  >
                    {isLoading ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>

      {/* Add animation styles for mobile bottom sheet */}
      {isMobile && (
        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(100%);
            }
          }
        `}</style>
      )}
    </>
  );
}
