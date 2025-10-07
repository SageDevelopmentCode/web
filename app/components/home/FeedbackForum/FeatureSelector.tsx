"use client";

import LazyImage from "../../LazyImage";

interface Feature {
  id: string;
  title: string;
  description: string;
  images: {
    src: string;
    alt: string;
  }[];
  gradient: string;
}

interface FeatureSelectorProps {
  features: Feature[];
  selectedFeatureId: string | null;
  onSelectFeature: (featureId: string) => void;
}

export default function FeatureSelector({
  features,
  selectedFeatureId,
  onSelectFeature,
}: FeatureSelectorProps) {
  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="space-y-4 p-1 pb-8">
        {features.map((feature) => {
          const isSelected = selectedFeatureId === feature.id;

          return (
            <button
              key={feature.id}
              onClick={() => onSelectFeature(feature.id)}
              className={`w-full rounded-2xl transition-all duration-200 cursor-pointer ${
                isSelected ? "ring-4 ring-white" : ""
              }`}
            >
              <div className="p-4 flex flex-col gap-3">
                {/* Gradient Header */}
                <div
                  className="w-full px-6 py-4 rounded-xl"
                  style={{
                    background: feature.gradient,
                  }}
                >
                  <h3 className="font-bold text-white text-base text-left">
                    {feature.title}
                  </h3>
                </div>

                {/* Phone Mockups */}
                <div className="flex gap-3 justify-center">
                  {feature.images.map((image, index) => (
                    <LazyImage
                      key={index}
                      src={image.src}
                      alt={image.alt}
                      className="h-auto object-contain w-[120px]"
                      width="120px"
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
