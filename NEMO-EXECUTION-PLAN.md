# NEMO Execution Plan — DeskOps Build Week (autonomous, systematic)

> **Historical planning input, not an active execution plan.** This file predates the implemented Wellness assessment and the 18 July frontend redesign. Several tasks and scope decisions are now stale or contradictory. Start with [`docs/SITREP.md`](docs/SITREP.md) and use this file only to recover earlier hackathon ideas.

> **For Nemo (opencode/Nemotron):** Work top to bottom. Commit after EVERY task. On a transient infra error, follow the Runbook and CONTINUE — never stop and wait. Keep the Wellness Wheel PARKED (see §1). Verify on `next dev` or a live URL, never on a proxy. Companion strategy doc: `WINNING-PLAN.md`.

## §0 Prime directives

1. **Never halt on a known transient error.** Consult §4 Runbook, auto-recover, keep going.
2. **Commit after every task** (`git commit`), so a rate-limit/reset never costs progress.
3. **One source of truth.** Confirm you are in the canonical clone with `git remote get-url origin` → must be `…/DeskOps.sbs.git`. If two clones exist, STOP and ask which is canonical — do not push from a second copy.
4. **Verify real behaviour.** `next dev` for iteration; a deployed preview URL for "does it work live". Not line-counts, not "build passed".
5. **Save GPT-5.6 for the cited core** (NL agent + Rebalance). Scaffolding/copy/tests → smaller models.

## §1 Wellness Wheel = PARKED (v2, do NOT build this sprint)

Decision (PM-confirmed): the "8 Dimensions of Wellness" redesign in `docs/frontend-redesign-plan.md` is **v2, not now.** It removes the derived-from-ticket-data intelligence and contradicts the Rebalance feature that wins the entry.

- **Do NOT** create `wellness_dimensions` / `wellness_sub_areas` tables, the status enum, the optional questionnaire, nested-occupational UI, or the `/wheel → /wellness` rename.
- **DO** fold ONE idea in cheaply: the philosophy **"scores are observations, not instructions — no guilt."** Apply it as copy/tone on the existing Wheel and in Rebalance (it suggests, never forces; the user always approves). Free, on-brand, keeps the win feature intact.

## §2 Dev & verification strategy (kills the wrangler 32-req limit)

- **Default to `next dev`** (Node runtime, NO request cap) for all iterative build/verify. This is where you spend 95% of the time.
- **Never run bare `wrangler dev`.** If you need the Cloudflare Workers runtime, use the wrapper `wrangler-dev` (defaults to `--remote`, no local cap) or a real preview deploy.
- **For "is it live" checks:** deploy a preview and `curl`/browse the URL — the edge has no 32-cap.
- **Audit for self-referential fetches** (middleware/route/handler calling `fetch()` on its own origin). Those burn the local budget in seconds — add an `x-internal` header guard or remove the loop.

## §3 Execution tasks (ordered; each ends with a commit)

### Critical path (must-submit — do first)
- [ ] **T1. Deploy live with WORKING AI.** Add `OPENAI_API_KEY` (free GPT-5.6 Terra) + `OPENAI_MODEL=gpt-5.6` to Cloudflare. Point `deskops.sbs` at the deployment. **Verify** the NL agent responds on the real domain (not localhost). Commit config/docs.
- [ ] **T2. Rate-limit + auth the AI endpoints** (NL + invoice-polish). Per-user + per-IP cap; reject unauthenticated. Reason: open GPT endpoint on a public app = bill-run-up (GIT-Committer review flagged it). Add a unit test for the limiter. Commit.
- [ ] **T3. Add `LICENSE` (MIT).** Rules require it for public repos. Commit.
- [ ] **T4. Fix the cited Session ID.** `HACKATHON.md` records the *rebuild* session; the rules want the thread where CORE functionality (Wheel/agent/invoice) was built. Cite that; keep rebuild ID as a secondary note. Commit.
- [ ] **T5. Story-driven demo seed.** Seed a believable imbalanced life (Career high; Health/Friends low; a few overdue) so the Wheel visibly leans and Rebalance has something real to say. Generic names only. Commit.

### Winner feature
- [ ] **T6. ⭐ Rebalance agent.** Dashboard action: GPT-5.6 reads Wheel scores + recent tickets → returns the single most out-of-balance domain, a one-line why, and ONE suggested action → drafts a ticket via the EXISTING human-in-the-loop review flow (suggestion only; user approves; nothing auto-writes). Reuse `lib/wheel` + `lib/agent`. TDD the deterministic glue (domain selection, fallback) with the model mocked. Commit.

### Polish (only after the above)
- [ ] **T7. Wheel as hero** — large, legible, first thing you see; smooth reduced-motion transitions; grey empty states. Read `DESIGN.md` first. Commit.
- [ ] **T8. Onboarding** — first sign-in → one-click demo workspace → populated Wheel + queue. No blank first screen. Commit.
- [ ] **T9. a11y + copy pass** — keyboard nav, ARIA on the Wheel, UK English, no em dashes, "observations not guilt" tone. Commit.

## §4 Resilience Runbook (auto-recover, do NOT stop)

| Symptom | Cause | Auto-recovery (then continue) |
|---|---|---|
| `ResourceExhausted: Worker local total request limit reached (n/32)` | `wrangler dev` local `workerd` 32-req cap | Kill the dev server, relaunch a fresh instance (resets count). Prefer `next dev`. If CF runtime needed, `wrangler-dev --remote`. Never wait for a human. |
| Repeated 429/5xx from OpenAI | free-tier rate limit / model busy | Exponential backoff (2s,4s,8s), then retry; if still failing, skip that verify and log it, keep building other tasks. |
| `next build` / typecheck fails | real code error | Read the error, fix it, re-run the gate (`typecheck && lint && test && build`). Do not push a red build. |
| `git push` rejected (non-fast-forward) | the OTHER agent/clone pushed | STOP pushing. Fetch, inspect divergence, reconcile — never force-push. This is the two-clone risk (§0.3). |
| dev server unresponsive | stale worker/process | Restart it; if a port is stuck, pick a fresh port. |

## §5 Definition of done

Live `deskops.sbs` with working AI · rate-limited endpoints · MIT license · correct core Session ID cited · Rebalance shipped · story demo seed · Wheel is the hero · all gates green (`typecheck && lint && test && build`) · Devpost entry started · repo clean, single canonical clone.
