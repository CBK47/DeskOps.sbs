"use client";
import { useRef, useState, useTransition } from "react";
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

type StreamLite = { id: string; name: string };

export function QuickAddDialog({ streams }: { streams: StreamLite[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // createTicketSafe deliberately skips revalidatePath (see its comment) —
  // refresh the router ourselves once we know the mutation is done, on
  // both success and failure, so the queue never goes stale even if the
  // insert partially succeeded before an error.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
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
        formRef.current?.reset();
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogTitle>New ticket</DialogTitle>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stream</Label>
              <Select
                name="stream_id"
                required
                defaultValue={streams[0]?.id}
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
              <Select name="priority" defaultValue="medium" items={PRIORITY_ITEMS}>
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
              <Input id="due_date" name="due_date" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select name="recurrence" defaultValue="none" items={RECURRENCE_ITEMS}>
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
            <Textarea id="notes" name="notes" rows={4} />
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
