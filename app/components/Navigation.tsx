"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ResponsiveSignupModal from "./navigation/ResponsiveSignupModal";
import UserAvatar from "./navigation/UserAvatar";
import { useAuth } from "../../contexts/auth-context";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  // Get auth state from context
  const { user, userProfile, isLoading, signOut } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const menuItems = [
    { name: "Home", isActive: true, disabled: false },
    { name: "About", isActive: false, disabled: true, badge: "Coming Soon" },
    {
      name: "SageDex",
      isActive: false,
      disabled: true,
      badge: "Coming Soon",
    },
    // { name: "Features", isActive: false },
    // Only show Sign In / Sign Up if user is not logged in
    ...(!user
      ? [
          {
            name: "Sign In / Sign Up",
            isActive: false,
            disabled: false,
          },
        ]
      : []),
  ];

  const handleMenuClick = (itemName: string) => {
    if (itemName === "Sign In / Sign Up") {
      setIsSignupModalOpen(true);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block absolute top-4 sm:top-6 right-4 sm:right-6 z-50 pointer-events-auto">
        <div className="flex gap-4 lg:gap-7 items-center">
          {menuItems.map((item) => (
            <div key={item.name} className="relative">
              <button
                onClick={() => handleMenuClick(item.name)}
                disabled={isLoading || item.disabled}
                className={`px-3 lg:px-5 py-2 rounded-xl text-white font-bold transition-all text-sm lg:text-base ${
                  isLoading || item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-80 cursor-pointer"
                }`}
                style={{
                  background: item.isActive
                    ? "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)"
                    : "#B84786",
                  pointerEvents: "auto",
                }}
                type="button"
              >
                {item.name}
              </button>
              {item.badge && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap"
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#1F1F1F",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          {/* User Avatar Dropdown - Desktop */}
          {user && userProfile?.profile_picture && (
            <UserAvatar
              user={user}
              userProfile={{ profile_picture: userProfile.profile_picture }}
              isLoading={isLoading}
              onSignOut={signOut}
              size="medium"
              dropdownPosition="right"
              isMobile={false}
            />
          )}
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 pointer-events-auto w-full max-w-full overflow-hidden">
        {/* Mobile Nav Bar */}
        <div
          className="flex items-center justify-between px-4 py-3 transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: isScrolled ? "#282828" : "transparent",
            opacity: isScrolled ? 0.95 : 1,
            backdropFilter: isScrolled ? "blur(10px)" : "none",
          }}
        >
          {/* User Avatar as Logo on Left - Mobile */}
          {user && userProfile?.profile_picture && (
            <UserAvatar
              user={user}
              userProfile={{ profile_picture: userProfile.profile_picture }}
              isLoading={isLoading}
              onSignOut={signOut}
              size="medium"
              dropdownPosition="left"
              isMobile={true}
            />
          )}

          {/* Right side - Hamburger */}
          <div className="flex items-center gap-3">
            {/* Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-white transition-all duration-300 ease-in-out hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: isScrolled
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
              aria-label="Toggle mobile menu"
              type="button"
            >
              <svg
                className="w-6 h-6 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Full Width */}
        {isMobileMenuOpen && (
          <div
            className="w-full shadow-lg transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: isScrolled ? "#282828" : "#B84786",
              opacity: 0.95,
              animation: "slideDown 0.3s ease-out",
              backdropFilter: isScrolled ? "blur(10px)" : "none",
            }}
          >
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => {
                    if (!item.disabled) {
                      handleMenuClick(item.name);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  disabled={isLoading || item.disabled}
                  className={`w-full text-left px-6 py-4 text-white font-bold transition-all border-b last:border-b-0 flex items-center justify-between ${
                    isLoading || item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-black hover:bg-opacity-10"
                  }`}
                  style={{
                    background: item.isActive
                      ? "rgba(0, 0, 0, 0.15)"
                      : "transparent",
                    borderBottomColor: "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <span>{item.name}</span>
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ml-2"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#1F1F1F",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      <ResponsiveSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={() => {
          setIsSignupModalOpen(false);
          // User state will be updated automatically through auth state listener
        }}
      />

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
