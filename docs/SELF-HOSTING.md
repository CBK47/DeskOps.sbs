# Self-host DeskOps on one computer

This is the quickest private DeskOps setup: the app, Postgres database, authentication and login-email inbox all run on your own computer. It uses the same Supabase schema and row-level security as the hosted version, without connecting to the managed DeskOps Supabase project.

This local mode is intended for personal use, evaluation and development. It is not a hardened public internet deployment.

## Start it

Install:

- Node.js 22 or newer
- Docker Desktop or OrbStack, with at least 4 GB of memory available

Then run:

```bash
git clone https://github.com/CBK47/DeskOps.sbs.git
cd DeskOps.sbs
npm install
npm run self-host
```

The first start downloads Supabase containers, creates a localhost-only Docker network, applies every migration in `supabase/migrations/`, and starts DeskOps at [http://localhost:3000](http://localhost:3000). Later starts reuse the same local data. After signing in, choose **Set up demo workspace** if you want generic sample streams and tickets.

The launcher also prints the local login-inbox address:

- **Login email** is a local inbox. Enter any email-shaped address on the DeskOps login screen, open the captured message there, and follow its magic link. No login email is delivered over the internet.

Press `Ctrl+C` to stop the DeskOps web server. Supabase remains available so the next start is quick, and its Docker volumes keep your data.

## Stop or back up the local data

```bash
npm run self-host:backup
npm run self-host:stop
```

The backup command exports table data to `backups/deskops-data.sql`. The directory is ignored by Git; store a copy somewhere protected if it matters to you. The stop command retains the Docker data volumes.

Do not use `supabase stop --no-backup` or `supabase db reset` unless you deliberately want to delete or rebuild the local data.

## AI is opt-in

External AI is disabled in self-host mode by default. Queue, streams, Wellness and the simulated public demo work without an API key.

To use OpenAI ticket drafting, provide a separate opt-in key in your shell before starting:

```bash
export DESKOPS_SELF_HOST_OPENAI_API_KEY="your-key"
export DESKOPS_SELF_HOST_OPENAI_MODEL="gpt-5.6"
npm run self-host
```

Only AI draft requests leave the computer in this mode. DeskOps still requires the person to review and explicitly save every draft.

## What is and is not local

| Component | Local mode behavior |
| --- | --- |
| DeskOps app | Runs on `localhost:3000` |
| Tickets, streams and Wellness | Stored in local Postgres Docker volumes |
| Authentication | Handled by local Supabase Auth |
| Magic-link messages | Captured by the local email inbox |
| Demo agents | Simulated in the browser; no model or external tools |
| OpenAI drafting | Off unless explicitly enabled |
| Google and GitHub login | Not configured; local email is the zero-setup option |

The app and local service ports bind to `127.0.0.1`, so other devices on the local network cannot connect. The launcher also omits Supabase services that DeskOps does not currently use, including Storage, Realtime and Studio, to reduce ongoing resource use. Developers can still start the full stack directly with `npx supabase start`.

## Public production self-hosting

Exposing a personal operations database to the internet requires TLS, SMTP, secret rotation, backups, monitoring, upgrades and network hardening. Use the [official Supabase Docker self-hosting guide](https://supabase.com/docs/guides/self-hosting/docker) as the starting point, and build the Next.js application against that deployment's public URL and browser-safe key.

Do not expose the CLI local-development ports directly to a public or untrusted network.
