"use client";

import { Bell, FileText, Map, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  notification?: boolean;
  enabled?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Shield, enabled: true },
  { href: "/dashboard?view=map", label: "Map", icon: Map, enabled: false },
  { href: "/dashboard?view=history", label: "History", icon: FileText, enabled: false },
  { href: "/dashboard?view=alerts", label: "Alerts", icon: Bell, enabled: false, notification: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, activeIncident } = useApp();
  const initials = (user?.name || "??")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      aria-label="Primary navigation"
      className="hidden md:flex flex-col items-center justify-between w-16 shrink-0 h-screen sticky top-0 z-40 border-r"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Top — logo */}
      <div className="pt-5 pb-3 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <span
            className="block w-1 h-7"
            style={{ backgroundColor: "var(--color-critical)" }}
            aria-hidden
          />
          <span className="font-display font-extrabold text-[14px] tracking-widest">S</span>
        </div>
      </div>

      {/* Middle — nav */}
      <nav className="flex flex-col items-center gap-1 flex-1 justify-center" aria-label="Sections">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === "/dashboard" && item.href === "/dashboard";
          return (
            <Link
              key={item.href}
              href={item.enabled ? item.href : "#"}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={!item.enabled}
              tabIndex={item.enabled ? 0 : -1}
              onClick={(e) => {
                if (!item.enabled) e.preventDefault();
              }}
              className={`relative w-12 h-12 flex items-center justify-center transition-colors ${
                item.enabled ? "" : "opacity-30 cursor-not-allowed"
              }`}
              style={{
                color: isActive ? "var(--color-critical)" : "var(--color-text-secondary)",
              }}
            >
              {isActive ? (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-7"
                  style={{ backgroundColor: "var(--color-critical)" }}
                  aria-hidden
                />
              ) : null}
              <Icon size={20} strokeWidth={1.5} />
              {item.notification && activeIncident ? (
                <span
                  className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-blink"
                  style={{ backgroundColor: "var(--color-critical)" }}
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — avatar + settings */}
      <div className="pb-5 flex flex-col items-center gap-3">
        <button
          aria-label="Settings"
          className="w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <Settings size={18} strokeWidth={1.5} />
        </button>
        <div
          aria-label={`Signed in as ${user?.name ?? "responder"}`}
          className="w-9 h-9 flex items-center justify-center font-mono text-[11px] tracking-wider"
          style={{
            color: "var(--color-text-primary)",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border-bright)",
          }}
        >
          {initials}
        </div>
      </div>
    </aside>
  );
}

/** Mobile bottom nav — visible below md breakpoint */
export function BottomNav() {
  const pathname = usePathname();
  const { activeIncident } = useApp();
  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-4 border-t"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {NAV.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === "/dashboard" && item.href === "/dashboard";
        return (
          <button
            key={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            disabled={!item.enabled}
            className="relative flex flex-col items-center justify-center py-3 gap-1 disabled:opacity-30"
            style={{ color: isActive ? "var(--color-critical)" : "var(--color-text-secondary)" }}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[9px] font-mono uppercase tracking-wider">{item.label}</span>
            {item.notification && activeIncident ? (
              <span
                className="absolute top-2 right-1/3 w-1.5 h-1.5 rounded-full animate-blink"
                style={{ backgroundColor: "var(--color-critical)" }}
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
