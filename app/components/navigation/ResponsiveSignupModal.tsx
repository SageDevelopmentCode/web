"use client";

import { useState, useEffect } from "react";
import SignupModal from "./SignupModal";
import MobileSignupModal from "./MobileSignupModal";

interface ResponsiveSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess?: () => void;
}

export default function ResponsiveSignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
}: ResponsiveSignupModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for mobile screen size and touch capability
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileScreen || isTouchDevice);
    };

    // Check on mount
    checkIsMobile();

    // Check on resize
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Render mobile version for mobile devices, desktop version for desktop
  if (isMobile) {
    return (
      <MobileSignupModal
        isOpen={isOpen}
        onClose={onClose}
        onSignupSuccess={onSignupSuccess}
      />
    );
  }

  return (
    <SignupModal
      isOpen={isOpen}
      onClose={onClose}
      onSignupSuccess={onSignupSuccess}
    />
  );
}
