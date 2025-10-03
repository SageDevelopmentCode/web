// Character file extension mapping
export const characterExtensions: Record<string, string> = {
  Daniel: ".PNG",
  David: ".png",
  Deborah: ".png",
  Elijah: ".png",
  Esther: ".PNG",
  Gabriel: ".png",
  Job: ".PNG",
  JohnTheBaptist: ".PNG",
  Moses: ".PNG",
  Noah: ".png",
  Paul: ".png",
  Ruth: ".png",
  Samson: ".png",
  Solomon: ".PNG",
};

// Character image styling configurations
export const characterImageStyles = {
  Ruth: {
    transform: "scale(3.5) translateY(30%) translateX(10%)",
    objectPosition: "center 30%",
  },
  Samson: {
    transform: "scale(3.5) translateY(28%) translateX(4%)",
    objectPosition: "center 30%",
  },
  Deborah: {
    transform: "scale(3.5) translateY(30%) translateX(4%)",
    objectPosition: "center 30%",
  },
  Noah: {
    transform: "scale(3.5) translateY(26%) translateX(4%)",
    objectPosition: "center 30%",
  },
  default: {
    transform: "scale(3.5) translateY(33%) translateX(4%)",
    objectPosition: "center 30%",
  },
};

// Helper function to get character image source
export const getCharacterImageSrc = (profilePicture: string): string => {
  return `/assets/Characters/${profilePicture}${
    characterExtensions[profilePicture] || ".png"
  }`;
};

// Helper function to get character image styles
export const getCharacterImageStyles = (profilePicture: string) => {
  return (
    characterImageStyles[profilePicture as keyof typeof characterImageStyles] ||
    characterImageStyles.default
  );
};
