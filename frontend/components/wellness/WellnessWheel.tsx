import { WELLNESS_DIMENSIONS, WELLNESS_FOCUS_LABELS, type WellnessDimension } from "@/lib/wellness";

export type WellnessWheelEntry = {
  dimension: WellnessDimension;
  current_rating: number | null;
  desired_rating: number | null;
  focus_state: "active_focus" | "background" | "not_tracking";
};

const SIZE = 360;
const CENTRE = SIZE / 2;
const RADIUS = 112;

export function WellnessWheel({ entries, compact = false }: { entries: WellnessWheelEntry[]; compact?: boolean }) {
  const byDimension = new Map(entries.map((entry) => [entry.dimension, entry]));
  const summary = WELLNESS_DIMENSIONS.map((dimension) => {
    const entry = byDimension.get(dimension.id);
    return `${dimension.label}: ${entry?.current_rating ? `${entry.current_rating} out of 10` : "not rated"}`;
  }).join(", ");

  return (
    <section className="wellness-wheel" aria-labelledby="wellness-wheel-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="signal-label">Private snapshot</p>
          <h2 id="wellness-wheel-title" className={compact ? "mt-1 text-lg font-semibold" : "mt-2 text-2xl font-semibold"}>
            Wellness Wheel
          </h2>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">8 dimensions</span>
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto mt-2 block w-full max-w-sm animate-soft-in motion-reduce:animate-none"
        role="img"
        aria-label={`Wellness Wheel. ${summary}`}
      >
        {[2, 4, 6, 8, 10].map((ring) => (
          <circle key={ring} cx={CENTRE} cy={CENTRE} r={(ring / 10) * RADIUS} className="fill-none stroke-border/80" />
        ))}
        {WELLNESS_DIMENSIONS.map((dimension, index) => {
          const entry = byDimension.get(dimension.id);
          const current = entry?.focus_state === "not_tracking" ? null : entry?.current_rating ?? null;
          const desired = entry?.focus_state === "not_tracking" ? null : entry?.desired_rating ?? null;
          const outer = pointAt(index, 10);
          const labelPoint = pointAt(index, 13.2);
          const desiredPoint = desired ? pointAt(index, desired) : null;
          return (
            <g key={dimension.id}>
              <line x1={CENTRE} y1={CENTRE} x2={outer.x} y2={outer.y} className="stroke-border" />
              <path
                d={wedgePath(index, current ?? 10)}
                className={current === null ? "fill-muted/20 stroke-muted-foreground/35" : "fill-primary/20 stroke-primary"}
                strokeDasharray={current === null ? "4 5" : undefined}
              />
              {desiredPoint && <circle cx={desiredPoint.x} cy={desiredPoint.y} r="3.5" className="fill-background stroke-primary" strokeWidth="2" />}
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor={textAnchor(labelPoint.x)}
                dominantBaseline="middle"
                className="fill-foreground text-[10px] font-semibold"
              >
                {dimension.label}
              </text>
              <text
                x={labelPoint.x}
                y={labelPoint.y + 12}
                textAnchor={textAnchor(labelPoint.x)}
                dominantBaseline="middle"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                {current === null ? "not rated" : `${current}/10`}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-sm leading-6 text-muted-foreground">
        A rating is an observation, not an instruction. The outlined markers show where you would like a dimension to be.
      </p>
      <ul className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-2" aria-label="Wellness Wheel values">
        {WELLNESS_DIMENSIONS.map((dimension) => {
          const entry = byDimension.get(dimension.id);
          const value = entry?.focus_state === "not_tracking" || !entry?.current_rating ? "Not tracking" : `${entry.current_rating}/10`;
          return (
            <li key={dimension.id} className="flex min-h-8 items-center justify-between gap-3 border-t border-border/70 pt-2 text-sm">
              <span>{dimension.label}</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {value}{entry?.focus_state === "active_focus" ? " · focus" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <span className="sr-only">{entries.map((entry) => WELLNESS_FOCUS_LABELS[entry.focus_state]).join(", ")}</span>
    </section>
  );
}

function pointAt(index: number, score: number) {
  const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
  const distance = (score / 10) * RADIUS;
  return { x: CENTRE + Math.cos(angle) * distance, y: CENTRE + Math.sin(angle) * distance };
}

function wedgePath(index: number, score: number) {
  const halfWedge = Math.PI / 10;
  const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
  const distance = (score / 10) * RADIUS;
  const left = { x: CENTRE + Math.cos(angle - halfWedge) * distance, y: CENTRE + Math.sin(angle - halfWedge) * distance };
  const right = { x: CENTRE + Math.cos(angle + halfWedge) * distance, y: CENTRE + Math.sin(angle + halfWedge) * distance };
  return `M ${CENTRE} ${CENTRE} L ${left.x.toFixed(1)} ${left.y.toFixed(1)} A ${distance.toFixed(1)} ${distance.toFixed(1)} 0 0 1 ${right.x.toFixed(1)} ${right.y.toFixed(1)} Z`;
}

function textAnchor(x: number) {
  if (x < CENTRE - 10) return "end";
  if (x > CENTRE + 10) return "start";
  return "middle";
}
