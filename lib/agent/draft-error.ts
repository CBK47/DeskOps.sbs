const ACTIONABLE_DRAFT_ERRORS = new Set([
  "Create a stream before asking DeskOps to draft a ticket.",
  "Describe the task you want DeskOps to draft.",
  "Keep the AI draft request to 1,200 characters or fewer.",
]);

export function ticketDraftErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.startsWith("AI drafting is not configured")) {
      return "AI drafting is not configured for this deployment yet.";
    }
    if (ACTIONABLE_DRAFT_ERRORS.has(error.message)) return error.message;
  }

  return "DeskOps could not draft a ticket. Please check the details and try again.";
}
