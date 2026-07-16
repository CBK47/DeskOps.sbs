# DeskOps

**A personal operations desk for the things life keeps throwing at you.**

DeskOps brings the clarity of a service desk to life admin. Capture a task once, assign it to the right stream, prioritise it, and work from one calm, filterable queue instead of a pile of scattered notes, reminders, and messages.

This is the open-source foundation for our OpenAI Build Week entry in **Apps for Your Life**. The next phase adds natural-language triage, a live Wheel of Life, shared household and client streams, and invoice drafting for freelance work.

**Live app:** https://deskops.pages.dev

## What works today

- One queue across personal, household, project, and client streams
- Fast capture from anywhere in the app
- Priority, due-date, status, recurrence, and stream filters
- Recurring tickets that retain their monthly or yearly anchor date
- Google sign-in, per-user data isolation, and row-level security
- Installable PWA with light and dark themes

## Stack

- Next.js 14, React 18, TypeScript, Tailwind CSS, and shadcn/ui
- Supabase for Postgres, authentication, and row-level security
- Cloudflare Pages for deployment
- Vitest and Playwright for testing

## Run it locally

### Prerequisites

- Node.js 20 or newer
- A Supabase project with Google OAuth configured
- Supabase CLI, only if you want to apply migrations locally

### Setup

```bash
git clone https://github.com/CBK47/deskops.git
cd deskops
npm install
cp .env.example .env.local
```

Add your public Supabase project values to `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
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

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local development server |
| `npm run typecheck` | Run strict TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run build` | Create a production build |
| `npm run pages:build` | Build for Cloudflare Pages |
| `npm run pages:deploy` | Build and deploy to Cloudflare Pages |

## Architecture

- `app/(app)/` contains authenticated product routes.
- `app/(auth)/` contains sign-in and callback routes.
- `app/actions/` holds server actions for tickets and streams.
- `components/ticket/` and `components/stream/` hold the product UI.
- `lib/db/` contains typed Supabase access helpers.
- `supabase/migrations/` is the source of truth for the database schema.

## Build Week roadmap

DeskOps is being built in public for OpenAI Build Week. The hackathon demo focuses on this end-to-end flow:

1. A user types or speaks a messy life-admin brain dump.
2. An AI assistant identifies tasks, deadlines, priorities, and life domains.
3. DeskOps updates a single queue and a live Wheel of Life to reveal imbalance.
4. Work items can be associated with a client and converted into a reviewable invoice draft.

Ideas, issue reports, and early contributors are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security and privacy

DeskOps stores personal task data. Never commit `.env.local`, Supabase service-role keys, Cloudflare API tokens, or real user data. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Licence

DeskOps is released under the [MIT License](LICENSE).
