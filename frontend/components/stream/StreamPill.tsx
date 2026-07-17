import { Badge } from "@/components/ui/badge";

// Dark-aware per DESIGN.md: solid pastels for light, alpha tints + 300-level
// text for dark so pills sit on any surface without glowing.
const COLOR_CLASSES: Record<string, string> = {
  slate:   "bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-300",
  sky:     "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  amber:   "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  orange:  "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  stone:   "bg-stone-100 text-stone-800 dark:bg-stone-500/15 dark:text-stone-300",
  indigo:  "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  rose:    "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  lime:    "bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-300",
  pink:    "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300",
  red:     "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  cyan:    "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
  violet:  "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

export function StreamPill({ name, color }: { name: string; color: string }) {
  return <Badge variant="outline" className={COLOR_CLASSES[color] ?? COLOR_CLASSES.slate}>{name}</Badge>;
}
