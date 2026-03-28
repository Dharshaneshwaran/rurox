import Link from "next/link";
import BrandMark from "@/components/ui/BrandMark";

type AppBrandProps = {
  className?: string;
};

export default function AppBrand({ className = "" }: AppBrandProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 text-left ${className}`}
    >
      <BrandMark />
      <span className="flex flex-col">
        <span className="font-mono-display text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
          Smart Teacher
        </span>
        <span className="font-display text-lg font-semibold text-[var(--color-text)]">
          Assignment System
        </span>
      </span>
    </Link>
  );
}
