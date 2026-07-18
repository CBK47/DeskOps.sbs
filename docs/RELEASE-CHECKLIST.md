# DeskOps controlled release checklist

Run these human-controlled steps in order. Do not deploy the review branch before the Wellness schema exists in the intended production project.

1. **Confirm both production targets.** Record the exact Supabase project reference and the exact Cloudflare account, Worker and `deskops.sbs` custom-domain target. Stop if either target is ambiguous.
2. **Apply the Wellness schema.** Against the confirmed Supabase project, apply `supabase/migrations/20260718000001_wellness_assessments.sql`. Confirm the two Wellness tables, their row-level security policies and the two assessment functions exist for that project.
3. **Set the model secrets through the authorised workflow.** Configure `OPENAI_API_KEY` and `OPENAI_MODEL` for the confirmed Worker without printing or committing either value. Keep invoice flags unset or `false` for the public product.
4. **Build the exact release commit.** From a clean checkout of the chosen review-branch commit, provide the public Supabase URL and anonymous key at build time. Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, and `npm run worker:build` from `frontend/`. A red gate stops the release.
5. **Deploy the built Worker.** Deploy that exact commit to the confirmed Cloudflare Worker and verify the `deskops.sbs` route still points to it. Do not change the custom-domain target as part of an unrelated account operation.
6. **Smoke-test production in sequence.** Verify `/`, `/login`, Google OAuth and `/auth/callback`, `/queue`, Wellness assessment save and history, natural-language AI ticket drafting, and Rebalance draft, edit, **Add ticket** and **Not now**. Confirm invoice UI is absent with the default-off flags.
7. **Promote source control only after the live checks pass.** Fast-forward `main` to the verified release commit. Do not rebase published history or force-push.
8. **Record the release.** Update `docs/SITREP.md` with the exact release commit, deployment time, confirmed targets and smoke-test result, then commit and push that evidence.

If a production smoke test fails, stop promotion, record the failing step and preserve the last known-good Worker deployment for recovery.
