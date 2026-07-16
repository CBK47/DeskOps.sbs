"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-2 py-1 transition-colors duration-150",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
