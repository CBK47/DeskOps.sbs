# DeskOps, OpenAI Build Week

## Category

Apps for Your Life

## One-liner

DeskOps turns life admin into one intelligent queue, then offers a private Wellness Wheel for reflection without taking the decisions away.

## What was built during Build Week

The prior DeskOps MVP was imported as one sanitised baseline commit:

`chore: import existing DeskOps (prior work)`

The Build Week work begins after that commit:

1. `feat: add life domains and Wheel of Life`
2. `feat: draft tickets from natural language`
3. `feat: add reviewable Career invoice drafts`

Commit hashes were intentionally omitted because the public history was rebuilt to normalise the maintainer identity and remove stale private identifiers while preserving the sequence and prior-work boundary.

### Demo flow

1. Sign in and set up the generic demo workspace from **Streams**.
2. The unified queue holds the work, while the optional Wellness Wheel keeps reflection separate from workload.
3. Enter a task naturally, for example: `renew the van insurance next Friday, high priority`.
4. GPT-5.6 returns a structured ticket draft. The user checks and confirms it before it is saved.
5. Open an eligible work stream, choose **Draft Occupational invoice**, set an hourly rate, and review the deterministic line items. GPT-5.6 may polish copy, but never changes the figures.

## Technology

- OpenAI Responses API with `OPENAI_MODEL=gpt-5.6`
- Next.js 15, React 18, TypeScript, and Tailwind CSS
- Supabase Auth, Postgres, and row-level security
- Cloudflare Workers through OpenNext
- Vitest and Playwright

## Human approval boundaries

- AI proposes ticket fields. The user submits the existing form to write a ticket.
- Editing an AI-filled field clears approval. Editing the original description requires a fresh draft and another review.
- AI may polish invoice text only. Quantities, rates, subtotals, and totals are deterministic.
- Invoice drafts are not saved, exported, or sent.

## Scope deliberately parked

- Chore automation and home-assistant integrations
- PDF invoices or persisted invoices
- Digest emails
- Shared household/client workspaces and multi-user permissions
- Recurrence intelligence

## Submission checklist

- [x] Record the Codex rebuild session ID: `019f6cac-1f8d-7111-a538-a0f0171070d5`
- [x] Publish the public source repository as `CBK47/DeskOps.sbs`.
- [ ] Add a public demo video under three minutes.
- [ ] Configure `OPENAI_API_KEY` and `OPENAI_MODEL` as Cloudflare Worker secrets.
- [ ] Apply the Supabase migrations and seed only generic demo data.
- [ ] Verify the deployed Google sign-in, Wheel, AI draft, and invoice draft.
