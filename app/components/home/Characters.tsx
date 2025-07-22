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
        className="absolute bottom-0 -right-20 flex items-end gap-2 pr-8 pb-4"
        style={{ zIndex: 2 }}
      >
        <img
          src="/assets/Noah.png"
          alt="Noah"
          className="h-72 object-contain scale-x-[-1] character-fade-in character-delay-5"
        />
        <img
          src="/assets/Gabriel.png"
          alt="Gabriel"
          className="h-70 object-contain mb-30 character-fade-in character-delay-6"
        />
        <img
          src="/assets/David.png"
          alt="David"
          className="h-72 object-contain -mb-5 character-fade-in character-delay-7"
        />
      </div>

      {/* Characters - Left Side */}
      <div
        className="absolute bottom-0 -left-20 flex items-end gap-0 pl-0 pb-4"
        style={{ zIndex: 2 }}
      >
        <img
          src="/assets/Samson.png"
          alt="Samson"
          className="h-72 object-contain character-fade-in character-delay-1"
        />
        <img
          src="/assets/Ruth.png"
          alt="Ruth"
          className="h-70 object-contain mb-20 character-fade-in character-delay-2"
        />
        <img
          src="/assets/Deborah.png"
          alt="Deborah"
          className="h-70 object-contain -mb-4 character-fade-in character-delay-3"
        />
        <img
          src="/assets/Elijah.png"
          alt="Elijah"
          className="h-70 object-contain mb-10 character-fade-in character-delay-4"
        />
      </div>
    </>
  );
}
