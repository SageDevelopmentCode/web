"use client";

import Navigation from "./components/Navigation";
import Characters from "./components/home/Characters";

export default function Home() {
  return (
    <>
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
        className="overflow-hidden"
        style={{
          width: "100%",
          height: "100vh",
          backgroundImage: "url(/assets/ZoneOneBattle.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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

        <div
          className="flex flex-col items-center justify-center h-full px-4 sm:px-6 md:px-8"
          style={{ zIndex: 10, position: "relative", pointerEvents: "auto" }}
        >
          <div
            className="mb-3 px-3 py-1.5 rounded-full text-white font-bold text-xs sm:text-sm fade-in-up delay-1"
            style={{ backgroundColor: "#BF8EFF" }}
          >
            Out December 30, 2025
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white fade-in-up delay-2 text-center">
            Sage
          </h1>
          <p className="text-white text-sm sm:text-base mt-4 text-center font-bold max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg fade-in-up delay-3 px-2">
            A{" "}
            <span
              className="px-1 py-0.5 rounded"
              style={{
                background:
                  "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                borderRadius: "10px",
              }}
            >
              Christian Self-Care
            </span>{" "}
            App. Sign up for early access and updates before launch.
          </p>

          <div className="mt-8 sm:mt-12 w-[100%] sm:w-full sm:max-w-md fade-in-up delay-4 px-2 sm:px-4">
            <div
              className="relative flex flex-col sm:flex-row items-center rounded-2xl sm:rounded-full p-2 gap-2 sm:gap-0"
              style={{
                backgroundColor: "#282828",
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 sm:py-2 rounded-xl sm:rounded-full focus:outline-none text-sm sm:text-base"
              />
              <button
                onClick={() => {}}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-white font-semibold rounded-xl sm:rounded-full text-sm sm:text-base cursor-pointer"
                style={{
                  background:
                    "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
                  pointerEvents: "auto",
                }}
                type="button"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <Characters />

        {/* Desktop Bottom Text */}
        <div
          className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center px-4"
          style={{ zIndex: 10, pointerEvents: "none" }}
        >
          <p className="text-white text-sm opacity-80 text-center font-bold">
            Have an idea you want us to implement?
          </p>
        </div>
      </section>
    </>
  );
}
