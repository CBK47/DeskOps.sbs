# DeskOps — Build Week Winning Plan (solo, 4 days out)

> **Historical planning input, not the current roadmap.** The repository now contains the Wellness assessment, public landing page, focused login, product redesign, MIT licence and generic demo seed described as future work below. Start with [`docs/SITREP.md`](docs/SITREP.md) before using any remaining idea from this document.

> **For Codex:** Execute Part A (must-submit) first, then Part B in ROI order. Save GPT-5.6 for the cited core (the two agent features); use smaller/cheaper models for scaffolding and throwaway. Commit after every task so a rate-limit never costs progress. Keep this thread's Session ID — the NL + Rebalance agents are the "built with 5.6" story.

## Where we are

Halfway. Build is genuinely ahead: clean public repo (`CBK47/DeskOps.sbs`, CBK47 identity, history preserved), Wheel of Life, GPT-5.6 NL tickets, Career invoice drafts, human-in-the-loop safety, tests. The risk is the **wrapper** — deploy-with-working-AI, video, Devpost — which is where solo entries lose on the final night. Solo submission (no Jon on Devpost).

## The bet — why this wins

Positioning: **"Every productivity app makes you busier. DeskOps is the first that shows you when to stop and rebalance."** It is life-admin as one intelligent queue *plus* a live Wheel of Life that makes imbalance visible — and (Part B) an agent that acts on it. That anti-busywork framing is sharp, emotional, and on-theme for "Apps for Your Life".

## Judging criteria → what moves each

| Criterion | Current strength | The lever |
|---|---|---|
| **Technological Implementation** | GPT-5.6 Responses API, structured outputs, RLS, human-in-loop | Add the **Rebalance** agent (reasons over whole-life state) — deepest 5.6 use in the app |
| **Design** | Wheel exists | Make the Wheel the **hero**; light/dark + motion + a11y polish; story-driven demo data |
| **Potential Impact** | "see your balance" | Rebalance turns seeing into *doing* — the wellbeing payoff |
| **Quality of the Idea** | good one-liner | The anti-busywork positioning, said crisply in your own voice |

---

## Part A — Critical path to a valid, strong submission (do first)

- [ ] **A1. Deploy live with WORKING AI on `deskops.sbs`.** Add `OPENAI_API_KEY` (free GPT-5.6 Terra tier) + `OPENAI_MODEL=gpt-5.6` to Cloudflare. Point the `deskops.sbs` domain at the Pages/Workers deployment. The demo MUST show the agent actually responding on the live URL — verify the full round-trip on the real domain, not localhost.
- [ ] **A2. Rate-limit + auth the invoice-polish (and NL) AI endpoints** before it's publicly testable — an open GPT endpoint on a public app is bill-run-up bait (flagged by the earlier GIT-Committer review). Per-user + per-IP cap, reject unauthenticated.
- [ ] **A3. Add `LICENSE` (MIT).** Repo currently shows no license; rules require one for public repos.
- [ ] **A4. Cite the correct `/feedback` Session ID.** `HACKATHON.md` currently records the *rebuild* session (`019f6cac…`). The rules want the thread where **core functionality** was built (the overnight Wheel/agent/invoice session). Retrieve and cite that one; keep the rebuild ID as a secondary note.
- [ ] **A5. Start the Devpost entry NOW** (editable until the deadline). Use the Devpost Hackathons plugin in Codex. Solo — no teammates to invite.
- [ ] **A6. Write the project description + demo notes in YOUR OWN VOICE.** Judges explicitly flag AI-written descriptions. AI-assisted README is fine; the pitch is yours.
- [ ] **A7. Record the 3-min demo video** (Part C), public on YouTube. AI voiceover is explicitly allowed — write the script, run it through a voice tool.

## Part B — Winner improvements (high ROI, scope-fenced)

- [ ] **B1. ⭐ Rebalance — the differentiator.** A "Rebalance" action on the dashboard: GPT-5.6 reads the Wheel scores + recent tickets across domains and returns (a) the single most out-of-balance domain, (b) a one-line "why", (c) ONE concrete suggested action → drafts a ticket in that domain. Reuse `lib/wheel` (scores), `lib/agent` (client), and the existing human-in-the-loop draft-review flow — suggestion only, user approves, nothing auto-writes. *This is the emotional payoff of the Wheel and the deepest 5.6 use — build it, cite it.* Guardrail: one suggestion, one action, read-only until approved.
- [ ] **B2. Wheel as hero + polish.** Make the Wheel the first thing you see, large and legible. Smooth segment transitions (reduced-motion aware), clear grey states for empty domains, click-to-filter already works — keep it. Light + dark both immaculate.
- [ ] **B3. Story-driven demo seed.** Seed a believable imbalanced life (Career high, Health/Friends low, a couple overdue items) so the Wheel *visibly* leans and Rebalance has something real to say. Generic names only — the demo person is not you.
- [ ] **B4. 30-second onboarding / empty-to-wow.** First sign-in → one click "Set up demo workspace" → populated Wheel + queue immediately. No blank first screen.
- [ ] **B5. Accessibility + copy pass.** Keyboard nav, ARIA on the Wheel, UK English, no em dashes, no AI-tell phrasing.

## Part C — Demo video script (3:00, beat by beat)

- **0:00–0:20 Hook.** On the Wheel (visibly imbalanced): "Every productivity app makes you busier. DeskOps is the first that tells you when to stop." One screen, your whole life.
- **0:20–0:50 The queue.** Life admin as one intelligent queue; streams = life domains.
- **0:50–1:30 NL agent.** Type `renew the van insurance next Friday, high priority` → GPT-5.6 drafts the ticket → you edit if useful → choose **Add ticket** once. Stress the human-in-the-loop.
- **1:30–2:15 ⭐ Rebalance.** "It doesn't just show your life — it notices." Click Rebalance → "Health is slipping, nothing closed in 3 weeks — here's a 20-minute walk to restart." → approve → Wheel updates live.
- **2:15–2:40 Invoice.** Close two Career tickets → Draft invoice → deterministic line items, GPT-5.6 polishes copy only. "It even bills for the work."
- **2:40–3:00 Close.** "Built solo in a week with Codex and GPT-5.6." Impact line + `deskops.sbs`.

## Part D — README + Devpost copy

- README: keep the Codex-collaboration section; add where 5.6 does the heavy lifting (NL parse + Rebalance reasoning) and the key human decisions. Setup instructions must let a judge run it. Accurate to what's actually built.
- Devpost description: your voice; lead with the anti-busywork idea, then the 3 features, then the impact. Do not paste AI output.

## Codex usage strategy (free GPT-5.6 Terra tier)

- Save 5.6 for B1 (Rebalance) + the NL agent — the parts you cite.
- Scaffolding, tests, copy tweaks → smaller/cheaper models.
- Batch sessions; don't leave idle. Commit after every task.

## Scope fence — do NOT build (keeps 4 days sane)

Persisted/PDF invoices, digest emails, multi-user/household, recurrence intelligence, home-assistant/chore automation, a Wheel questionnaire. All README "roadmap".

## 4-day timeline

- **Thu (today):** A1 deploy+working AI, A2 rate-limit, A3 LICENSE, A5 start Devpost. B3 demo seed.
- **Fri:** B1 Rebalance (the win feature) + B2 Wheel polish. A4 Session ID.
- **Sat:** B4 onboarding, B5 a11y/copy. Draft A6 description. Rehearse demo.
- **Sun:** A7 record + edit video. Final Devpost fill. Buffer.
- **Mon (deadline 5pm PT / ~1am Tue UK):** verify live, submit with hours to spare — not minutes.

## Definition of done

Live `deskops.sbs` with working AI · MIT license · correct core Session ID cited · Devpost submitted (description in your voice) · 3-min YouTube video · Rebalance shipped · Wheel is the hero · repo clean and public.
