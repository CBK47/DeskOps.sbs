# DeskOps controlled release checklist

Run these human-controlled steps in order. Do not deploy the review branch before the Wellness schema exists in the intended production project.

1. **Confirm both production targets.** Supabase production is project `deskops`, reference `szcflutkshtuzpvfdvae`, in organisation `wtmuymqjtztzrwgrwknf`. Cloudflare source configuration targets Worker `deskops` and the `deskops.sbs` custom domain. Confirm the authenticated Cloudflare account before deployment and stop if it is not the intended account.
2. **Apply the Wellness schema.** Against the confirmed Supabase project, apply `supabase/migrations/20260718000001_wellness_assessments.sql`. Confirm the two Wellness tables, their row-level security policies and the two assessment functions exist for that project.
3. **Configure public authentication.** Keep Google enabled. Enable GitHub using a GitHub OAuth app whose callback is `https://szcflutkshtuzpvfdvae.supabase.co/auth/v1/callback`. Enable email magic links with production SMTP and confirm `https://deskops.sbs/auth/callback` is in the redirect allow list. Do not create or publish a shared demo password.
4. **Set the model secrets through the authorised workflow.** Configure `OPENAI_API_KEY` and `OPENAI_MODEL` for the confirmed Worker without printing or committing either value. Keep invoice flags unset or `false` for the public product.
5. **Build the exact release commit.** From a clean checkout of the chosen review-branch commit, provide the public Supabase URL and anonymous key at build time. Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run worker:build`, and `npx wrangler deploy --dry-run` from `frontend/`. A red gate stops the release.
6. **Deploy the built Worker.** Deploy that exact commit to the confirmed Cloudflare Worker. Confirm Wrangler creates the SQLite-backed `AgentRateLimiter` export and binds `AGENT_RATE_LIMITER`, then verify the `deskops.sbs` route still points to Worker `deskops`. Do not change the custom-domain target as part of an unrelated account operation.
7. **Smoke-test production in sequence.** Verify `/`, `/login`, Google OAuth, GitHub OAuth, an email magic link, `/auth/callback`, `/auth/confirm`, `/queue`, **Set up demo workspace**, Wellness assessment save and history, natural-language AI ticket drafting, and Rebalance draft, edit, **Add ticket** and **Not now**. Confirm invoice UI is absent with the default-off flags.
8. **Promote source control only after the live checks pass.** Fast-forward `main` to the verified release commit. Do not rebase published history or force-push.
9. **Record the release.** Update `docs/SITREP.md` with the exact release commit, deployment time, confirmed targets and smoke-test result, then commit and push that evidence.

If a production smoke test fails, stop promotion, record the failing step and preserve the last known-good Worker deployment for recovery.
