import { createContext, useContext, type ReactNode } from 'react';
import { useScroll, useTransform, type MotionValue } from 'framer-motion';

interface ScrollContextValue {
  scrollYProgress: MotionValue<number>;
  scrollIndicatorOpacity: MotionValue<number>;
  scrollIndicatorY: MotionValue<number>;
  backgroundY: MotionValue<number>;
  contentY: MotionValue<number>;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll();

  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const scrollIndicatorY = useTransform(scrollYProgress, [0, 0.12], [0, -20]);
  const backgroundY = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [0, 50, 25, 12, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.25, 0.5, 1], [0, 20, 10, 0]);

  return (
    <ScrollContext.Provider
      value={{
        scrollYProgress,
        scrollIndicatorOpacity,
        scrollIndicatorY,
        backgroundY,
        contentY,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) return null;
  return ctx;
}
