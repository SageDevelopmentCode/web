"use client";

export default function Characters() {
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .character-fade-in {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .character-delay-1 {
          animation-delay: 0.2s;
        }
        .character-delay-2 {
          animation-delay: 0.4s;
        }
        .character-delay-3 {
          animation-delay: 0.6s;
        }
        .character-delay-4 {
          animation-delay: 0.8s;
        }
        .character-delay-5 {
          animation-delay: 1s;
        }
        .character-delay-6 {
          animation-delay: 1.2s;
        }
        .character-delay-7 {
          animation-delay: 1.4s;
        }
      `}</style>

      {/* Characters - Right Side */}
      <div
        className="absolute bottom-0 right-0 sm:-right-2 md:-right-4 lg:-right-6 xl:-right-10 2xl:-right-20 flex items-end gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 pr-0 sm:pr-1 md:pr-2 lg:pr-3 xl:pr-4 2xl:pr-8 pb-1 sm:pb-2 md:pb-3 lg:pb-4"
        style={{ zIndex: 2, pointerEvents: "none" }}
      >
        <img
          src="/assets/Noah.png"
          alt="Noah"
          className="h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-72 object-contain scale-x-[-1] character-fade-in character-delay-5"
        />
        <img
          src="/assets/Gabriel.png"
          alt="Gabriel"
          className="hidden sm:block h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-70 object-contain mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-30 character-fade-in character-delay-6"
        />
        <img
          src="/assets/David.png"
          alt="David"
          className="h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-72 object-contain -mb-1 sm:-mb-2 md:-mb-3 lg:-mb-4 xl:-mb-5 character-fade-in character-delay-7"
        />
      </div>

      {/* Characters - Left Side */}
      <div
        className="absolute bottom-0 left-0 sm:-left-2 md:-left-4 lg:-left-6 xl:-left-10 2xl:-left-20 flex items-end gap-0 pl-0 pb-1 sm:pb-2 md:pb-3 lg:pb-4"
        style={{ zIndex: 2, pointerEvents: "none" }}
      >
        <img
          src="/assets/Samson.png"
          alt="Samson"
          className="h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-72 object-contain character-fade-in character-delay-1"
        />
        <img
          src="/assets/Ruth.png"
          alt="Ruth"
          className="hidden sm:block h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-70 object-contain mb-4 sm:mb-6 md:mb-8 lg:mb-12 xl:mb-16 2xl:mb-20 character-fade-in character-delay-2"
        />
        <img
          src="/assets/Deborah.png"
          alt="Deborah"
          className="h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-70 object-contain -mb-1 sm:-mb-1 md:-mb-2 lg:-mb-3 xl:-mb-4 character-fade-in character-delay-3"
        />
        <img
          src="/assets/Elijah.png"
          alt="Elijah"
          className="hidden md:block h-40 lg:h-48 xl:h-56 2xl:h-70 object-contain mb-4 lg:mb-6 xl:mb-8 2xl:mb-10 character-fade-in character-delay-4"
        />
      </div>
    </>
  );
}
