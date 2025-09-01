"use client";

export default function BottomText() {
  return (
    <div
      className="hidden md:flex absolute bottom-4 left-0 right-0 justify-center px-4"
      style={{ zIndex: 10, pointerEvents: "none" }}
    >
      <p className="text-white text-sm opacity-80 text-center font-bold">
        Have an idea you want us to implement?
      </p>
    </div>
  );
}
