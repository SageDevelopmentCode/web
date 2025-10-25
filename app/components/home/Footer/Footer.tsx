"use client";

import { Twemoji, EmojiMap } from "../../Twemoji";
import { Instagram, Linkedin } from "lucide-react";
import RedditIcon from "@mui/icons-material/Reddit";
import XIcon from "@mui/icons-material/X";

// Custom Discord Icon Component
const DiscordIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function Footer() {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/sagechristianapp",
      isLucide: true,
    },
    {
      name: "Discord",
      icon: DiscordIcon,
      url: "https://discord.gg/kMUdJkWS",
      isCustom: true,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/company/sagefied",
      isLucide: true,
    },
    {
      name: "Reddit",
      icon: RedditIcon,
      url: "https://www.reddit.com/r/SageChristianApp/?type=TEXT",
      isMui: true,
    },
    {
      name: "X",
      icon: XIcon,
      url: "https://x.com/sagefieldapp",
      isMui: true,
    },
  ];

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Navigation links data
  const navigationLinks = {
    column1: [
      {
        label: "Features",
        emoji: EmojiMap.PALETTE,
        onClick: () => handleScrollToSection("features-section"),
      },
      {
        label: "Feedback",
        emoji: EmojiMap.SPEECH_BUBBLE,
        onClick: () => handleScrollToSection("feedback-section"),
      },
    ],
    column2: [
      {
        label: "SageDex (Soon)",
        emoji: EmojiMap.BOOKS,
        disabled: true,
      },
    ],
    column3: [
      {
        label: "About (Coming soon)",
        emoji: EmojiMap.GLOBE,
        disabled: true,
      },
      {
        label: "Team (Coming soon)",
        emoji: EmojiMap.PRAISE,
        disabled: true,
      },
      {
        label: "hi@sagefield.co",
        emoji: EmojiMap.HEART,
        href: "mailto:hi@sagefield.co",
      },
    ],
  };

  return (
    <footer
      className="py-12 px-6 sm:px-8 w-full"
      style={{ backgroundColor: "#323817" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main grid layout: left content, right navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side: Description, Copyright, Social Icons */}
          <div className="flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
            {/* Description */}
            <p className="text-white text-sm sm:text-base leading-relaxed max-w-xl">
              Sage is the modern Christian self-care app that helps believers
              integrate their faith into everyday life, whether at school, at
              work, or at home, not just in church.
            </p>

            {/* Copyright */}
            <p className="text-white text-xs sm:text-sm">
              ©2025 SageField Inc. All Rights Reserved
            </p>

            {/* Social media links */}
            <div className="flex gap-3 justify-center lg:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#3C4806",
                    border: "2px solid #7A873D",
                  }}
                  aria-label={social.name}
                >
                  {social.isMui ? (
                    <social.icon
                      sx={{
                        fontSize: 24,
                        color: "white",
                      }}
                    />
                  ) : social.isLucide ? (
                    <social.icon size={24} className="text-white" />
                  ) : social.isCustom ? (
                    <social.icon size={24} />
                  ) : null}
                </a>
              ))}
            </div>
          </div>

          {/* Right side: Navigation Links */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 items-center lg:items-start">
              <div
                className="hidden lg:block h-px w-full mb-2"
                style={{ backgroundColor: "#7A873D" }}
              />
              {navigationLinks.column1.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="flex items-center gap-2 text-white text-sm hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Twemoji hex={link.emoji} size={20} />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4 items-center lg:items-start">
              <div
                className="hidden lg:block h-px w-full mb-2"
                style={{ backgroundColor: "#7A873D" }}
              />
              {navigationLinks.column2.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white text-sm opacity-60"
                >
                  <Twemoji hex={link.emoji} size={20} />
                  <span>{link.label}</span>
                </div>
              ))}
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 items-center lg:items-start">
              <div
                className="hidden lg:block h-px w-full mb-2"
                style={{ backgroundColor: "#7A873D" }}
              />
              {navigationLinks.column3.map((link, index) =>
                link.href ? (
                  <a
                    key={index}
                    href={link.href}
                    className="flex items-center gap-2 text-white text-sm hover:opacity-80 transition-opacity"
                  >
                    <Twemoji hex={link.emoji} size={20} />
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-white text-sm opacity-60"
                  >
                    <Twemoji hex={link.emoji} size={20} />
                    <span>{link.label}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
