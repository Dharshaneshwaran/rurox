import Link from "next/link";
import { cn } from "@/components/ui/styles";

type AppMarkProps = {
  href?: string;
  className?: string;
  inverse?: boolean;
};

export default function AppMark({
  href = "/",
  className,
  inverse = false,
}: AppMarkProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-black",
          inverse
            ? "border-white/20 bg-white/10 text-white"
            : "border-accent/15 bg-accent text-white"
        )}
      >
        ST
      </span>
      <span>
        <span
          className={cn(
            "block font-display text-sm font-extrabold uppercase tracking-[0.28em]",
            inverse ? "text-orange-200" : "text-accent"
          )}
        >
          Smart Teacher
        </span>
        <span
          className={cn(
            "block text-sm font-medium",
            inverse ? "text-white/70" : "text-muted-foreground"
          )}
        >
          Assignment System
        </span>
      </span>
    </Link>
  );
}
