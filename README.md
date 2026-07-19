# DeskOps.sbs

**A personal operations desk for the things life keeps throwing at you.**

DeskOps brings the clarity of a service desk to life admin. Capture a task once, assign it to the right stream, prioritise it, and work from one calm, filterable queue instead of a pile of scattered notes, reminders, and messages.

DeskOps is an open-source entry for OpenAI Build Week in **Apps for Your Life**. It combines a GPT-5.6 draft agent with a private Wellness Wheel while keeping every decision with the person using it.

**Project domain:** [deskops.sbs](https://deskops.sbs)

## What works today

- One queue across personal, household, project, and client streams
- Fast capture from anywhere in the app
- Priority, due-date, status, recurrence, and stream filters
- Recurring tickets that retain their monthly or yearly anchor date
- Google, GitHub and email magic-link sign-in with per-user data isolation and row-level security
- Installable web-app metadata with light and dark themes
- A private, skippable Wellness Wheel across eight Dimensions of Wellness
- Dated assessment history with user-chosen focus and reminder preferences
- A public `/demo` sandbox with six clearly simulated agents, synthetic streams and browser-local approval
- Natural-language ticket drafting with GPT-5.6, always editable and saved only by the user
- One calm Rebalance suggestion chosen deterministically from the latest tracked Wellness gap, then drafted as one editable ticket

## Stack

- Next.js 15, React 18, TypeScript, Tailwind CSS, and Base UI/shadcn components
- Supabase for Postgres, authentication, and row-level security
- Cloudflare Workers through OpenNext for deployment
- Vitest and Playwright for testing

## Run it locally

### Private one-computer setup

The quickest self-hosted option runs DeskOps, its database, authentication and a login-email inbox on your own computer. It does not require a Supabase account or project:

```bash
git clone https://github.com/CBK47/DeskOps.sbs.git
cd DeskOps.sbs
npm install
npm run self-host
```

Docker Desktop or OrbStack must be running. The launcher prints the local app and login-inbox addresses; use email sign-in and open the captured magic link locally. App data stays in local Docker volumes, services bind only to `127.0.0.1`, and external AI is off by default.

See [docs/SELF-HOSTING.md](docs/SELF-HOSTING.md) for backups, shutdown, optional AI and the boundary between private local use and a public production deployment.

### Managed Supabase development

### Prerequisites

- Node.js 22 or newer
- A Supabase project with the authentication providers you intend to expose configured
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

Invoice drafting remains available as a personal-mode extra and is hidden by default. Set both `ENABLE_INVOICES=true` and `NEXT_PUBLIC_ENABLE_INVOICES=true` locally to restore it.

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

### Authentication providers

DeskOps supports Google, GitHub and passwordless email. Social providers still need to be enabled in the Supabase project before their buttons are exposed to users.

- Add `https://deskops.sbs/auth/callback` to the Supabase redirect allow list.
- For GitHub, create an OAuth app whose authorisation callback is `https://<project-ref>.supabase.co/auth/v1/callback`, then add its client ID and secret to the Supabase GitHub provider.
- For magic links, enable the Supabase email provider and production SMTP. The default PKCE confirmation URL returns to `/auth/callback`. If you use a token-hash email template, point it to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`.

Do not publish a shared username and password. Each judge or tester should authenticate separately, then use **Set up demo workspace** to create isolated generic sample data.

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

The first deployment of this release also provisions the SQLite-backed `AgentRateLimiter` Durable Object declared in `frontend/wrangler.jsonc`. DeskOps addresses one object per authenticated user, so AI limits are atomic across Worker isolates without concentrating all users in one object.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local development server |
| `npm run self-host` | Run DeskOps with a private local Supabase stack |
| `npm run self-host:backup` | Export local self-hosted table data to an ignored backup file |
| `npm run self-host:stop` | Stop local Supabase services without deleting their data |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run verify` | Run the complete local release gate |
| `npm run build` | Create a production build |
| `npm run worker:build` | Build the Cloudflare Worker with OpenNext |
| `npm run worker:preview` | Build and preview the Worker locally |
| `npm run worker:deploy` | Build and deploy the Worker to Cloudflare |
| `npm run seed:personal` | Apply an optional Git-ignored personal stream seed to the linked Supabase project |

## Architecture

- `frontend/` contains the complete Next.js application, tests, installable web-app metadata, and Cloudflare configuration.
- `frontend/app/(app)/` contains authenticated product routes.
- `frontend/app/(auth)/` contains sign-in and callback routes.
- `frontend/app/actions/` holds server actions for tickets and streams.
- `frontend/components/` holds the product UI.
- `frontend/lib/db/` contains typed Supabase access helpers.
- `frontend/lib/agent/` contains the draft-only AI boundary and its production Durable Object limiter.
- `scripts/self-host.mjs` injects local-only Supabase credentials into the development process.
- `supabase/migrations/` is the source of truth for the database schema.
- `personal.example/` contains safe templates; `personal/` is ignored for private local customisation.

The root package is an npm workspace orchestrator, so the documented `npm run ...` commands work from the repository root. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the public system map and [docs/PERSONAL.md](docs/PERSONAL.md) before adding local personal data.

## OpenAI configuration

`OPENAI_API_KEY` and `OPENAI_MODEL` are server-only variables. The Build Week configuration uses `OPENAI_MODEL=gpt-5.6`, the current GPT-5.6 alias. DeskOps sends natural-language ticket text to the Responses API with `store: false`.

AI never writes tickets or takes an external action. It only produces a draft for the signed-in user to review.

Production AI calls are limited per authenticated user through a SQLite-backed Cloudflare Durable Object. Local Next.js development and unit tests use an in-process fallback because OpenNext does not expose Worker-owned Durable Objects to `next dev`.

### Public demo agents

`/demo` is a no-sign-in, synthetic sandbox for Build Week reviewers. It does not use a shared account, Supabase data, external tools, credentials or a live model provider. Six named roles are provider-neutral simulated personas, and every proposal requires an explicit local approval before it enters the browser-only queue.

The public demo has a separate global Durable Object budget, event window, per-browser daily allowance, concurrency ceiling, timeout and kill switch. Its operational runbook is intentionally maintained privately.

## Build Week build

The demo focuses on this end-to-end flow:

1. A user types or speaks a messy life-admin brain dump.
2. An AI assistant proposes tasks, deadlines and priorities for review.
3. The person may separately record a private Wellness Wheel snapshot and choose their own focus.
4. Rebalance selects one tracked gap deterministically and GPT-5.6 drafts one small step that the person may edit, add or dismiss.

The public demo seed is deliberately generic. Do not commit or display real personal, client, health, or financial data.

See [HACKATHON.md](HACKATHON.md) for the Build Week scope and prior-work boundary.

## Built with Codex

DeskOps is created by CBK47 with OpenAI Codex and GPT-5.6 for OpenAI Build Week. Codex accelerated the architecture, database migrations, deterministic tests, product UI, security review, repository rebuild, and documentation. The repository history preserves the sanitised prior-work boundary followed by the Build Week feature commits.

The dated evidence boundary is explicit: `5e6ed8d` is the sanitised import of the pre-existing DeskOps MVP on 16 July 2026. Submission-period work begins with `d840cc2` and every later commit. On 18 July 2026, a bounded Codex improvement loop added the AI action gate (`1b87a61`), made invoice tooling personal-only (`bf816ef`), reduced AI tickets to one human decision (`f8bc359`), and delivered Rebalance V1 (`fbff318`). Each task passed the full test and Worker-build gates before it was pushed.

The public repository preserves the sanitised prior-work boundary and source history. Internal release records, deployment details and working plans are deliberately maintained outside the public repository.

Ideas, issue reports, and early contributors are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security and privacy

DeskOps stores personal task data. Never commit `.env.local`, Supabase service-role keys, Cloudflare API tokens, or real user data. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Licence

DeskOps is released under the [MIT License](LICENSE).
