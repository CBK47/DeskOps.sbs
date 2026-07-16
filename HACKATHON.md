# DeskOps, OpenAI Build Week

## Category

Apps for Your Life

## One-liner

DeskOps turns life admin into one intelligent queue, then makes imbalance visible through a live Wheel of Life.

## What was built during Build Week

The prior DeskOps MVP was imported as one sanitised baseline commit:

`5301bb2 chore: import existing DeskOps (prior work)`

The Build Week work begins after that commit:

1. `af9feaa feat: add life domains and Wheel of Life`
2. `f565d8f feat: draft tickets from natural language`
3. `8578803 feat: add reviewable Career invoice drafts`

### Demo flow

1. Sign in and set up the generic demo workspace from **Streams**.
2. The unified queue and Wheel of Life show the health of each life domain.
3. Enter a task naturally, for example: `renew the van insurance next Friday, high priority`.
4. GPT-5.6 returns a structured ticket draft. The user checks and confirms it before it is saved.
5. Open the Career stream, choose **Draft invoice**, set an hourly rate, and review the deterministic line items. GPT-5.6 may polish copy, but never changes the figures.

## Technology

- OpenAI Responses API with `OPENAI_MODEL=gpt-5.6`
- Next.js 14, React 18, TypeScript, and Tailwind CSS
- Supabase Auth, Postgres, and row-level security
- Cloudflare Pages
- Vitest and Playwright

## Human approval boundaries

- AI proposes ticket fields. The user submits the existing form to write a ticket.
- AI may polish invoice text only. Quantities, rates, subtotals, and totals are deterministic.
- Invoice drafts are not saved, exported, or sent.

## Scope deliberately parked

- Chore automation and home-assistant integrations
- Wheel self-assessment questionnaire
- PDF invoices or persisted invoices
- Digest emails
- Shared household/client workspaces and multi-user permissions
- Recurrence intelligence

## Submission checklist

- [ ] Add the core Codex `/feedback` Session ID here: `PENDING`
- [ ] Add a public demo video under three minutes.
- [ ] Configure `OPENAI_API_KEY` and `OPENAI_MODEL` in Cloudflare Pages.
- [ ] Apply the Supabase migrations and seed only generic demo data.
- [ ] Verify the deployed Google sign-in, Wheel, AI draft, and invoice draft.
