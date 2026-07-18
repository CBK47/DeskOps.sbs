# DeskOps situation report

| | |
| --- | --- |
| Snapshot | 18 July 2026 |
| Purpose | Authoritative hand-off for the next planning loop |
| Repository | `CBK47/DeskOps.sbs` |
| Working branch | `codex/frontend-wellness-redesign` |

This document answers two different questions separately:

1. What is implemented and pushed?
2. What is actually live in production?

Do not treat them as the same state.

## Executive status

The redesign and Wellness foundation are implemented, verified and pushed to the working branch. Production has not been migrated or deployed and still serves the pre-redesign application from `main`.

The product code is ready for a controlled release process, but it should not be promoted by deploying the frontend alone. The new Wellness tables are absent from the configured Supabase project, and the AI server actions still need an explicit authentication and rate-limiting gate before a broader public demo.

## Source-control state

| Item | State |
| --- | --- |
| Canonical remote | `https://github.com/CBK47/DeskOps.sbs.git` |
| Production branch | `main` at `8cd6f8b` |
| Review branch | `codex/frontend-wellness-redesign` |
| Functional implementation baseline | `6587e10` (`feat: create studio-style login entrance`) |
| Review branch pushed | Yes |
| Review branch merged to `main` | No |
| Force-push required | No |

The implementation commits on the review branch are:

1. `566c6db` — private Wellness Wheel assessments;
2. `c2d81c6` — public and product surface redesign;
3. `e936fba` — Impeccable polish and hardening;
4. `53176b9` — focused Confer-inspired login experience;
5. `6587e10` — studio-style login entrance using the approved orbital artwork.

## What is implemented on the review branch

### Public and authentication surfaces

- A real public landing page at `/` instead of an authentication redirect.
- A focused, responsive `/login` with a full-bleed studio backdrop, centred sign-in card, light/dark themes, privacy cues and the existing Google OAuth flow.
- Public privacy, terms and not-found pages.
- Restrained marketing reveals with a no-JavaScript fallback and reduced-motion support.

### Authenticated product

- The authenticated queue at `/queue`, with filters, density control, loading, empty and error states.
- Updated desktop and mobile navigation.
- Quick capture with a no-stream first-run path and explicit AI-draft review.
- Friendly stream and ticket mutation feedback, pending states and server-side input validation.
- Accessible destructive-action confirmation rather than a native browser prompt.
- Review-only Occupational invoice drafting with deterministic figures.

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

The current functional implementation passed:

- `npm run typecheck`;
- `npm run lint`;
- `npm run test`: 10 files, 57 tests;
- `npm run test:e2e`: 5 Chromium tests;
- `npm run worker:build`: successful OpenNext Cloudflare bundle.

The Worker build emits a duplicate `options` key warning inside a generated OpenNext dependency bundle. The build completes successfully; no authored DeskOps source contains that duplicate.

Visual QA covered the landing page and the final studio-style login in desktop light, desktop dark, authentication-error and phone states. Authenticated production data was not used for visual QA because the new production schema has not been applied.

## Production reality

As checked on 18 July 2026:

- `https://deskops.sbs/` returns `307` to `/login`;
- the live login is the old minimal `Sign in to DeskOps` page;
- production is not serving the review branch;
- the configured Supabase REST API returns `404` for both `wellness_assessments` and `wellness_assessment_entries`;
- the local Supabase directory is not linked, so the migration cannot be safely applied with `supabase db push` until the exact target project is confirmed.

The production OpenAI secret/model configuration was not inspected and should remain treated as unknown until checked through the authorised Cloudflare secret workflow.

## Release blockers

### P0: schema before frontend

`20260718000001_wellness_assessments.sql` must be applied to the intended production Supabase project before deploying the review branch. The queue and callback read the new table, so a frontend-only deployment risks breaking authenticated navigation.

### P0: explicit AI action protection

The ticket draft path reaches OpenAI only after an authenticated user's RLS-filtered streams are available, but the server-action boundary does not explicitly assert authentication. The invoice-polish action accepts a supplied draft and has no explicit authentication or application rate limiter. Before a public demo, add:

- an explicit authenticated-user check at both AI action boundaries;
- per-user and per-IP limits appropriate for Cloudflare;
- tests for unauthenticated and rate-limited requests;
- a clear user-facing retry response for `429` and transient model errors.

### P1: controlled promotion

After the schema and AI gate are ready:

1. rebuild from the exact release commit with the public Supabase variables present;
2. configure server-only OpenAI secrets without printing or committing them;
3. deploy the Cloudflare Worker;
4. smoke-test `/`, `/login`, OAuth callback, `/queue`, assessment save/history, AI draft and invoice polish;
5. merge or fast-forward `main` only when the live release is confirmed;
6. record the release commit and deployment time here.

## Known limitations, not blockers for planning

- Reminder cadence is stored but DeskOps does not send reminders.
- Companion tools are independent outbound links, not integrations.
- Invoice quantities default to one hour because persisted time tracking does not exist.
- The Rebalance agent described in the historical Build Week plans is not implemented.
- Nested Wellness areas, context tags, organisation workspaces, roles and client portals are not implemented.
- The old ticket-derived `life_domain` Wheel calculation remains in historical code/tests but is no longer presented as a personal wellness score.
- The correct core-build Codex session ID is still not recorded; the repository currently records the sanitised rebuild session.
- A demo video and final Devpost status are not recorded in this repository.

## Decisions for the next planning loop

Fabel should help choose and sequence these outcomes rather than treating every historical checkbox as active:

1. **Release-first:** secure the AI actions, apply the migration and deploy the redesign safely.
2. **Differentiation-first:** design and build the one-suggestion Rebalance agent after the security gate.
3. **Platform-first:** design the owning-workspace, membership and client-portal model before adding collaboration UI.
4. **Submission-first:** close the session-ID, demo-video, live-demo and Devpost evidence gaps.

Recommended default: release-first, then choose exactly one of the other three tracks for the next bounded loop.

## Guardrails for an autonomous loop

- Work only from the canonical clone and the named working branch.
- Fetch before starting and never force-push.
- Preserve unrelated user files and real personal data boundaries.
- Do not deploy, migrate production, change secrets or submit external forms without explicit human approval.
- Never print, inspect broadly or commit secrets.
- Use one bounded objective per loop, with acceptance criteria written before implementation.
- Keep AI writes draft-only and preserve the human approval boundary.
- Run typecheck, lint, unit tests, relevant browser tests and the Worker build before pushing a release candidate.
- Commit intentionally and update this SITREP when a blocker, branch, production or verification state changes.

## Copy-paste brief for Fabel

> Read `PRODUCT.md`, `DESIGN.md`, `docs/SITREP.md`, `docs/frontend-redesign-plan.md`, and the historical `WINNING-PLAN.md` and `NEMO-EXECUTION-PLAN.md`. Produce a concise two-part plan: **Where DeskOps is now** and **Where DeskOps should be next**. Reconcile the implemented private Wellness assessment with the unimplemented Rebalance and workspace ideas. Prioritise a safe release, name dependencies and explicit human approvals, define measurable exit criteria, and propose a bounded autonomous loop for Codex. Do not implement, deploy, migrate, change secrets or submit anything during the planning pass.

## Next human decision

Confirm which Supabase project and Cloudflare Worker are the intended production targets, then choose whether the next loop begins with the release-first track or remains planning-only.
