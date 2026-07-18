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
3. `feat: add private Wellness assessments and redesigned product surfaces`

Commit hashes were intentionally omitted because the public history was rebuilt to normalise the maintainer identity and remove stale private identifiers while preserving the sequence and prior-work boundary.

### Demo flow

1. Sign in and set up the generic demo workspace from **Streams**.
2. The unified queue holds the work, while the optional Wellness Wheel keeps reflection separate from workload.
3. Enter a task naturally, for example: `renew the van insurance next Friday, high priority`.
4. GPT-5.6 returns a structured ticket draft. The user may edit it, then chooses **Add ticket** once to save it.

## Technology

- OpenAI Responses API with `OPENAI_MODEL=gpt-5.6`
- Next.js 15, React 18, TypeScript, and Tailwind CSS
- Supabase Auth, Postgres, and row-level security
- Cloudflare Workers through OpenNext
- Vitest and Playwright

## Human approval boundaries

- AI proposes ticket fields. The user submits the existing form to write a ticket.
- AI-filled fields remain editable. The person chooses **Add ticket** once to save the finished draft.

## Scope deliberately parked

- Chore automation and home-assistant integrations
- Digest emails
- Shared household/client workspaces and multi-user permissions
- Recurrence intelligence

## Submission checklist

- [x] Record the Codex rebuild session ID: `019f6cac-1f8d-7111-a538-a0f0171070d5`
- [x] Publish the public source repository as `CBK47/DeskOps.sbs`.
- [ ] Add a public demo video under three minutes.
- [ ] Configure `OPENAI_API_KEY` and `OPENAI_MODEL` as Cloudflare Worker secrets.
- [ ] Apply the Supabase migrations and seed only generic demo data.
- [ ] Verify the deployed Google sign-in, Wheel, and AI draft.
