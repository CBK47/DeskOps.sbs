"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_ITEMS, STATUS_ITEMS } from "@/lib/ticket-options";

type StreamLite = { id: string; name: string };

const DUE_OPTIONS: { value: string; label: string }[] = [
  { value: "any",     label: "Any" },
  { value: "overdue", label: "Overdue" },
  { value: "today",   label: "Today" },
  { value: "week",    label: "This week" },
  { value: "later",   label: "Later" },
  { value: "none",    label: "No date" },
];

const DEFAULT_STATUSES = ["open","in_progress"] as const;

export function TicketFilters({ streams }: { streams: StreamLite[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const existing = next.getAll(key);
    if (existing.includes(value)) {
      const remaining = existing.filter(v => v !== value);
      next.delete(key);
      remaining.forEach(v => next.append(key, v));
    } else {
      next.append(key, value);
    }
    router.replace(`/queue?${next.toString()}`);
  }

  function toggleStatus(value: string) {
    const next = new URLSearchParams(params.toString());
    const existing = next.getAll("status");

    // If we're in default mode (no explicit status params), materialise the
    // implicit defaults before toggling so the UI matches what the user sees.
    const effective = existing.length === 0 ? [...DEFAULT_STATUSES] : existing;

    const newSet = effective.includes(value)
      ? effective.filter(v => v !== value)
      : [...effective, value];

    next.delete("status");
    newSet.forEach(v => next.append("status", v));
    router.replace(`/queue?${next.toString()}`);
  }

  function setDue(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "any") next.delete("due");
    else                 next.set("due", value);
    router.replace(`/queue?${next.toString()}`);
  }

  function setDensity(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "comfortable") next.delete("density");
    else next.set("density", value);
    router.replace(`/queue?${next.toString()}`);
  }

  function clear() { router.replace("/queue"); }

  const activeStreams    = params.getAll("stream");
  const activePriorities = params.getAll("priority");
  const explicitStatuses = params.getAll("status");
  const effectiveStatuses = explicitStatuses.length ? explicitStatuses : [...DEFAULT_STATUSES];
  const activeDue        = params.get("due") ?? "any";
  const activeDensity    = params.get("density") === "compact" ? "compact" : "comfortable";

  return (
    <div className="filter-panel text-sm">
      <FilterRow label="Stream">
        {streams.map(s => (
          <FilterChip
            key={s.id}
            active={activeStreams.includes(s.id)}
            onClick={() => toggle("stream", s.id)}
            label={s.name}
          />
        ))}
      </FilterRow>

      <FilterRow label="Priority">
        {PRIORITY_ITEMS.map(p => (
          <FilterChip key={p.value} active={activePriorities.includes(p.value)} onClick={() => toggle("priority", p.value)} label={p.label} />
        ))}
      </FilterRow>

      <FilterRow label="Due">
        {DUE_OPTIONS.map(o => (
          <FilterChip key={o.value} active={activeDue === o.value} onClick={() => setDue(o.value)} label={o.label} />
        ))}
      </FilterRow>

      <FilterRow label="Status">
        {STATUS_ITEMS.map(s => (
          <FilterChip key={s.value} active={effectiveStatuses.includes(s.value)} onClick={() => toggleStatus(s.value)} label={s.label} />
        ))}
      </FilterRow>

      <FilterRow label="Density">
        <FilterChip active={activeDensity === "comfortable"} onClick={() => setDensity("comfortable")} label="Comfortable" />
        <FilterChip active={activeDensity === "compact"} onClick={() => setDensity("compact")} label="Compact" />
      </FilterRow>

      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear filters</Button>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 font-mono text-[11px] tracking-wide text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
    >
      <Badge
        variant={active ? "default" : "outline"}
        className={`cursor-pointer rounded-md transition-colors duration-150 ${
          active ? "" : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        {label}
      </Badge>
    </button>
  );
}
