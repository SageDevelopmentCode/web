"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const characters = [
    "Daniel.PNG",
    "David.png",
    "Deborah.png",
    "Elijah.png",
    "Esther.PNG",
    "Gabriel.png",
    "Job.PNG",
    "JohnTheBaptist.PNG",
    "Moses.PNG",
    "Noah.png",
    "Paul.png",
    "Ruth.png",
    "Samson.png",
    "Solomon.PNG",
  ];

  const menuItems = [
    { name: "Home", isActive: true },
    { name: "About", isActive: false },
    { name: "CharacterDex", isActive: false },
    // { name: "Features", isActive: false },
    { name: "Sign In / Sign Up", isActive: false },
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
        <div className="flex gap-4 lg:gap-7">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              className="px-3 lg:px-5 py-2 rounded-xl text-white font-bold transition-all hover:opacity-80 cursor-pointer text-sm lg:text-base"
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
                  className="w-full text-left px-6 py-4 text-white font-bold transition-all hover:bg-black hover:bg-opacity-10 border-b last:border-b-0"
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
      {isSignupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Black overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setIsSignupModalOpen(false)}
          />

          {/* Modal content */}
          <div
            className="relative w-[90vw] max-w-lg mx-4 rounded-3xl overflow-hidden"
            style={{ backgroundColor: "#CBE2D8" }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsSignupModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
            >
              <svg
                className="w-5 h-5 text-gray-600"
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

            <div className="p-10 pb-0">
              {/* Title */}
              <h2
                className="text-xl font-bold text-center mb-8"
                style={{ color: "#2F4A5D" }}
              >
                Sign Up to Provide Feedback or Comment
              </h2>

              {/* Email Input */}
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-3 rounded-full border-none outline-none placeholder-gray-500"
                  style={{
                    backgroundColor: "#D6E5E2",
                    color: "#2F4A5D",
                  }}
                />
              </div>

              {/* Password Input */}
              <div className="mb-8">
                <input
                  type="password"
                  placeholder="Create a Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-3 rounded-full border-none outline-none placeholder-gray-500"
                  style={{
                    backgroundColor: "#D6E5E2",
                    color: "#2F4A5D",
                  }}
                />
              </div>

              {/* Avatar Selection */}
              <div className="mb-8">
                <p
                  className="text-sm font-bold mb-4"
                  style={{ color: "#2F4A5D" }}
                >
                  Select an Avatar
                </p>
                <div className="grid grid-cols-7 gap-3">
                  {characters.map((character, index) => (
                    <button
                      key={character}
                      onClick={() => setSelectedAvatar(character)}
                      className={`w-12 h-12 cursor-pointer rounded-full overflow-hidden border-2 transition-all ${
                        selectedAvatar === character
                          ? "border-gray-600 scale-110"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: "#D6E5E2" }}
                    >
                      <Image
                        src={`/assets/Characters/${character}`}
                        alt={character.split(".")[0]}
                        width={200}
                        height={200}
                        className="w-auto h-full object-cover"
                        style={{
                          transform:
                            character === "Ruth.png"
                              ? "scale(3.5) translateY(30%) translateX(10%)"
                              : character === "Samson.png"
                              ? "scale(3.5) translateY(28%) translateX(4%)"
                              : character === "Deborah.png"
                              ? "scale(3.5) translateY(30%) translateX(4%)"
                              : character === "Noah.png"
                              ? "scale(3.5) translateY(26%) translateX(4%)"
                              : "scale(3.5) translateY(33%) translateX(4%)",
                          objectPosition: "center 30%",
                        }}
                        quality={100}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                className="w-full py-3 text-white font-bold transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: "#778554",
                  boxShadow: "0px 4px 0px 1px #57613B",
                  borderRadius: "15px",
                }}
              >
                Sign Up
              </button>

              {/* Login Link */}
              <button
                onClick={() => setIsSignupModalOpen(false)}
                className="w-full items-center justify-center cursor-pointer"
              >
                <p
                  className="text-center text-sm mt-6 mb-6"
                  style={{ color: "#6B764C" }}
                >
                  Login with existing account
                </p>
              </button>
            </div>

            {/* Background Image */}
            <div className="relative h-32 overflow-hidden">
              <Image
                src="/assets/AuthBackground.jpg"
                alt="Background"
                width={1200}
                height={400}
                className="w-full h-auto object-cover object-top"
                quality={100}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

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
