"use client";
import { Button } from "@/components/ui/button";

export function DeleteTicketButton({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this ticket permanently? This can't be undone.")) {
      e.preventDefault();
    }
  }
  return (
    <form action={action} onSubmit={handleSubmit}>
      <Button type="submit" variant="destructive">Delete</Button>
    </form>
  );
}
