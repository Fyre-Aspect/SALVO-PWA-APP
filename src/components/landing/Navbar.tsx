"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, hasHydrated } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ocean-dark/80 backdrop-blur-lg border-b border-ocean-surface/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-wider text-white">
          SALVO
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-gray-400 hover:text-ocean-cyan transition-colors"
          >
            How It Works
          </a>
          <a
            href="#tech"
            className="text-sm text-gray-400 hover:text-ocean-cyan transition-colors"
          >
            Tech Specs
          </a>
          
          {hasHydrated && user?.isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-ocean-cyan/10
                           border border-ocean-cyan/30 text-ocean-cyan
                           hover:bg-ocean-cyan/20 hover:border-ocean-cyan/50
                           transition-all glow-cyan-sm"
              >
                View Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/auth?mode=signin"
                className="text-sm text-gray-400 hover:text-ocean-cyan transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=register"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-ocean-cyan/10
                           border border-ocean-cyan/30 text-ocean-cyan
                           hover:bg-ocean-cyan/20 hover:border-ocean-cyan/50
                           transition-all glow-cyan-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
