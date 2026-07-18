# DeskOps.sbs

**A personal operations desk for the things life keeps throwing at you.**

DeskOps brings the clarity of a service desk to life admin. Capture a task once, assign it to the right stream, prioritise it, and work from one calm, filterable queue instead of a pile of scattered notes, reminders, and messages.

DeskOps is an open-source entry for OpenAI Build Week in **Apps for Your Life**. It combines a GPT-5.6 draft agent, a private Wellness Wheel, and review-only invoice drafts for Occupational work.

**Project domain:** [deskops.sbs](https://deskops.sbs)

## What works today

- One queue across personal, household, project, and client streams
- Fast capture from anywhere in the app
- Priority, due-date, status, recurrence, and stream filters
- Recurring tickets that retain their monthly or yearly anchor date
- Google sign-in, per-user data isolation, and row-level security
- Installable PWA with light and dark themes
- A private, skippable Wellness Wheel across eight Dimensions of Wellness
- Dated assessment history with user-chosen focus and reminder preferences
- Natural-language ticket drafting with GPT-5.6, always reviewed before saving
- Review-only Occupational invoice drafts with deterministic itemised totals

## Stack

- Next.js 15, React 18, TypeScript, Tailwind CSS, and Base UI/shadcn components
- Supabase for Postgres, authentication, and row-level security
- Cloudflare Workers through OpenNext for deployment
- Vitest and Playwright for testing

## Run it locally

### Prerequisites

- Node.js 22 or newer
- A Supabase project with Google OAuth configured
- Supabase CLI, only if you want to apply migrations locally

### Setup

```bash
git clone https://github.com/CBK47/DeskOps.sbs.git
cd DeskOps.sbs
npm install
cp frontend/.env.example frontend/.env.local
```

Add your Supabase project values and server-only OpenAI key to `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_MODEL=gpt-5.6
```

Apply the database schema to a linked Supabase project, then generate the typed database client:

```bash
supabase link --project-ref <project-ref>
supabase db push
npm run gen:types
```

Start the app:

```bash
npm run dev
```

Open http://localhost:3000.

### Optional Supabase keepalive worker

The scheduled worker in `frontend/keepalive/` is optional. It has no project-specific values in source control. If you use it, configure the target project in Cloudflare before deployment:

```bash
cd frontend/keepalive
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler deploy
```

Use the generic `frontend/keepalive/.dev.vars.example` only as a local template. The worker never needs a Supabase service-role key.

### Deploy the app to Cloudflare Workers

The public Supabase URL and anon key must be present in `frontend/.env.local` **when the Next.js build runs**. They are browser-visible by design and are compiled into the client bundle. Worker runtime secrets alone cannot supply `NEXT_PUBLIC_*` values to a browser after deployment.

Keep the server-only values as Cloudflare Worker secrets:

```bash
cd frontend
wrangler secret put OPENAI_API_KEY
wrangler secret put OPENAI_MODEL
npm run worker:deploy
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may also be set as Worker secrets for server-side runtime access, but that does not replace their build-time values in `frontend/.env.local`.

The custom-domain binding for `deskops.sbs` is intentionally a separate Cloudflare account step.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local development server |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run build` | Create a production build |
| `npm run worker:build` | Build the Cloudflare Worker with OpenNext |
| `npm run worker:preview` | Build and preview the Worker locally |
| `npm run worker:deploy` | Build and deploy the Worker to Cloudflare |
| `npm run seed:personal` | Apply an optional Git-ignored personal stream seed to the linked Supabase project |

## Architecture

- `frontend/` contains the complete Next.js application, tests, PWA assets, and Cloudflare configuration.
- `frontend/app/(app)/` contains authenticated product routes.
- `frontend/app/(auth)/` contains sign-in and callback routes.
- `frontend/app/actions/` holds server actions for tickets and streams.
- `frontend/components/` holds the product UI.
- `frontend/lib/db/` contains typed Supabase access helpers.
- `supabase/migrations/` is the source of truth for the database schema.
- `personal.example/` contains safe templates; `personal/` is ignored for private local customisation.

The root package is an npm workspace orchestrator, so the documented `npm run ...` commands work from the repository root. See [docs/PERSONAL.md](docs/PERSONAL.md) before adding local personal data.

## OpenAI configuration

`OPENAI_API_KEY` and `OPENAI_MODEL` are server-only variables. The Build Week configuration uses `OPENAI_MODEL=gpt-5.6`, the current GPT-5.6 alias. DeskOps sends natural-language ticket text and optional invoice copy to the Responses API with `store: false`.

AI never writes tickets, sends invoices, or changes financial totals. It only produces a draft for the signed-in user to review.

## Build Week build

The demo focuses on this end-to-end flow:

1. A user types or speaks a messy life-admin brain dump.
2. An AI assistant proposes tasks, deadlines and priorities for review.
3. The person may separately record a private Wellness Wheel snapshot and choose their own focus.
4. Work items can be associated with a client and converted into a reviewable invoice draft.

The public demo seed is deliberately generic. Do not commit or display real personal, client, health, or financial data.

See [HACKATHON.md](HACKATHON.md) for the Build Week scope, prior-work boundary, and submission checklist.

## Built with Codex

DeskOps is created by CBK47 with OpenAI Codex and GPT-5.6 for OpenAI Build Week. Codex accelerated the architecture, database migrations, deterministic tests, product UI, security review, repository rebuild, and documentation. The repository history preserves the sanitised prior-work boundary followed by the Build Week feature commits.

This public repository rebuild was completed in Codex session `019f6cac-1f8d-7111-a538-a0f0171070d5`. See [HACKATHON.md](HACKATHON.md) for the submission record and [docs/REBUILD.md](docs/REBUILD.md) for the repository arrangement.

Ideas, issue reports, and early contributors are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security and privacy

DeskOps stores personal task data. Never commit `.env.local`, Supabase service-role keys, Cloudflare API tokens, or real user data. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Licence

DeskOps is released under the [MIT License](LICENSE).
