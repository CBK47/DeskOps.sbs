import type { Stream } from "@/lib/db/streams";
import type { Ticket } from "@/lib/db/tickets";

export const LIFE_DOMAINS = [
  "health",
  "career",
  "money",
  "family",
  "love",
  "friends",
  "fun",
  "spirituality",
] as const;

export type LifeDomain = (typeof LIFE_DOMAINS)[number];

export const LIFE_DOMAIN_LABELS: Record<LifeDomain, string> = {
  health: "Health",
  career: "Career",
  money: "Money",
  family: "Family",
  love: "Love",
  friends: "Friends",
  fun: "Fun",
  spirituality: "Spirituality",
};

export type WheelScore = {
  domain: LifeDomain;
  score: number | null;
  openCount: number;
  overdueCount: number;
};

type WheelTicket = Pick<Ticket, "stream_id" | "status" | "due_date" | "closed_at">;
type WheelStream = Pick<Stream, "id" | "life_domain">;

const DAY_MS = 24 * 60 * 60 * 1000;

export function computeWheelScores(
  tickets: WheelTicket[],
  streams: WheelStream[],
  today = new Date(),
): WheelScore[] {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  return LIFE_DOMAINS.map((domain) => {
    const streamIds = new Set(streams.filter((stream) => stream.life_domain === domain).map((stream) => stream.id));
    if (streamIds.size === 0) return { domain, score: null, openCount: 0, overdueCount: 0 };

    const domainTickets = tickets.filter((ticket) => streamIds.has(ticket.stream_id));
    const openTickets = domainTickets.filter((ticket) => ticket.status === "open" || ticket.status === "in_progress");
    const overdueCount = openTickets.filter((ticket) => isOverdue(ticket.due_date, todayStart)).length;
    const recentClosed = domainTickets.filter((ticket) => isRecentClose(ticket.closed_at, todayStart)).length;

    // The score is a queue-health signal, not a self-assessment. Open work has
    // a modest cost, overdue work has a larger one, and recent completion gives
    // a small recovery credit. It remains intentionally legible and bounded.
    const rawScore = 10 - openTickets.length * 0.35 - overdueCount * 1.5 + Math.min(recentClosed, 4) * 0.15;
    return {
      domain,
      score: clampToTen(rawScore),
      openCount: openTickets.length,
      overdueCount,
    };
  });
}

function isOverdue(dueDate: string | null, today: Date): boolean {
  if (!dueDate) return false;
  return new Date(`${dueDate}T00:00:00`) < today;
}

function isRecentClose(closedAt: string | null, today: Date): boolean {
  if (!closedAt) return false;
  const closed = new Date(closedAt);
  return closed <= today && today.getTime() - closed.getTime() <= 14 * DAY_MS;
}

function clampToTen(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}
