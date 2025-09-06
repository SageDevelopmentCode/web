"use client";

import { useState, useEffect } from "react";

interface TimelineEntry {
  id: string;
  year: string;
  month: string;
  title: string;
  description: string;
}

const timelineData: TimelineEntry[] = [
  {
    id: "1",
    year: "2024",
    month: "May 2024",
    title: "Start of Sage 🌱",
    description:
      "We would onboard our first team member of the group, Detergent!",
  },
  {
    id: "2",
    year: "2024",
    month: "May 2024",
    title: "Start of Sage 🌱",
    description:
      "We would onboard our first team member of the group, Detergent!",
  },
  {
    id: "3",
    year: "2025",
    month: "January 2025",
    title: "Start of Sage 🌱",
    description:
      "We would onboard our first team member of the group, Detergent!",
  },
];

export default function Timeline() {
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section
      className="pt-16 pb-16 px-4 sm:px-6 md:px-8 w-full"
      style={{ backgroundColor: "#3C4806" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-12">
          Timeline
        </h2>

        {/* Timeline Container */}
        <div className="relative">
          {/* Timeline Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{
              left: "calc(5rem + 1.5rem - 1px)", // 80px (w-20) + 24px (w-6) - 1px (half of line width)
              zIndex: 1,
            }}
          />

          {/* Timeline Entries */}
          <div className="space-y-16">
            {timelineData.map((entry, index) => (
              <div key={entry.id} className="relative flex items-center">
                {/* Year Label - Left of dot */}
                <div className="text-[#FFF1B6] font-bold text-lg mr-6 w-20 text-right">
                  {(index === 0 ||
                    entry.year !== timelineData[index - 1]?.year) &&
                    entry.year}
                </div>

                {/* Timeline Dot */}
                <div
                  className="w-4 h-4 rounded-full relative z-10 flex-shrink-0"
                  style={{
                    backgroundColor: "#FFF1B6",
                    border: "3px solid #3C4806",
                    marginLeft: "-8px", // Half of dot width to center it on the line
                  }}
                />

                {/* Content */}
                <div className="flex-1 ml-8 pb-4">
                  <div className="mb-3">
                    <h3 className="text-[#FFF1B6] text-xl md:text-3xl font-bold mb-2">
                      {entry.month}
                    </h3>
                    <h4 className="text-white text-lg md:text-xl font-semibold mb-2">
                      {entry.title}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
