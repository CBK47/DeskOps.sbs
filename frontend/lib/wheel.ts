import type { Stream } from "@/lib/db/streams";
import type { Ticket } from "@/lib/db/tickets";
import { toLondonIsoDate } from "@/lib/dates";

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

export function computeWheelScores(
  tickets: WheelTicket[],
  streams: WheelStream[],
  today = new Date(),
): WheelScore[] {
  const todayInLondon = toLondonIsoDate(today);

  return LIFE_DOMAINS.map((domain) => {
    const streamIds = new Set(streams.filter((stream) => stream.life_domain === domain).map((stream) => stream.id));
    if (streamIds.size === 0) return { domain, score: null, openCount: 0, overdueCount: 0 };

    const domainTickets = tickets.filter((ticket) => streamIds.has(ticket.stream_id));
    const openTickets = domainTickets.filter((ticket) => ticket.status === "open" || ticket.status === "in_progress");
    const overdueCount = openTickets.filter((ticket) => isOverdue(ticket.due_date, todayInLondon)).length;
    const recentClosed = domainTickets.filter((ticket) => isRecentClose(ticket.closed_at, today, todayInLondon)).length;

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

export function wheelFilterHref(streamIds: readonly string[]): string | null {
  if (!streamIds.length) return null;
  const params = new URLSearchParams();
  streamIds.forEach((id) => params.append("stream", id));
  return `/queue?${params.toString()}`;
}

function isOverdue(dueDate: string | null, todayInLondon: string): boolean {
  return dueDate !== null && dueDate < todayInLondon;
}

function isRecentClose(closedAt: string | null, today: Date, todayInLondon: string): boolean {
  if (!closedAt) return false;
  const closed = new Date(closedAt);
  if (Number.isNaN(closed.getTime()) || closed > today) return false;

  const closedInLondon = toLondonIsoDate(closed);
  const daysSinceClose = (Date.parse(`${todayInLondon}T00:00:00Z`) - Date.parse(`${closedInLondon}T00:00:00Z`)) / 86_400_000;
  return daysSinceClose >= 0 && daysSinceClose <= 14;
}

function clampToTen(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}
