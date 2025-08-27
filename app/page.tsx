"use client";

import Navigation from "./components/Navigation";
import Characters from "./components/home/Characters";
import Starters from "./components/home/Starters";
import Features from "./components/home/Features";
import HeroSection from "./components/home/HeroSection";
import BottomText from "./components/home/BottomText";

export default function Home() {
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
    </div>
  );
}
