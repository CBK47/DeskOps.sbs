"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { draftRebalanceAction } from "@/app/actions/agent";
import { createTicketSafe } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RebalanceSelection, RebalanceTicketDraft } from "@/lib/rebalance";
import { toast } from "sonner";

type RebalanceStream = { id: string; name: string };
type RebalanceActionPromise = ReturnType<typeof draftRebalanceAction>;

const rebalanceDraftRequests = new Map<string, RebalanceActionPromise>();

export function RebalanceCard({
  assessmentId,
  selection,
  streams,
}: {
  assessmentId: string;
  selection: RebalanceSelection;
  streams: RebalanceStream[];
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RebalanceTicketDraft | null>(null);
  const [error, setError] = useState("");
  const [adding, startAddTransition] = useTransition();
  const storageKey = `deskops:rebalance:${assessmentId}`;

  const loadDraft = useCallback((fresh = false) => {
    if (fresh) rebalanceDraftRequests.delete(assessmentId);
    setError("");
    setLoading(true);

    void requestRebalanceDraft(assessmentId)
      .then((result) => {
        if (!result.ok) {
          rebalanceDraftRequests.delete(assessmentId);
          setError(result.error);
          return;
        }
        setDraft(result.draft);
        writeSessionValue(storageKey, JSON.stringify(result.draft));
      })
      .catch(() => {
        rebalanceDraftRequests.delete(assessmentId);
        setError("Busy moment — try again shortly.");
      })
      .finally(() => setLoading(false));
  }, [assessmentId, storageKey]);

  useEffect(() => {
    const stored = readSessionValue(storageKey);
    if (stored === "dismissed") {
      setHidden(true);
      setReady(true);
      return;
    }

    const cached = readCachedDraft(stored, streams);
    if (cached) {
      setDraft(cached);
      setReady(true);
      return;
    }

    setReady(true);
    loadDraft();
  }, [loadDraft, storageKey, streams]);

  if (!ready || hidden) return null;

  function dismiss() {
    writeSessionValue(storageKey, "dismissed");
    setHidden(true);
  }

  function addTicket() {
    if (!draft) return;
    setError("");
    const formData = new FormData();
    formData.set("title", draft.title);
    formData.set("notes", draft.notes);
    formData.set("stream_id", draft.stream_id);
    formData.set("priority", "low");
    formData.set("recurrence", "none");
    formData.set("due_date", "");

    startAddTransition(async () => {
      try {
        const result = await createTicketSafe(null, formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        dismiss();
        toast.success("Rebalance ticket added");
        router.refresh();
      } catch {
        setError("DeskOps could not add that ticket. Please try again.");
      }
    });
  }

  return (
    <section className="surface-panel border-primary/25 p-5 sm:p-6" aria-labelledby="rebalance-title" aria-busy={loading}>
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="signal-label">One thing to rebalance</p>
          <h2 id="rebalance-title" className="mt-2 text-xl font-semibold">{selection.label}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">I&apos;ve drafted one small step — you decide.</p>

          {loading && <p className="mt-5 text-sm text-muted-foreground" role="status">Drafting one gentle next step…</p>}
          {error && <p className="mt-5 text-sm text-muted-foreground" role="alert">{error}</p>}

          {!draft && (
            <div className="mt-5 flex flex-wrap gap-2">
              {error && <Button type="button" variant="secondary" onClick={() => loadDraft(true)} disabled={loading}>Try again</Button>}
              <Button type="button" variant="ghost" onClick={dismiss}>Not now</Button>
            </div>
          )}

          {draft && (
            <div className="mt-5 border-t border-border/70 pt-5">
              {editing ? (
                <div className="grid gap-4">
                  <label className="space-y-1.5 text-sm font-medium">
                    Title
                    <Input autoFocus value={draft.title} maxLength={160} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Notes
                    <Textarea value={draft.notes} maxLength={1200} rows={3} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Stream
                    <select
                      value={draft.stream_id}
                      onChange={(event) => {
                        const stream = streams.find((item) => item.id === event.target.value);
                        if (stream) setDraft({ ...draft, stream_id: stream.id, suggested_stream_name: stream.name });
                      }}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}
                    </select>
                  </label>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">{draft.title}</p>
                  {draft.notes && <p className="mt-2 text-sm leading-6 text-muted-foreground">{draft.notes}</p>}
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{draft.suggested_stream_name} · low pressure</p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" onClick={addTicket} disabled={adding || !draft.title.trim()}>
                  {adding ? "Adding…" : "Add ticket"}
                </Button>
                {!editing && <Button type="button" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>}
                <Button type="button" variant="ghost" onClick={dismiss}>Not now</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function requestRebalanceDraft(assessmentId: string): RebalanceActionPromise {
  const pending = rebalanceDraftRequests.get(assessmentId);
  if (pending) return pending;

  const request = draftRebalanceAction(assessmentId);
  rebalanceDraftRequests.set(assessmentId, request);
  return request;
}

function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Session storage is an enhancement. The card still works without it.
  }
}

function readCachedDraft(value: string | null, streams: RebalanceStream[]): RebalanceTicketDraft | null {
  if (!value || value === "dismissed") return null;
  try {
    const draft = JSON.parse(value) as Partial<RebalanceTicketDraft>;
    const stream = streams.find((item) => item.id === draft.stream_id);
    if (!stream || typeof draft.title !== "string" || typeof draft.notes !== "string") return null;
    return {
      title: draft.title.slice(0, 160),
      notes: draft.notes.slice(0, 1_200),
      stream_id: stream.id,
      suggested_stream_name: stream.name,
    };
  } catch {
    return null;
  }
}
