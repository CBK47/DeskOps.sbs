# DeskOps: Design Contract

Read this before any UI change. Deviations must be deliberate and explainable.

## Aesthetic family

**ai-native** (Linear / Cursor tier), executed through the CBK brand system.
Dark theme is primary; light is fully supported, not an inversion.

## Tokens

Single source of truth: `frontend/app/globals.css` (shadcn HSL vars + `--cbk-*`) and
`frontend/tailwind.config.ts` (`cbk.*` palette, `shadow-glow*`, `gradient-cbk*`).
Never hardcode hex in components; consume tokens.

- Accent: CBK blue `#3A5BC7` (`--primary`, `bg-cbk-blue`)
- Dark bg `#080C14` / light bg `#F8FAFC`
- Error: `--destructive` (red-600 light / red-500 dark)

## Typography

- **Manrope** (display + body) / **JetBrains Mono** (code, timestamps, counts). Two fonts, never three.
- Headings: `-0.02em` tracking (h1 `-0.03em`); set globally and do not repeat it.
- Dates, counts, IDs: `font-mono tabular-nums`; data reads as data.
- Body line-height 1.6, ≤75ch.

## Spacing

4px base unit. Tailwind scale only; no arbitrary pixel values in components.
Page container: `max-w-5xl px-4`. Section rhythm: `space-y-4` (queue) / `space-y-6` (forms).

## Color-coded chips (streams, priorities, statuses)

Every chip palette MUST have dark variants. Pattern:

```
light:  bg-{hue}-100 text-{hue}-800
dark:   dark:bg-{hue}-500/15 dark:text-{hue}-300
```

Alpha-tinted dark backgrounds sit on any surface; 300-level text passes AA on `#080C14`.

## Labels

No raw enum values in the UI, ever. `in_progress` → "In progress".
Single source: `frontend/lib/ticket-options.ts` (`*_ITEMS` arrays + `*_LABELS` records).

## Motion (Emil Kowalski rules)

- Animate `transform` + `opacity` only. Never width/height/margin.
- Micro (hover, press): 150ms `ease-out`. Entrances: 300–400ms.
- Hover lift: `-translate-y-0.5` max, paired with shadow. Scale ≤ 1.02. No bounce.
- List entrances: `animate-fade-up` with 40ms stagger, cap at 8 items.
- Every animation gets `motion-reduce:animate-none` (or `transform-none`).
- Linear easing only for loops/progress.

## Depth

Exactly one background layer: fixed radial gradient field, CBK blue,
≤10% opacity dark / ≤6% light, defined on `body` in globals.css.
Never add blur-blobs, never stack a second layer.

## Radii hierarchy

`--radius: 0.75rem` drives shadcn (`lg`/`md`/`sm`). Badges stay `rounded-md`,
buttons `rounded-lg`, the FAB is the one `rounded-full`. Don't flatten to one radius.

## States

- Every interactive element: visible `focus-visible` ring (`ring-ring`), hover, and press (`active:translate-y-px`).
- Active nav item: `bg-secondary text-foreground` + `aria-current="page"`.
- Empty states: icon + one-line heading + one-line hint. Never a bare sentence in a dashed box.

## Engineering landmines (do not regress)

- Base UI `<Select>` needs an `items` prop or the trigger renders raw values.
- Server actions must NOT wrap DB calls in try/catch when they also `redirect()` (edge runtime crash).
- No `supabase.auth.getUser()` before inserts; `user_id` defaults to `auth.uid()` in the DB.
- Tailwind is v3: no `outline-hidden`, `not-*`, `**:`, `in-data-*` variants (silently dropped).
