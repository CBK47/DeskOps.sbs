import type { LifeDomain, Stream } from "@/lib/db/streams";
import type { TicketPriority, RecurrenceRule } from "@/lib/db/tickets";
import { getOpenAIClient } from "@/lib/agent/openai";

const PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];
const RECURRENCES: RecurrenceRule[] = ["none", "daily", "weekly", "monthly", "yearly"];
const LIFE_DOMAINS: LifeDomain[] = ["health", "career", "money", "family", "love", "friends", "fun", "spirituality"];

export type TicketDraft = {
  title: string;
  notes: string;
  priority: TicketPriority;
  recurrence: RecurrenceRule;
  due_date: string | null;
  stream_id: string;
  suggested_stream_name: string | null;
};

export type TicketCandidate = {
  title: unknown;
  notes: unknown;
  priority: unknown;
  recurrence: unknown;
  due_date: unknown;
  suggested_stream_name: unknown;
  suggested_life_domain: unknown;
};

type ActiveStream = Pick<Stream, "id" | "name" | "life_domain" | "archived">;

const TICKET_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "notes", "priority", "recurrence", "due_date", "suggested_stream_name", "suggested_life_domain"],
  properties: {
    title: { type: "string" },
    notes: { type: "string" },
    priority: { type: "string", enum: PRIORITIES },
    recurrence: { type: "string", enum: RECURRENCES },
    due_date: { type: ["string", "null"] },
    suggested_stream_name: { type: ["string", "null"] },
    suggested_life_domain: { type: ["string", "null"], enum: [...LIFE_DOMAINS, null] },
  },
} as const;

export async function parseTicketText(text: string, streams: readonly ActiveStream[], now = new Date()): Promise<TicketDraft> {
  const activeStreams = streams.filter((stream) => !stream.archived);
  if (!activeStreams.length) throw new Error("Create a stream before asking DeskOps to draft a ticket.");

  const input = text.trim();
  if (!input) throw new Error("Describe the task you want DeskOps to draft.");
  if (input.length > 1_200) throw new Error("Keep the AI draft request to 1,200 characters or fewer.");

  const { client, model } = getOpenAIClient();
  const streamContext = activeStreams.map((stream) => ({ name: stream.name, life_domain: stream.life_domain }));
  const currentDate = toLondonIsoDate(now);
  const response = await client.responses.create({
    model,
    store: false,
    input: [
      {
        role: "developer",
        content: [
          "You draft one personal life-admin ticket for human review.",
          "Extract only what the user explicitly asks for. Do not give health, financial, legal, or therapeutic advice.",
          `Today is ${currentDate}. Resolve relative dates to YYYY-MM-DD. Use null when no reliable date is stated.`,
          "Use concise UK English. Pick only a supplied stream name and matching life domain when confident. Never invent a stream, ID, client, price, or deadline.",
          `Available streams: ${JSON.stringify(streamContext)}.`,
        ].join("\n"),
      },
      { role: "user", content: input },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "ticket_draft",
        strict: true,
        schema: TICKET_SCHEMA,
      },
    },
  });

  if (!response.output_text) throw new Error("DeskOps could not draft a ticket from that request.");
  return normaliseTicketCandidate(JSON.parse(response.output_text) as TicketCandidate, activeStreams, now);
}

export function normaliseTicketCandidate(candidate: TicketCandidate, streams: readonly ActiveStream[], now = new Date()): TicketDraft {
  const activeStreams = streams.filter((stream) => !stream.archived);
  const fallbackStream = activeStreams.find((stream) => normalise(stream.name) === "admin") ?? activeStreams[0];
  if (!fallbackStream) throw new Error("Create a stream before asking DeskOps to draft a ticket.");

  const title = textValue(candidate.title, "Untitled task", 160);
  const suggestedStreamName = nullableText(candidate.suggested_stream_name, 80);
  const stream = resolveStream(suggestedStreamName, candidate.suggested_life_domain, activeStreams) ?? fallbackStream;

  return {
    title,
    notes: textValue(candidate.notes, "", 1_200),
    priority: enumValue(candidate.priority, PRIORITIES, "medium"),
    recurrence: enumValue(candidate.recurrence, RECURRENCES, "none"),
    due_date: normaliseDate(candidate.due_date, now),
    stream_id: stream.id,
    suggested_stream_name: suggestedStreamName,
  };
}

function resolveStream(name: string | null, domain: unknown, streams: readonly ActiveStream[]) {
  const normalisedName = name ? normalise(name) : "";
  const exact = streams.find((stream) => normalise(stream.name) === normalisedName);
  if (exact) return exact;

  const contains = normalisedName
    ? streams.find((stream) => normalise(stream.name).includes(normalisedName) || normalisedName.includes(normalise(stream.name)))
    : undefined;
  if (contains) return contains;

  return isLifeDomain(domain) ? streams.find((stream) => stream.life_domain === domain) : undefined;
}

function normaliseDate(value: unknown, now: Date): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || toLocalIsoDate(parsed) !== value) return null;
  // The model may reasonably draft past-due work, so do not discard past dates.
  void now;
  return value;
}

function textValue(value: unknown, fallback: string, maxLength: number): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : fallback;
}

function nullableText(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, maxLength) : null;
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function isLifeDomain(value: unknown): value is LifeDomain {
  return typeof value === "string" && LIFE_DOMAINS.includes(value as LifeDomain);
}

function normalise(value: string) {
  return value.trim().toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, " ").trim();
}

export function toLondonIsoDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function toLocalIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
