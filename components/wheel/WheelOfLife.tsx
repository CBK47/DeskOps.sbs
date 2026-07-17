import { cn } from "@/lib/utils";
import { LIFE_DOMAIN_LABELS, type LifeDomain, type WheelScore, wheelFilterHref } from "@/lib/wheel";

type WheelOfLifeProps = {
  scores: WheelScore[];
  streamIdsByDomain: Partial<Record<LifeDomain, string[]>>;
};

const DOMAIN_COLOURS: Record<LifeDomain, string> = {
  health: "text-lime-600 dark:text-lime-300",
  career: "text-indigo-600 dark:text-indigo-300",
  money: "text-emerald-600 dark:text-emerald-300",
  family: "text-rose-600 dark:text-rose-300",
  love: "text-pink-600 dark:text-pink-300",
  friends: "text-sky-600 dark:text-sky-300",
  fun: "text-orange-600 dark:text-orange-300",
  spirituality: "text-violet-600 dark:text-violet-300",
};

const SIZE = 320;
const CENTRE = SIZE / 2;
const RADIUS = 104;

export function WheelOfLife({ scores, streamIdsByDomain }: WheelOfLifeProps) {
  const points = scores.map((score, index) => pointAt(index, score.score ?? 0));
  const summary = scores
    .map((score) => `${LIFE_DOMAIN_LABELS[score.domain]} ${score.score === null ? "not set" : `${score.score} out of 10`}`)
    .join(", ");

  return (
    <section className="rounded-lg border bg-card/40 p-4" aria-labelledby="wheel-title">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Live balance</p>
          <h2 id="wheel-title" className="mt-1 text-base font-semibold">Wheel of Life</h2>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">Queue health</span>
      </div>

      <svg
        className="mx-auto mt-2 block w-full max-w-[20rem] overflow-visible"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        focusable="false"
      >
        {[2, 4, 6, 8, 10].map((ring) => (
          <polygon
            key={ring}
            points={scores.map((_, index) => pointAt(index, ring)).map(toPointString).join(" ")}
            className="fill-none stroke-border"
            strokeWidth="1"
          />
        ))}
        {scores.map((score, index) => {
          const outer = pointAt(index, 10);
          return <line key={score.domain} x1={CENTRE} y1={CENTRE} x2={outer.x} y2={outer.y} className="stroke-border" strokeWidth="1" />;
        })}
        <polygon points={points.map(toPointString).join(" ")} className="fill-primary/10 stroke-primary" strokeWidth="2" />
        {scores.map((score, index) => {
          const point = points[index];
          const label = LIFE_DOMAIN_LABELS[score.domain];
          const href = wheelFilterHref(streamIdsByDomain[score.domain] ?? []);
          const markerClass = score.score === null ? "text-muted-foreground" : DOMAIN_COLOURS[score.domain];
          const labelPoint = pointAt(index, 12.6);
          return (
            <g key={score.domain} className={markerClass}>
              <circle
                cx={point.x}
                cy={point.y}
                r={href ? "6" : "4"}
                className={href ? "fill-current stroke-background" : "fill-current/50"}
                strokeWidth={href ? "2" : undefined}
              />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor={textAnchor(labelPoint.x)}
                dominantBaseline="middle"
                className="fill-current text-[10px] font-medium"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">Derived from open, overdue, and recently completed work. Select a life domain below to filter the queue.</p>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs" aria-label={`Wheel of Life queue health: ${summary}`}>
        {scores.map((score) => (
          <li key={score.domain}>
            <WheelScoreRow
              label={LIFE_DOMAIN_LABELS[score.domain]}
              score={score.score}
              href={wheelFilterHref(streamIdsByDomain[score.domain] ?? [])}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function WheelScoreRow({ label, score, href }: { label: string; score: number | null; href: string | null }) {
  const value = score === null ? "No score" : `${score}/10`;
  const content = (
    <>
      <span className="truncate text-muted-foreground">{label}</span>
      <span className={cn("font-mono tabular-nums", score === null && "text-muted-foreground")}>{value}</span>
    </>
  );

  if (!href) return <div className="flex min-h-8 items-center justify-between gap-2 px-1">{content}</div>;

  return (
    <a
      href={href}
      aria-label={`Filter queue to ${label}, ${value}`}
      className="flex min-h-8 items-center justify-between gap-2 rounded-md px-1 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px motion-reduce:transform-none"
    >
      {content}
    </a>
  );
}

function pointAt(index: number, score: number) {
  const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
  const distance = (score / 10) * RADIUS;
  return { x: CENTRE + Math.cos(angle) * distance, y: CENTRE + Math.sin(angle) * distance };
}

function toPointString(point: { x: number; y: number }) {
  return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
}

function textAnchor(x: number) {
  if (x < CENTRE - 8) return "end";
  if (x > CENTRE + 8) return "start";
  return "middle";
}
