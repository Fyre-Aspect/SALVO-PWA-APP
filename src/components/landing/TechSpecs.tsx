"use client";

import { motion } from "motion/react";
import AnimatedList from "@/components/reactbits/AnimatedList";
import { specs } from "@/data/mock";

export default function TechSpecs() {
  return (
    <section id="tech" className="py-24 px-6 bg-ocean-darker/50">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          Built for the Edge
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-center mb-12 max-w-xl mx-auto"
        >
          Real-time AI inference on a portable platform. No cloud dependency.
          No latency. Just action.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedList
            items={specs}
            showGradients
            enableArrowNavigation
            displayScrollbar={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
