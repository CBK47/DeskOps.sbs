# DeskOps situation report

| | |
| --- | --- |
| Snapshot | 19 July 2026 |
| Purpose | Authoritative hand-off for the next planning loop |
| Repository | `CBK47/DeskOps.sbs` |
| Working branch | `codex/frontend-wellness-redesign` |

This document answers two different questions separately:

1. What is implemented and pushed?
2. What is actually live in production?

Do not treat them as the same state.

## Executive status

The redesign, private Wellness foundation, secured AI draft boundary, Rebalance V1, expanded login and production-grade AI limiter are implemented, verified and merged to `main`. The additive Wellness migration is live in the confirmed production Supabase project. The Cloudflare Worker has not been promoted and `https://deskops.sbs` still serves the pre-redesign application.

The release branch can be pushed safely, but a full demo deployment remains gated on the missing `OPENAI_API_KEY` and `OPENAI_MODEL` Worker secrets. GitHub and email login are implemented with provider-aware visibility, but Supabase must still be given a GitHub OAuth app and production SMTP before those options become live.

## Source-control state

| Item | State |
| --- | --- |
| Canonical remote | `https://github.com/CBK47/DeskOps.sbs.git` |
| Production branch | `main` promoted through `11d4699` on 19 July 2026 |
| Review branch | `codex/frontend-wellness-redesign` |
| Prior release-evidence baseline | `66a8bc4` (`docs: close bounded improvement loop`) |
| Review branch pushed | Yes |
| Review branch merged to `main` | Yes, PR [#1](https://github.com/CBK47/DeskOps.sbs/pull/1) |
| Force-push required | No |

The implementation commits on the review branch are:

1. `566c6db` — private Wellness Wheel assessments;
2. `c2d81c6` — public and product surface redesign;
3. `e936fba` — Impeccable polish and hardening;
4. `53176b9` — focused Confer-inspired login experience;
5. `6587e10` — studio-style login entrance using the approved orbital artwork;
6. `1b87a61` — authenticated and rate-limited AI action boundary;
7. `bf816ef` — default-off personal-mode invoice tooling;
8. `f8bc359` — one-decision AI ticket capture;
9. `fbff318` — deterministic Rebalance selection and one-ticket draft flow;
10. `8adb64e` — Rebalance retry, dismissal and keyboard-focus polish.
11. `66a8bc4` — bounded-loop release and submission documentation.

The current `main` release changes add provider-aware Google, GitHub and email magic-link entry, a token-hash confirmation route, a SQLite-backed per-user Durable Object AI limiter, regenerated production database types and updated release evidence.

## What is implemented on `main`

### Public and authentication surfaces

- A real public landing page at `/` instead of an authentication redirect.
- A focused, responsive `/login` with a full-bleed studio backdrop, centred sign-in card, light/dark themes and privacy cues.
- Provider-aware Google, GitHub and email magic-link entry. Options remain hidden until the corresponding Supabase provider is enabled, avoiding dead demo controls.
- An `/auth/confirm` route for token-hash email templates and the existing safe `/auth/callback` path.
- No shared demo credentials: each tester signs in separately and can create private generic sample data with **Set up demo workspace**.
- Public privacy, terms and not-found pages.
- Restrained marketing reveals with a no-JavaScript fallback and reduced-motion support.

### Authenticated product

- The authenticated queue at `/queue`, with filters, density control, loading, empty and error states.
- Updated desktop and mobile navigation.
- Quick capture with a no-stream first-run path, editable AI fields and one user-controlled **Add ticket** action.
- Friendly stream and ticket mutation feedback, pending states and server-side input validation.
- Accessible destructive-action confirmation rather than a native browser prompt.
- Invoice tooling retained behind default-off server and client personal-mode flags, absent from the public product.
- AI actions require an authenticated user, share a per-user sliding-window limiter and return calm typed retry states.
- Production limiting uses one SQLite-backed Cloudflare Durable Object per authenticated user, giving an atomic limit across Worker isolates. Local development and unit tests retain an in-process fallback.
- Rebalance deterministically chooses the largest tracked Wellness gap, lets active focus break a tie, drafts exactly one small ticket, and supports edit, add or session-only dismissal.

### Wellness foundation

- An additive Supabase migration for private assessments and entries.
- Eight Dimensions of Wellness with untracked values represented as untracked, never zero.
- A skippable five-step assessment, current and desired ratings, chosen focus and reminder preference.
- Dated assessment history and an accessible Wheel with text and numeric values.
- Typed companion-tool links that do not receive user data or claim integration.
- Per-user row-level security policies and atomic assessment functions in the migration.

### Design and quality system

- `PRODUCT.md` and `DESIGN.md` define the current product and visual contract.
- Dark-first CBK design with light support, Manrope and JetBrains Mono.
- Keyboard focus, touch-target, responsive and reduced-motion improvements.
- The Impeccable audit removed the remaining native confirmation, side-stripe treatment and progressive-enhancement failure.

## Verified quality gates

The 19 July release candidate passed:

- `npm run typecheck`;
- `npm run lint`;
- `npm run test`: 18 files, 80 tests;
- `npm run test:e2e`: 6 Chromium tests;
- `npm run worker:build`: successful OpenNext Cloudflare bundle;
- `npx wrangler deploy --dry-run`: successful, with `AGENT_RATE_LIMITER` resolved to the `AgentRateLimiter` Durable Object.

The Worker build emits a duplicate `options` key warning inside a generated OpenNext dependency bundle. The build completes successfully; no authored DeskOps source contains that duplicate.

Visual QA covered the landing page and the final studio-style login in desktop light, desktop dark, authentication-error, all-provider and phone states. Authenticated production data was not used for visual QA.

## Production reality

As checked on 19 July 2026:

- Supabase production is project `deskops`, reference `szcflutkshtuzpvfdvae`, organisation `wtmuymqjtztzrwgrwknf`, in West Europe.
- Migration `20260718000001_wellness_assessments` was applied atomically through the Supabase Management API. Verification found one migration-history row, two RLS-enabled Wellness tables, eight policies and two assessment functions.
- Current Supabase auth settings expose Google only. GitHub and email are disabled pending their external credentials and SMTP configuration.
- Cloudflare production is account `3aecf1bd75b896c027f3be6a33e7df6b`, Worker `deskops`, with custom domain `deskops.sbs`.
- The latest existing Worker deployment is version `dd00da08-9705-4347-9e7f-6691fbd154c1`, created 18 July 2026.
- `https://deskops.sbs/` still returns `307` to `/login`, and the live login remains the old minimal `Sign in to DeskOps` page. Production is not yet serving the newly promoted `main` source.
- The Worker has the public Supabase variables but does not have `OPENAI_API_KEY` or `OPENAI_MODEL`. A full AI demo is therefore not configured in production.

## Release blockers

### P0: configure the production AI boundary

Set `OPENAI_API_KEY` and `OPENAI_MODEL` through Wrangler's secret workflow without printing or committing them. The additive database migration is already live, so the old Worker remains safe while this final deployment dependency is resolved.

### P1: finish public authentication

Create the GitHub OAuth app, store its client ID and secret in Supabase, enable email auth with production SMTP and test both callbacks. The release can technically ship with Google only because unavailable options stay hidden, but the requested three-method demo requires this setup.

### P2: controlled promotion

After the AI and authentication gates are ready:

1. rebuild `main` from the promoted release source with the public Supabase variables present;
2. deploy the Cloudflare Worker and its new `AgentRateLimiter` export;
3. smoke-test `/`, `/login`, all enabled auth methods, callback routes, `/queue`, demo workspace setup, assessment save/history, AI ticket draft and Rebalance add/edit/dismiss;
4. record the deployed Worker version and deployment time here; source control promotion is already complete.

## Known limitations, not blockers for planning

- Reminder cadence is stored but DeskOps does not send reminders.
- Companion tools are independent outbound links, not integrations.
- Invoice drafting remains a hidden personal-mode extra; its quantities default to one hour because persisted time tracking does not exist.
- Local Next.js development cannot use the Worker-owned Durable Object and intentionally falls back to in-process limiting. The production bundle uses the Durable Object.
- Nested Wellness areas, context tags, organisation workspaces, roles and client portals are not implemented.
- The old ticket-derived `life_domain` Wheel calculation remains in historical code/tests but is no longer presented as a personal wellness score.
- The correct core-build Codex session is `019f6cac-1f8d-7111-a538-a0f0171070d5` (`Design DeskOps life-ops app`). The current redesign session `019f755b-9a6b-7b31-a53b-4d36445096e5` is separate.
- A demo video and final Devpost status are not recorded in this repository.

## Decisions for the next planning loop

Fabel should help choose and sequence these outcomes rather than treating every historical checkbox as active:

1. **Release-first:** configure the missing Worker model secrets and auth-provider credentials, then deploy and smoke-test the verified redesign and Rebalance flow safely.
2. **Submission-first:** record the demo video and close the live-demo and Devpost evidence gaps around the released product.
3. **Platform-later:** design the owning-workspace, membership and client-portal model only after the bounded submission work is complete.

Recommended default: release-first, then submission-first. Keep platform work outside the current Build Week release.

## Guardrails for an autonomous loop

- Work only from the canonical clone and the named protected branch or a new named release branch.
- Fetch before starting and never force-push.
- Preserve unrelated user files and real personal data boundaries.
- Do not deploy, migrate production, change secrets or submit external forms without explicit human approval.
- Never print, inspect broadly or commit secrets.
- Use one bounded objective per loop, with acceptance criteria written before implementation.
- Keep AI writes draft-only and preserve the human approval boundary.
- Run typecheck, lint, unit tests, relevant browser tests and the Worker build before pushing a release candidate.
- Commit intentionally and update this SITREP when a blocker, branch, production or verification state changes.

## Copy-paste brief for Fabel

> Read `PRODUCT.md`, `DESIGN.md`, `docs/SITREP.md`, `docs/RELEASE-CHECKLIST.md`, `docs/frontend-redesign-plan.md`, and the historical `WINNING-PLAN.md` and `NEMO-EXECUTION-PLAN.md`. Produce a concise two-part plan: **Where DeskOps is now** and **Where DeskOps should be next**. Treat the private Wellness assessment, secured AI boundary and Rebalance V1 as implemented. Prioritise a safe release and submission evidence, name dependencies and explicit human approvals, define measurable exit criteria, and propose a bounded autonomous loop for Codex. Do not implement, deploy, migrate, change secrets or submit anything during the planning pass.

## Next human action

Add the production OpenAI key through Wrangler's interactive secret workflow and create the GitHub OAuth app and SMTP configuration. No secret should be pasted into chat or committed. Once those three external credentials exist, deploy the promoted `main` source and run the production smoke sequence.
