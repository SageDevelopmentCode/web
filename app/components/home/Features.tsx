"use client";

export default function Features() {
  return (
    <section
      className="pt-30 pb-16 px-4 sm:px-6 md:px-0 w-full max-w-full overflow-x-hidden"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-8">
          Features
        </h2>

        {/* Rectangle Container */}
        <div className="flex justify-center">
          <div
            className="w-96 h-64 rounded-lg"
            style={{ backgroundColor: "#323817" }}
          ></div>
        </div>
      </div>
    </section>
  );
}
