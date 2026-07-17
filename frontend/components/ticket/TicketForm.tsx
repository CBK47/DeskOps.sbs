import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StreamPicker } from "@/components/stream/StreamPicker";
import { PRIORITY_ITEMS, RECURRENCE_ITEMS } from "@/lib/ticket-options";
import type { Ticket } from "@/lib/db/tickets";

export function TicketForm({
  action,
  ticket,
  submitLabel = "Save",
}: {
  action: (formData: FormData) => void | Promise<void>;
  ticket?: Pick<Ticket, "title" | "notes" | "stream_id" | "priority" | "recurrence" | "due_date">;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={ticket?.title} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Stream</Label>
          <StreamPicker defaultValue={ticket?.stream_id} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={ticket?.priority ?? "medium"} items={PRIORITY_ITEMS}>
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
          <Input id="due_date" name="due_date" type="date" defaultValue={ticket?.due_date ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="recurrence">Recurrence</Label>
          <Select name="recurrence" defaultValue={ticket?.recurrence ?? "none"} items={RECURRENCE_ITEMS}>
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
        <Textarea id="notes" name="notes" rows={4} defaultValue={ticket?.notes ?? ""} />
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
