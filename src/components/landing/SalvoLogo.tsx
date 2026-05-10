interface SalvoLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE: Record<NonNullable<SalvoLogoProps["size"]>, { font: string; bar: string }> = {
  sm: { font: "text-[18px]", bar: "w-[3px] h-5" },
  md: { font: "text-[28px]", bar: "w-[4px] h-7" },
  lg: { font: "text-[40px] md:text-[48px]", bar: "w-[6px] h-12 md:h-14" },
  xl: { font: "text-[64px]", bar: "w-[8px] h-16" },
};

export default function SalvoLogo({ size = "md", className = "" }: SalvoLogoProps) {
  const s = SIZE[size];
  return (
    <span
      className={`inline-flex items-center gap-2 font-display font-extrabold tracking-tight ${s.font} ${className}`}
      aria-label="SALVO"
    >
      <span className={s.bar} style={{ backgroundColor: "var(--color-critical)" }} aria-hidden />
      <span style={{ color: "var(--color-text-primary)" }}>SALVO</span>
    </span>
  );
}
