"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes can't know the resolved theme during SSR (it depends on
  // localStorage / matchMedia, both client-only). Rendering based on
  // resolvedTheme before mount causes a server/client markup mismatch,
  // which crashes hydration for this whole subtree. Render a neutral
  // placeholder until mounted so server and client agree on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button type="button" variant="ghost" size="icon-sm" aria-label="Toggle theme" disabled><Contrast className="h-4 w-4" /></Button>;
  }

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Contrast className="h-4 w-4" />
    </Button>
  );
}
