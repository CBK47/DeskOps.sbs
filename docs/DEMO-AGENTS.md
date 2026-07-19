# Public Demo Agents

DeskOps exposes `/demo` as a public, browser-scoped sandbox for the Build Week demonstration. It is intentionally not a shared account.

## What the public demo is

- Six named **simulated demo agents**: Echo, Skippy, Codex, Claude, Xiangwei and Spark.
- A provider-neutral registry with fixed capabilities and permitted synthetic streams.
- Deterministic, validated proposals. The demo does not call OpenAI or any named vendor.
- A browser-local synthetic queue. Approval changes only that browser's state and never writes a Supabase row.
- An HttpOnly cookie used only to group public requests for rate allowance. It is not a user identity and contains no personal data.

## What the public demo is not

- It is not a shared username/password or a real customer workspace.
- It cannot read Gmail, calendars, memory, credentials, repositories, local files or production systems.
- It does not access authenticated DeskOps data, and `/queue` remains protected by the normal Supabase session check.
- Agent names describe demo roles only. They do not represent a live integration with the named vendor or model.

## Production controls

`frontend/wrangler.jsonc` defines the default public-demo window and limits:

| Variable | Current value | Purpose |
| --- | --- | --- |
| `DEMO_AGENTS_ENABLED` | `true` | Enables public proposals. |
| `DEMO_AGENT_EVENT_START_AT` | `2026-07-19T00:00:00.000Z` | Start of the demo window. |
| `DEMO_AGENT_EVENT_END_AT` | `2026-08-02T23:59:59.999Z` | End of the demo window. |
| `DEMO_AGENT_USER_DAILY_LIMIT` | `12` | Maximum proposals per browser session per UTC day. |
| `DEMO_AGENT_GLOBAL_DAILY_LIMIT` | `300` | Maximum public proposals across all sessions per UTC day. |
| `DEMO_AGENT_MAX_CONCURRENCY` | `4` | Maximum active public requests. |
| `DEMO_AGENT_TIMEOUT_MS` | `8000` | Maximum proposal duration before it is released. |

The `DemoAgentBudget` Durable Object owns the shared daily counts and active leases atomically. The existing per-user `AgentRateLimiter` still applies a short sliding-window limit before the global gate.

## Emergency disable

The immediate kill switch is a Worker secret, not a value committed to the repository:

```bash
cd /Users/cbk/Code/deskops/frontend
printf 'true' | npx wrangler secret put DEMO_AGENT_KILL_SWITCH
```

This blocks new public demo proposals while keeping the page visible and explanatory. Confirm with a synthetic request to `/demo`.

To reopen the window after checking the event is still intended to run:

```bash
printf 'false' | npx wrangler secret put DEMO_AGENT_KILL_SWITCH
```

For a durable disable, change `DEMO_AGENTS_ENABLED` to `false` in `frontend/wrangler.jsonc`, run the release gates, and deploy. Do not delete Durable Object state as part of an incident response; it expires naturally by day and is harmless after the gate is disabled.

## Release checks

Run from `frontend/` before deployment:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run worker:build
npx wrangler deploy --dry-run
```

Then deploy with `npm run worker:deploy`, verify `/demo` in a private browser window, request one synthetic proposal, approve it into the local queue, and confirm `/queue` still redirects unauthenticated visitors to `/login`.
