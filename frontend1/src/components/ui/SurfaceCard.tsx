import type { ElementType, ReactNode } from "react";
import { cn, panelClassName } from "@/components/ui/styles";

type SurfaceCardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

export default function SurfaceCard<T extends ElementType = "section">({
  as,
  className,
  children,
}: SurfaceCardProps<T>) {
  const Component = as ?? "section";

  return <Component className={cn(panelClassName, className)}>{children}</Component>;
}
