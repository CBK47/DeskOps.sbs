import { getOpenAIClient } from "@/lib/agent/openai";
import type { Stream } from "@/lib/db/streams";
import { WELLNESS_DIMENSIONS, WELLNESS_DIMENSION_LABELS, type WellnessDimension, type WellnessFocusState } from "@/lib/wellness";

export type RebalanceEntry = {
  dimension: WellnessDimension;
  current_rating: number | null;
  desired_rating: number | null;
  focus_state: WellnessFocusState;
  areas: string[];
  created_at: string;
};

export type RebalanceAssessment = {
  id: string;
  entries: readonly RebalanceEntry[];
};

export type RebalanceSelection = {
  assessment_id: string;
  dimension: WellnessDimension;
  label: string;
  current_rating: number;
  desired_rating: number;
  gap: number;
  focus_state: WellnessFocusState;
  areas: string[];
  rated_at: string;
};

export type RebalanceTicketDraft = {
  title: string;
  notes: string;
  stream_id: string;
  suggested_stream_name: string;
};

type RebalanceCandidate = {
  title?: unknown;
  description?: unknown;
  suggested_stream_name?: unknown;
};

type RebalanceStream = Pick<Stream, "id" | "name" | "archived">;

const DIMENSION_ORDER = new Map(WELLNESS_DIMENSIONS.map((dimension, index) => [dimension.id, index]));

const REBALANCE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "suggested_stream_name"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    suggested_stream_name: { type: "string" },
  },
} as const;

export function selectRebalanceDimension(assessment: RebalanceAssessment | null): RebalanceSelection | null {
  if (!assessment) return null;

  const candidates = assessment.entries
    .filter((entry) => entry.focus_state !== "not_tracking")
    .filter((entry): entry is RebalanceEntry & { current_rating: number; desired_rating: number } => (
      entry.current_rating !== null
      && entry.desired_rating !== null
      && entry.desired_rating > entry.current_rating
    ))
    .map((entry) => ({
      assessment_id: assessment.id,
      dimension: entry.dimension,
      label: WELLNESS_DIMENSION_LABELS[entry.dimension],
      current_rating: entry.current_rating,
      desired_rating: entry.desired_rating,
      gap: entry.desired_rating - entry.current_rating,
      focus_state: entry.focus_state,
      areas: entry.areas,
      rated_at: entry.created_at,
    } satisfies RebalanceSelection));

  return candidates.sort(compareRebalanceSelections)[0] ?? null;
}

function compareRebalanceSelections(left: RebalanceSelection, right: RebalanceSelection) {
  if (left.gap !== right.gap) return right.gap - left.gap;

  const leftFocused = left.focus_state === "active_focus";
  const rightFocused = right.focus_state === "active_focus";
  if (leftFocused !== rightFocused) return leftFocused ? -1 : 1;

  const dateOrder = left.rated_at.localeCompare(right.rated_at);
  if (dateOrder !== 0) return dateOrder;

  return (DIMENSION_ORDER.get(left.dimension) ?? 0) - (DIMENSION_ORDER.get(right.dimension) ?? 0);
}

export async function draftRebalanceTicket(
  selection: RebalanceSelection,
  streams: readonly RebalanceStream[],
): Promise<RebalanceTicketDraft> {
  const activeStreams = streams.filter((stream) => !stream.archived).slice(0, 50);
  if (!activeStreams.length) throw new Error("Create a stream before asking DeskOps to draft a rebalance step.");

  const { client, model } = getOpenAIClient();
  const response = await client.responses.create({
    model,
    store: false,
    input: [
      {
        role: "developer",
        content: [
          "Draft exactly one small personal ticket for human review.",
          "The dimension was chosen deterministically by DeskOps. Do not question it, diagnose the person, or mention scores in the ticket.",
          "Make the step gentle, concrete and realistically finishable. Use calm UK English with no guilt, urgency, medical, financial, legal or therapeutic advice.",
          "Return one title, one short description and exactly one supplied stream name. Never invent a stream or produce a list of actions.",
          `Dimension: ${selection.label}. Current: ${selection.current_rating}/10. Desired: ${selection.desired_rating}/10. Optional areas: ${JSON.stringify(selection.areas.slice(0, 8))}.`,
          `Available streams: ${JSON.stringify(activeStreams.map((stream) => stream.name))}.`,
        ].join("\n"),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "rebalance_ticket",
        strict: true,
        schema: REBALANCE_SCHEMA,
      },
    },
  });

  if (!response.output_text) throw new Error("DeskOps could not draft a rebalance step.");
  return normaliseRebalanceCandidate(JSON.parse(response.output_text) as RebalanceCandidate, activeStreams);
}

export function normaliseRebalanceCandidate(
  candidate: RebalanceCandidate,
  streams: readonly RebalanceStream[],
): RebalanceTicketDraft {
  const fallbackStream = streams.find((stream) => !stream.archived);
  if (!fallbackStream) throw new Error("Create a stream before asking DeskOps to draft a rebalance step.");

  const suggestedName = typeof candidate.suggested_stream_name === "string" ? candidate.suggested_stream_name.trim() : "";
  const stream = streams.find((item) => !item.archived && normalise(item.name) === normalise(suggestedName)) ?? fallbackStream;
  const title = typeof candidate.title === "string" && candidate.title.trim()
    ? candidate.title.trim().slice(0, 160)
    : `One small ${fallbackStream.name} step`;
  const notes = typeof candidate.description === "string" ? candidate.description.trim().slice(0, 1_200) : "";

  return {
    title,
    notes,
    stream_id: stream.id,
    suggested_stream_name: stream.name,
  };
}

function normalise(value: string) {
  return value.toLocaleLowerCase("en-GB").replace(/[^a-z0-9]+/g, " ").trim();
}
