"use client";

export default function Navigation() {
  return (
    <nav className="absolute top-6 right-6 flex gap-4">
      <button
        className="px-6 py-3 rounded-2xl text-white font-bold transition-all cursor-pointer"
        style={{
          background:
            "linear-gradient(90.81deg, #9D638D 0.58%, #BF8EFF 99.31%)",
        }}
      >
        Home
      </button>
      <button
        className="px-6 py-3 rounded-2xl text-white font-bold transition-all hover:opacity-80 cursor-pointer"
        style={{
          backgroundColor: "#B84786",
        }}
      >
        About
      </button>
      <button
        className="px-6 py-3 rounded-2xl text-white font-bold transition-all hover:opacity-80 cursor-pointer"
        style={{
          backgroundColor: "#B84786",
        }}
      >
        Characters
      </button>
      <button
        className="px-6 py-3 rounded-2xl text-white font-bold transition-all hover:opacity-80 cursor-pointer"
        style={{
          backgroundColor: "#B84786",
        }}
      >
        Features
      </button>
    </nav>
  );
}
