# Frontend redesign implementation plan

## Direction

1. Establish the public surface at `/`, redesign `/login`, and move the authenticated queue to `/queue` without changing its ticket, stream, invoice, Supabase SSR, or Cloudflare architecture.
2. Add a calm, full-page Wellness Wheel assessment and history experience. Store it in new, additive tables so the existing queue-derived `life_domain` taxonomy and historical stream records remain unchanged.
3. Upgrade the signed-in shell, queue, capture, filters, empty/loading/error states, mobile navigation, Wheel legibility, and the Occupational-to-invoice path using the existing Tailwind and component stack.
4. Add restrained transform/opacity motion, richer reveal motion only on the public page, visible focus states, semantic landmarks, and reduced-motion fallbacks.
5. Update unit and end-to-end coverage, then run lint, typecheck, unit tests, relevant Playwright tests, the Next.js production build, and the OpenNext Worker build.

## Route, auth, migration and compatibility risks

- **Route change:** the current authenticated queue owns `/`. It will move to `/queue`; every queue filter, Wheel link, mutation redirect, navigation link, error recovery link, OAuth callback and test must be updated together. `/` becomes public and must not be wrapped by the authenticated app layout.
- **Authentication:** Google OAuth and `/auth/callback` remain unchanged apart from the post-login destination. Middleware must allow `/`, `/login`, `/auth/*`, legal pages and static assets while continuing to protect `/queue`, `/wellness`, `/streams`, `/tickets/*` and `/invoices/*`. Signed-in users may still view the public page deliberately.
- **First run:** the callback may route new users to the skippable assessment only after the schema is available. A recorded `skipped` or `completed` assessment prevents repeated first-run prompts; retakes remain available from the app.
- **Migration:** new wellness enums and tables are additive. No existing enum value, stream, ticket, `life_domain`, seed or foreign key is renamed, overwritten or inferred into the new model. The migration must be applied before code that reads the new tables is deployed.
- **RLS:** assessments and entries carry `user_id`, default to `auth.uid()`, and receive per-operation RLS policies. Entry writes also validate that the parent assessment belongs to the same authenticated user. Historical records are append-only from the UI; a retake inserts a new assessment instead of overwriting old answers.
- **Backward compatibility:** the old queue-health Wheel calculation remains valid for historical code/tests but is no longer presented as a personal wellness score. Existing `career` streams continue to qualify for review-only invoice drafts and are described as a legacy Occupational mapping; no existing user data is silently reclassified.
- **External tools:** companion projects are typed ordinary links only. No assessment values leave DeskOps, and no OAuth, API key, compatibility or affiliation claim is introduced.
- **Rollback:** the public route and UI can be reverted independently. The additive wellness tables may safely remain unused; dropping them would be a separate destructive migration and is not part of this work.

