"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createTicketSafe } from "@/app/actions/tickets";
import { PRIORITY_ITEMS, RECURRENCE_ITEMS } from "@/lib/ticket-options";
import { draftTicketAction } from "@/app/actions/agent";
import { Sparkles } from "lucide-react";

type StreamLite = { id: string; name: string };

export function QuickAddDialog({ streams }: { streams: StreamLite[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startSubmitTransition] = useTransition();
  const [drafting, startDraftTransition] = useTransition();
  const router = useRouter();
  const [naturalLanguage, setNaturalLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [streamId, setStreamId] = useState(streams[0]?.id ?? "");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [notes, setNotes] = useState("");
  const [draftedByAi, setDraftedByAi] = useState(false);

  function resetForm() {
    setNaturalLanguage("");
    setTitle("");
    setStreamId(streams[0]?.id ?? "");
    setPriority("medium");
    setDueDate("");
    setRecurrence("none");
    setNotes("");
    setDraftedByAi(false);
  }

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  function handleNaturalLanguageDraft() {
    if (!naturalLanguage.trim()) {
      toast.error("Describe the task first.");
      return;
    }
    startDraftTransition(async () => {
      const result = await draftTicketAction(naturalLanguage);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTitle(result.draft.title);
      setStreamId(result.draft.stream_id);
      setPriority(result.draft.priority);
      setDueDate(result.draft.due_date ?? "");
      setRecurrence(result.draft.recurrence);
      setNotes(result.draft.notes);
      setDraftedByAi(true);
      toast.success("Ticket draft ready to review");
    });
  }

  // createTicketSafe deliberately skips revalidatePath (see its comment) —
  // refresh the router ourselves once we know the mutation is done, on
  // both success and failure, so the queue never goes stale even if the
  // insert partially succeeded before an error.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startSubmitTransition(async () => {
      // A stale Server Action reference (e.g. this tab loaded before a
      // redeploy) or a network hiccup can make the RPC reject or resolve
      // to something other than the expected shape — never let that
      // crash the page. Worst case the user sees a generic error toast
      // and can retry, instead of losing the whole app to an error screen.
      let result: Awaited<ReturnType<typeof createTicketSafe>> | undefined;
      try {
        result = await createTicketSafe(null, formData);
      } catch {
        toast.error("Failed to add ticket — please try again.");
        router.refresh();
        return;
      }
      if (result?.ok) {
        setOpen(false);
        toast.success("Ticket added");
        resetForm();
      } else {
        toast.error(result?.error ?? "Failed to add ticket — please try again.");
      }
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add ticket"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full p-0 text-2xl leading-none shadow-lg transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 motion-reduce:transform-none"
      >
        +
      </Button>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
        <DialogTitle>New ticket</DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border bg-secondary/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="natural-language">Describe it naturally</Label>
              <Sparkles className="h-4 w-4 text-cbk-blue dark:text-cbk-blue-hover" aria-hidden />
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                id="natural-language"
                value={naturalLanguage}
                onChange={(event) => setNaturalLanguage(event.target.value)}
                maxLength={1200}
                placeholder="e.g. renew the van insurance next Friday"
              />
              <Button type="button" variant="secondary" onClick={handleNaturalLanguageDraft} disabled={drafting}>
                {drafting ? "Drafting…" : "Draft"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">DeskOps will pre-fill a draft for you to check before it is added.</p>
          </div>

          {draftedByAi && <p className="text-xs text-cbk-blue dark:text-cbk-blue-hover">Drafted by AI, check me before adding.</p>}

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stream</Label>
              <Select
                name="stream_id"
                required
                value={streamId}
                onValueChange={(value) => setStreamId(value ?? "")}
                items={streams.map((s) => ({ value: s.id, label: s.name }))}
              >
                <SelectTrigger><SelectValue placeholder="Pick a stream" /></SelectTrigger>
                <SelectContent>
                  {streams.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" value={priority} onValueChange={(value) => setPriority(value ?? "medium")} items={PRIORITY_ITEMS}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select name="recurrence" value={recurrence} onValueChange={(value) => setRecurrence(value ?? "none")} items={RECURRENCE_ITEMS}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
