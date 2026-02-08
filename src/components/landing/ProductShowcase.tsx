"use client";

import { motion } from "motion/react";
import FluidGlass from "@/components/reactbits/FluidGlass";

export default function ProductShowcase() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          The Rescue Arm
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-center mb-12 max-w-xl mx-auto"
        >
          A servo-driven catapult with a winch spool and tethered float.
          Universal mount fits any drone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <FluidGlass mode="lens" scale={0.25} ior={1.15} thickness={5}>
            <div className="text-center space-y-6">
              {/* Drone icon illustration */}
              <div className="flex justify-center">
                <svg
                  className="w-32 h-32 text-ocean-cyan opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 100 100"
                  strokeWidth={1}
                >
                  {/* Drone body */}
                  <rect
                    x="35"
                    y="40"
                    width="30"
                    height="20"
                    rx="4"
                    className="fill-ocean-deep stroke-ocean-cyan"
                  />
                  {/* Arms */}
                  <line x1="35" y1="45" x2="15" y2="35" />
                  <line x1="65" y1="45" x2="85" y2="35" />
                  <line x1="35" y1="55" x2="15" y2="65" />
                  <line x1="65" y1="55" x2="85" y2="65" />
                  {/* Rotors */}
                  <circle cx="15" cy="35" r="8" className="stroke-ocean-cyan" />
                  <circle cx="85" cy="35" r="8" className="stroke-ocean-cyan" />
                  <circle cx="15" cy="65" r="8" className="stroke-ocean-cyan" />
                  <circle cx="85" cy="65" r="8" className="stroke-ocean-cyan" />
                  {/* Payload line */}
                  <line
                    x1="50"
                    y1="60"
                    x2="50"
                    y2="85"
                    strokeDasharray="3 3"
                    className="stroke-ocean-cyan"
                  />
                  <circle
                    cx="50"
                    cy="88"
                    r="4"
                    className="fill-ocean-cyan/20 stroke-ocean-cyan"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="glass-card p-3 rounded-lg">
                  <div className="text-ocean-cyan font-mono text-lg">250-500g</div>
                  <div className="text-gray-500 text-xs mt-1">Payload Mass</div>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <div className="text-ocean-cyan font-mono text-lg">5-10m</div>
                  <div className="text-gray-500 text-xs mt-1">Throw Range</div>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <div className="text-ocean-cyan font-mono text-lg">15-30m</div>
                  <div className="text-gray-500 text-xs mt-1">Tether Length</div>
                </div>
              </div>
            </div>
          </FluidGlass>
        </motion.div>
      </div>
    </section>
  );
}
