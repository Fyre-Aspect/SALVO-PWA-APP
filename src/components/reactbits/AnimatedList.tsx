"use client";

import { motion } from "motion/react";

interface AnimatedListProps {
  items: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
}

export default function AnimatedList({
  items,
  onItemSelect,
  showGradients = true,
  displayScrollbar = true,
}: AnimatedListProps) {
  return (
    <div className="relative">
      {showGradients && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-ocean-dark to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ocean-dark to-transparent z-10" />
        </>
      )}
      <div
        className={`space-y-2 max-h-[400px] overflow-y-auto py-2 ${
          !displayScrollbar ? "scrollbar-hide" : ""
        }`}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
              duration: 0.4,
              ease: "easeOut",
            }}
            onClick={() => onItemSelect?.(item, index)}
            className="px-4 py-3 rounded-lg border border-ocean-surface/30 bg-ocean-deep/40
                       hover:border-ocean-cyan/40 hover:bg-ocean-deep/60 transition-all
                       cursor-pointer font-mono text-sm text-gray-300"
          >
            <span className="text-ocean-cyan mr-3 opacity-50">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
