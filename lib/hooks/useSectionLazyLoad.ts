import { useEffect, useRef, useState } from "react";

interface UseSectionLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useSectionLazyLoad(options: UseSectionLazyLoadOptions = {}) {
  const { threshold = 0.2, rootMargin = "100px", triggerOnce = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasBeenInvisible, setHasBeenInvisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const previousVisibilityRef = useRef<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementVisible = entry.isIntersecting;

        // Track visibility changes
        if (previousVisibilityRef.current && !isElementVisible) {
          // Element just became invisible
          setHasBeenInvisible(true);
        }

        setIsVisible(isElementVisible);
        previousVisibilityRef.current = isElementVisible;

        if (isElementVisible && !hasLoaded) {
          setHasLoaded(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, hasLoaded]);

  return { ref, isVisible, hasLoaded, hasBeenInvisible };
}

export default useSectionLazyLoad;
