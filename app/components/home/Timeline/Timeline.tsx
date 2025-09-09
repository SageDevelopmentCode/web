"use client";

import { useState, useEffect } from "react";
import { Twemoji, EmojiMap } from "../../Twemoji";

interface TimelineEntry {
  id: string;
  year: string;
  month: string;
  title: string;
  description: string;
  emoji?: string; // Optional emoji hex code for Twemoji
  links?: { [name: string]: string }; // Optional links for names in description
}

const timelineData: TimelineEntry[] = [
  {
    id: "1",
    year: "2024",
    month: "October 2024",
    title: "The idea was born.",
    description:
      "I teamed up with my co-founder, Sabrina Grace Obnamia, to create a Christian educational app/game designed for classrooms—something that could integrate faith-based learning into the daily lives of young students.",
    emoji: EmojiMap.NEW, // 🌱 seedling
    links: {
      "Sabrina Grace Obnamia": "https://www.linkedin.com/in/sabrinaobnamia/",
    },
  },
  {
    id: "2",
    year: "2024",
    month: "December 2024",
    title: "Our first teammate joined",
    description:
      "We welcomed Lydia Cha, our illustrator and designer, who brought our vision to life by drawing all the biblical characters featured in the game.",
    emoji: "1f3a8", // 🎨 artist palette
    links: {
      "Lydia Cha": "https://www.linkedin.com/in/lydia-cha/",
    },
  },
  {
    id: "3",
    year: "2025",
    month: "January 2025",
    title: "A pivotal shift",
    description:
      "After facing the challenges of entering the education sector, we decided to pivot. Instead of building strictly for classrooms, we shifted our focus toward teenagers and young adults. That’s when the vision for what we’re building today came to life: a Christian self-care app that helps believers integrate their faith into everyday life—whether at school, at work, or at home—not just in church on Sundays.",
    emoji: "1f504", // � counterclockwise arrows button
  },
  {
    id: "4",
    year: "2025",
    month: "April 2025",
    title: "First Pitch",
    description:
      "After a few months of building, we pitched at Biola University's 2025 Startup Competition. We reached the final round and gained valuable feedback that shaped the next stage of development.",
    emoji: "1f680", // 🚀 rocket
    links: {
      "Biola University":
        "https://www.linkedin.com/pulse/biola-startup-competition-18-teams-building-competing-mah-phd-mba-kg7ic/?trackingId=3lz11kYdSai9o1yKM4mD2Q%3D%3D",
    },
  },
  {
    id: "5",
    year: "2025",
    month: "August 2025",
    title: "Gathering real-world feedback",
    description:
      "To better understand our users, we went beyond surveys and social media (Reddit, Instagram) and built this landing page to both showcase the app and collect feedback from the community.",
    emoji: "1f310", // 🌐 globe with meridians
  },
];

// Helper function to render descriptions with clickable links
const renderDescriptionWithLinks = (
  description: string,
  links?: { [name: string]: string }
) => {
  if (!links || Object.keys(links).length === 0) {
    return description;
  }

  const elements: React.ReactNode[] = [];
  let remainingText = description;
  let keyCounter = 0;

  // Sort names by length (longest first) to avoid partial matches
  const sortedNames = Object.keys(links).sort((a, b) => b.length - a.length);

  for (const name of sortedNames) {
    const nameIndex = remainingText.indexOf(name);
    if (nameIndex !== -1) {
      // Add text before the name
      if (nameIndex > 0) {
        elements.push(remainingText.substring(0, nameIndex));
      }

      // Add the clickable name
      elements.push(
        <a
          key={`link-${keyCounter++}`}
          href={links[name]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FFF1B6] hover:text-white underline underline-offset-2 transition-colors duration-200"
        >
          {name}
        </a>
      );

      // Update remaining text to process
      remainingText = remainingText.substring(nameIndex + name.length);
      break; // Process one name at a time to avoid conflicts
    }
  }

  // Add any remaining text
  if (remainingText) {
    elements.push(remainingText);
  }

  return elements.length > 0 ? elements : description;
};

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
                    <h4 className="text-white text-lg md:text-xl font-bold mb-2 flex items-center gap-2">
                      {entry.title}
                      {entry.emoji && (
                        <Twemoji
                          hex={entry.emoji}
                          size={20}
                          className="inline-block"
                        />
                      )}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {renderDescriptionWithLinks(entry.description, entry.links)}
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
