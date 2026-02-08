"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

export default function TrueFocus({
  sentence = "True Focus",
  manualMode = false,
  blurAmount = 5,
  borderColor = "#00e5ff",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
}: TrueFocusProps) {
  const words = sentence.split(" ");
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (manualMode) return;

    const interval = setInterval(() => {
      setFocusIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [words.length, animationDuration, pauseBetweenAnimations, manualMode]);

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
      {words.map((word, index) => {
        const isFocused = index === focusIndex;
        return (
          <motion.span
            key={index}
            animate={{
              filter: isFocused ? "blur(0px)" : `blur(${blurAmount}px)`,
              opacity: isFocused ? 1 : 0.5,
            }}
            transition={{ duration: animationDuration, ease: "easeInOut" }}
            className="relative inline-block text-6xl md:text-8xl font-bold tracking-tight"
          >
            {isFocused && (
              <motion.span
                layoutId="focus-border"
                className="absolute -inset-2 rounded-lg border-2"
                style={{ borderColor }}
                transition={{ duration: animationDuration }}
              />
            )}
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
