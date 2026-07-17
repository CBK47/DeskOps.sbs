# Public repository rebuild

DeskOps was rebuilt as a clean, shareable OpenAI Build Week repository with one canonical checkout and a clear application boundary.

## Canonical arrangement

- Public repository: `CBK47/DeskOps.sbs`
- Default branch: `main`
- Product domain: `deskops.sbs`
- Complete Next.js application: `frontend/`
- Database configuration and migrations: `supabase/`
- Safe public personalisation examples: `personal.example/`
- Private local personalisation: `personal/`, ignored by Git

The root `package.json` exposes the normal development, test, build, type-generation, and deployment commands through an npm workspace. Contributors can work from the repository root without changing into `frontend/`.

## History and identity

The rebuild preserves the sequence of prior-work and Build Week commits. Author and committer metadata is normalised to the GitHub maintainer identity, and stale personal identifiers are removed before publication. The former `CBK47/deskops` repository is retained privately as an archived backup and is not a second public source of truth.

## Codex record

OpenAI Codex helped inspect the architecture, assess move impact, preserve the final improvement, reorganise the frontend, add private personalisation support, run the quality and security gates, rebuild the history, and publish the new repository.

Rebuild session ID: `019f6cac-1f8d-7111-a538-a0f0171070d5`
