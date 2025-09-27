"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SignupModal from "./navigation/SignupModal";
import { useAuth } from "../../contexts/auth-context";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Get auth state from context
  const { user, isLoading, signOut } = useAuth();

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
    { name: "Home", isActive: true },
    { name: "About", isActive: false },
    { name: "CharacterDex", isActive: false },
    // { name: "Features", isActive: false },
    {
      name: user ? "Sign Out" : "Sign In / Sign Up",
      isActive: false,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMenuClick = (itemName: string) => {
    if (itemName === "Sign In / Sign Up") {
      setIsSignupModalOpen(true);
    } else if (itemName === "Sign Out") {
      handleSignOut();
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block absolute top-4 sm:top-6 right-4 sm:right-6 z-50 pointer-events-auto">
        <div className="flex gap-4 lg:gap-7">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              disabled={isLoading}
              className={`px-3 lg:px-5 py-2 rounded-xl text-white font-bold transition-all hover:opacity-80 cursor-pointer text-sm lg:text-base ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
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
          ))}
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
          {/* Logo */}
          <Image
            src="/assets/LogoWBG.png"
            alt="Sage Logo"
            width={32}
            height={32}
            quality={95}
            className="h-8 w-8 rounded-full object-cover"
            priority
          />

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
                    handleMenuClick(item.name);
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLoading}
                  className={`w-full text-left px-6 py-4 text-white font-bold transition-all hover:bg-black hover:bg-opacity-10 border-b last:border-b-0 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{
                    background: item.isActive
                      ? "rgba(0, 0, 0, 0.15)"
                      : "transparent",
                    borderBottomColor: "rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      <SignupModal
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
