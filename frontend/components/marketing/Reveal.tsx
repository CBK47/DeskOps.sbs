import { cn } from "@/lib/utils";

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("marketing-reveal", className)}>{children}</div>;
}
