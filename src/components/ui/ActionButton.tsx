"use client";

import { type ButtonHTMLAttributes, type ReactNode, useState } from "react";

type Variant = "confirm" | "dismiss" | "critical" | "ghost";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  loading?: boolean;
  onAction?: () => void | Promise<void>;
  fullWidth?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  confirm: "bg-[var(--color-safe)] text-[#04221a] border border-[var(--color-safe)] hover:brightness-110",
  dismiss:
    "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-bright)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)]",
  critical: "bg-[var(--color-critical)] text-white border border-[var(--color-critical)] hover:brightness-110",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-bright)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
};

export default function ActionButton({
  variant = "confirm",
  icon,
  loading: loadingProp,
  onAction,
  onClick,
  children,
  fullWidth,
  className = "",
  disabled,
  type = "button",
  ...rest
}: ActionButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = loadingProp ?? internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (onAction) {
      setInternalLoading(true);
      try {
        await onAction();
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-wider text-[13px] h-[44px] px-5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${VARIANT_CLASS[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      style={{ borderRadius: 0 }}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden
          />
          <span>Working…</span>
        </span>
      ) : (
        <>
          {icon ? <span className="inline-flex">{icon}</span> : null}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
