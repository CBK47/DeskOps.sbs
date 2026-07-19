# DeskOps, OpenAI Build Week

## Category

Apps for Your Life

## One-liner

DeskOps turns life admin into one intelligent queue, then offers a private Wellness Wheel for reflection without taking the decisions away.

## Dated prior-work boundary

The pre-existing DeskOps MVP was imported on 16 July 2026 as one sanitised baseline commit:

`5e6ed8d chore: import existing DeskOps (prior work)`

Submission-period work begins after that commit at `d840cc2`. The repository history preserves that boundary; no later work is represented as part of the prior MVP.

## What was built during the submission period

1. `feat: add life domains and Wheel of Life`
2. `feat: draft tickets from natural language`
3. `feat: add private Wellness assessments and redesigned product surfaces`
4. `feat: draft one calm rebalance step`

### Demo flow

1. Sign in and set up the generic demo workspace from **Streams**.
2. The unified queue holds the work, while the optional Wellness Wheel keeps reflection separate from workload.
3. Enter a task naturally, for example: `renew the van insurance next Friday, high priority`.
4. GPT-5.6 returns a structured ticket draft. The user may edit it, then chooses **Add ticket** once to save it.
5. Complete a private snapshot, return to the queue, and show Rebalance selecting the largest tracked gap deterministically. GPT-5.6 drafts exactly one small step; the person may edit, add or dismiss it.

## Technology

- OpenAI Responses API with `OPENAI_MODEL=gpt-5.6`
- Next.js 15, React 18, TypeScript, and Tailwind CSS
- Supabase Auth, Postgres, and row-level security
- Cloudflare Workers through OpenNext
- Vitest and Playwright

## Human approval boundaries

- AI proposes ticket fields. The user submits the existing form to write a ticket.
- AI-filled fields remain editable. The person chooses **Add ticket** once to save the finished draft.
- Rebalance chooses a dimension with deterministic code. AI drafts one proposed ticket only and cannot save it.

## Codex collaboration, 18 July 2026

The bounded improvement loop was executed one task at a time on `codex/frontend-wellness-redesign`. It added explicit authentication and a shared per-user limiter to AI actions, hid invoice tooling behind default-off personal-mode flags, simplified AI capture to one human decision, and implemented Rebalance V1. The corresponding commits are `1b87a61`, `bf816ef`, `f8bc359`, and `fbff318`.

Every completed task passed TypeScript, ESLint, the full Vitest suite, Playwright smoke tests, and the OpenNext Cloudflare Worker build before push. No production deployment, remote migration, secret change or external submission was performed.

## Scope deliberately parked

- Chore automation and home-assistant integrations
- Digest emails
- Shared household/client workspaces and multi-user permissions
- Recurrence intelligence

## Public submission record

This document records only the Build Week scope and dated code boundary. Submission working plans, release checklists, deployment records, and credentials are intentionally maintained outside the public repository.
