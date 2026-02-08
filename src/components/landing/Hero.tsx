"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Aurora from "@/components/reactbits/Aurora";
import TrueFocus from "@/components/reactbits/TrueFocus";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Aurora
        colorStops={["#001a33", "#0066cc", "#00e5ff"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.8}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <TrueFocus
          sentence="S A L V O"
          blurAmount={6}
          borderColor="#00e5ff"
          animationDuration={0.6}
          pauseBetweenAnimations={1.5}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 text-xl md:text-2xl text-ocean-cyan font-light tracking-wide"
        >
          AI-Powered Autonomous Water Rescue
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Spots a person in distress. Tracks them. Deploys a flotation device.
          Pings the nearest lifeguard. All in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#how-it-works"
            className="px-8 py-3 rounded-lg bg-ocean-cyan/10 border border-ocean-cyan/40
                       text-ocean-cyan font-medium hover:bg-ocean-cyan/20
                       transition-all glow-cyan-sm"
          >
            See How It Works
          </a>
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-lg bg-ocean-cyan text-ocean-dark font-semibold
                       hover:bg-ocean-cyan/90 transition-all glow-cyan"
          >
            View Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ocean-dark to-transparent" />
    </section>
  );
}
