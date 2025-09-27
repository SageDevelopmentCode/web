"use client";

import { useState } from "react";
import Navigation from "./components/Navigation";
import Characters from "./components/home/Hero/Characters";
import Starters from "./components/home/Starters/Starters";
import Features from "./components/home/Features/Features";
import FeedbackForum from "./components/home/FeedbackForum/FeedbackForum";
import Timeline from "./components/home/Timeline/Timeline";
import HeroSection from "./components/home/Hero/HeroSection";
import BottomText from "./components/home/Hero/BottomText";
import SignupModal from "./components/navigation/SignupModal";
import { useAuth } from "../contexts/auth-context";

export default function Home() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="overflow-x-hidden min-h-screen w-full max-w-full">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .delay-1 {
          animation-delay: 0.3s;
        }
        .delay-2 {
          animation-delay: 0.5s;
        }
        .delay-3 {
          animation-delay: 0.7s;
        }
        .delay-4 {
          animation-delay: 0.9s;
        }
      `}</style>

      <section
        className="overflow-hidden relative"
        style={{
          width: "100%",
          height: "100vh",
          backgroundImage: "url(/assets/ZoneOneBattle.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          maxWidth: "100vw",
        }}
      >
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)",
            zIndex: 1,
          }}
        ></div>

        <div
          style={{ zIndex: 50, position: "relative", pointerEvents: "auto" }}
        >
          <Navigation />
        </div>

        <HeroSection />

        <Characters />

        <BottomText />
      </section>

      {/* Meet the Starters Section */}
      <Starters />

      {/* Features Section */}
      <Features />

      {/* Feedback Forum Section */}
      <FeedbackForum
        isUserSignedIn={!!user}
        onOpenSignupModal={() => setIsSignupModalOpen(true)}
        onCloseFeedbackForum={() => {}}
      />

      {/* Timeline Section */}
      <Timeline />

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignupSuccess={() => {
          setIsSignupModalOpen(false);
          // User state will be updated automatically through auth state listener
        }}
      />
    </div>
  );
}
