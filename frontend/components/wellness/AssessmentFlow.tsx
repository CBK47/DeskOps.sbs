"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  saveWellnessAssessmentAction,
  skipWellnessAssessmentAction,
} from "@/app/actions/wellness";
import type { WellnessAssessmentInput } from "@/lib/wellness-assessment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  WELLNESS_DIMENSIONS,
  type WellnessDimension,
  type WellnessFocusState,
  type WellnessReminder,
} from "@/lib/wellness";

type DimensionDraft = {
  selected: boolean;
  currentRating: number | null;
  desiredRating: number | null;
  focusState: WellnessFocusState;
  areas: string[];
};

const initialDimensions = Object.fromEntries(
  WELLNESS_DIMENSIONS.map((dimension) => [
    dimension.id,
    {
      selected: true,
      currentRating: null,
      desiredRating: null,
      focusState: "background",
      areas: [],
    } satisfies DimensionDraft,
  ]),
) as unknown as Record<WellnessDimension, DimensionDraft>;

export function AssessmentFlow({ firstRun = false }: { firstRun?: boolean }) {
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState(initialDimensions);
  const [reminder, setReminder] = useState<WellnessReminder>("never");
  const [customReminderDays, setCustomReminderDays] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedDimensions = useMemo(
    () => WELLNESS_DIMENSIONS.filter((dimension) => drafts[dimension.id].selected),
    [drafts],
  );
  const activeFocusCount = selectedDimensions.filter((dimension) => drafts[dimension.id].focusState === "active_focus").length;

  function updateDimension(id: WellnessDimension, patch: Partial<DimensionDraft>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
    setError(null);
  }

  function goNext() {
    if (step === 1 && selectedDimensions.length === 0) {
      setError("Choose at least one dimension, or skip this assessment.");
      return;
    }
    if (step === 3 && (activeFocusCount < 1 || activeFocusCount > 3)) {
      setError("Choose between one and three areas you actually want support with.");
      return;
    }
    setError(null);
    setStep((current) => Math.min(4, current + 1));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  function submit() {
    const input: WellnessAssessmentInput = {
      entries: selectedDimensions.map((dimension) => {
        const draft = drafts[dimension.id];
        return {
          dimension: dimension.id,
          current_rating: draft.focusState === "not_tracking" ? null : draft.currentRating,
          desired_rating: draft.focusState === "not_tracking" ? null : draft.desiredRating,
          focus_state: draft.focusState,
          areas: draft.areas,
        };
      }),
      reminder,
      customReminderDays: reminder === "custom" ? customReminderDays : null,
    };

    setError(null);
    startTransition(async () => {
      try {
        await saveWellnessAssessmentAction(input);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "DeskOps could not save this snapshot. Please try again.");
      }
    });
  }

  return (
    <section className="assessment-shell" aria-labelledby="assessment-title">
      <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="brand-mark" aria-hidden>DO</span>
          <span className="font-semibold">Wellness Wheel</span>
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{step + 1} / 5</span>
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12">
        <div className="mb-10 flex gap-2" aria-hidden>
          {[0, 1, 2, 3, 4].map((item) => (
            <span key={item} className={cn("h-1 flex-1 rounded-full bg-border", item <= step && "bg-primary")} />
          ))}
        </div>

        <div key={step} className="animate-step-in motion-reduce:animate-none">
          {step === 0 && <Introduction firstRun={firstRun} />}
          {step === 1 && (
            <DimensionSelection drafts={drafts} updateDimension={updateDimension} />
          )}
          {step === 2 && (
            <DimensionRatings drafts={drafts} dimensions={selectedDimensions} updateDimension={updateDimension} />
          )}
          {step === 3 && (
            <FocusSelection drafts={drafts} dimensions={selectedDimensions} updateDimension={updateDimension} activeFocusCount={activeFocusCount} />
          )}
          {step === 4 && (
            <ReminderSelection
              reminder={reminder}
              setReminder={setReminder}
              customReminderDays={customReminderDays}
              setCustomReminderDays={setCustomReminderDays}
            />
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
          <div>
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)} disabled={pending}>
                <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> Back
              </Button>
            ) : (
              <form action={skipWellnessAssessmentAction}>
                <Button type="submit" variant="ghost">Skip this assessment</Button>
              </form>
            )}
          </div>
          {step < 4 ? (
            <Button type="button" size="lg" onClick={goNext}>
              {step === 0 ? "Begin when ready" : "Continue"} <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={submit} disabled={pending}>
              {pending ? "Saving privately…" : "Save this snapshot"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function Introduction({ firstRun }: { firstRun: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className="signal-label">{firstRun ? "A quiet place to begin" : "A new private snapshot"}</p>
      <h1 id="assessment-title" className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-6xl">
        How are you feeling across your life right now?
      </h1>
      <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
        There are no right answers. This gives DeskOps a starting point, and you decide what deserves support.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ["Private", "Saved to your authenticated DeskOps account."],
          ["Optional", "Skip the whole check-in or any individual dimension."],
          ["Yours to steer", "A low rating never becomes an automatic priority."],
        ].map(([title, copy]) => (
          <div key={title} className="border-l border-primary/50 pl-4">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 max-w-2xl text-sm leading-6 text-muted-foreground">
        This is a reflective snapshot, not medical, financial or therapeutic advice. You can change your focus at any time.
      </p>
    </div>
  );
}

function DimensionSelection({
  drafts,
  updateDimension,
}: {
  drafts: Record<WellnessDimension, DimensionDraft>;
  updateDimension: (id: WellnessDimension, patch: Partial<DimensionDraft>) => void;
}) {
  return (
    <div>
      <p className="signal-label">Choose what belongs in this check-in</p>
      <h1 id="assessment-title" className="mt-3 text-balance text-3xl font-semibold sm:text-5xl">Eight dimensions, entirely optional.</h1>
      <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">Select only what feels useful today. Nothing left out is scored as zero.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {WELLNESS_DIMENSIONS.map((dimension, index) => {
          const selected = drafts[dimension.id].selected;
          return (
            <label key={dimension.id} className={cn("dimension-option", selected && "dimension-option-selected")}>
              <input
                type="checkbox"
                className="sr-only"
                checked={selected}
                onChange={(event) => updateDimension(dimension.id, { selected: event.target.checked })}
              />
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{dimension.label}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{dimension.description}</span>
              </span>
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md border", selected && "border-primary bg-primary text-primary-foreground")} aria-hidden>
                {selected && <Check className="h-4 w-4" />}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DimensionRatings({
  drafts,
  dimensions,
  updateDimension,
}: {
  drafts: Record<WellnessDimension, DimensionDraft>;
  dimensions: typeof WELLNESS_DIMENSIONS[number][];
  updateDimension: (id: WellnessDimension, patch: Partial<DimensionDraft>) => void;
}) {
  return (
    <div>
      <p className="signal-label">Reflect, without pressure</p>
      <h1 id="assessment-title" className="mt-3 text-balance text-3xl font-semibold sm:text-5xl">What feels true today?</h1>
      <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">Ratings are optional. A 10 is not perfect. It is simply what feels right to you.</p>
      <div className="mt-8 space-y-4">
        {dimensions.map((dimension) => {
          const draft = drafts[dimension.id];
          const tracking = draft.focusState !== "not_tracking";
          return (
            <fieldset key={dimension.id} className="surface-panel p-5 sm:p-6">
              <legend className="px-1 text-lg font-semibold">{dimension.label}</legend>
              <p className="text-sm leading-6 text-muted-foreground">{dimension.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <RatingSelect label="How it feels now" value={draft.currentRating} disabled={!tracking} onChange={(value) => updateDimension(dimension.id, { currentRating: value })} />
                <RatingSelect label="Where you would like it" value={draft.desiredRating} disabled={!tracking} onChange={(value) => updateDimension(dimension.id, { desiredRating: value })} />
              </div>
              <AreaPicker
                dimensionId={dimension.id}
                suggestedAreas={dimension.areas}
                selectedAreas={draft.areas}
                onChange={(areas) => updateDimension(dimension.id, { areas })}
              />
              <label className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!tracking}
                  onChange={(event) => updateDimension(dimension.id, {
                    focusState: event.target.checked ? "not_tracking" : "background",
                    ...(event.target.checked ? { currentRating: null, desiredRating: null } : {}),
                  })}
                  className="h-4 w-4 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring"
                />
                Not tracking this dimension right now
              </label>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

function AreaPicker({
  dimensionId,
  suggestedAreas,
  selectedAreas,
  onChange,
}: {
  dimensionId: WellnessDimension;
  suggestedAreas: readonly string[];
  selectedAreas: string[];
  onChange: (areas: string[]) => void;
}) {
  const [customArea, setCustomArea] = useState("");
  const customAreas = selectedAreas.filter((area) => !suggestedAreas.includes(area));
  const allAreas = [...suggestedAreas, ...customAreas];

  function addCustomArea() {
    const value = customArea.trim().slice(0, 80);
    if (!value || selectedAreas.some((area) => area.toLocaleLowerCase("en-GB") === value.toLocaleLowerCase("en-GB"))) return;
    onChange([...selectedAreas, value]);
    setCustomArea("");
  }

  return (
    <div className="mt-5">
      <p className="text-sm font-medium">Optional starting areas</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">Use the suggestions, hide them by leaving them unselected, or add wording that fits you better.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {allAreas.map((area) => {
          const checked = selectedAreas.includes(area);
          return (
            <label key={area} className={cn("choice-chip", checked && "choice-chip-active")}>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onChange(checked ? selectedAreas.filter((item) => item !== area) : [...selectedAreas, area])}
              />
              {area}
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex max-w-md gap-2">
        <Input
          aria-label={`Add your own ${dimensionId} area`}
          value={customArea}
          maxLength={80}
          placeholder="Add your own area"
          onChange={(event) => setCustomArea(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustomArea();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={addCustomArea}>Add</Button>
      </div>
    </div>
  );
}

function RatingSelect({ label, value, disabled, onChange }: { label: string; value: number | null; disabled: boolean; onChange: (value: number | null) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        <option value="">Prefer not to rate</option>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => <option key={rating} value={rating}>{rating} / 10</option>)}
      </select>
    </label>
  );
}

function FocusSelection({
  drafts,
  dimensions,
  updateDimension,
  activeFocusCount,
}: {
  drafts: Record<WellnessDimension, DimensionDraft>;
  dimensions: typeof WELLNESS_DIMENSIONS[number][];
  updateDimension: (id: WellnessDimension, patch: Partial<DimensionDraft>) => void;
  activeFocusCount: number;
}) {
  const trackable = dimensions.filter((dimension) => drafts[dimension.id].focusState !== "not_tracking");
  return (
    <div>
      <p className="signal-label">Your priorities, not an algorithm&apos;s</p>
      <h1 id="assessment-title" className="mt-3 text-balance text-3xl font-semibold sm:text-5xl">What would you most like more support with over the next few weeks?</h1>
      <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">Choose one to three. Rating gaps are information only; DeskOps will never select your focus for you.</p>
      <p className="mt-6 font-mono text-xs tabular-nums text-muted-foreground">{activeFocusCount} of 3 selected</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {trackable.map((dimension) => {
          const active = drafts[dimension.id].focusState === "active_focus";
          const disabled = !active && activeFocusCount >= 3;
          return (
            <button
              key={dimension.id}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => updateDimension(dimension.id, { focusState: active ? "background" : "active_focus" })}
              className={cn("dimension-option text-left disabled:cursor-not-allowed disabled:opacity-40", active && "dimension-option-selected")}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{dimension.label}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{drafts[dimension.id].areas.join(" · ") || dimension.description}</span>
              </span>
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md border", active && "border-primary bg-primary text-primary-foreground")} aria-hidden>
                {active && <Check className="h-4 w-4" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReminderSelection({
  reminder,
  setReminder,
  customReminderDays,
  setCustomReminderDays,
}: {
  reminder: WellnessReminder;
  setReminder: (reminder: WellnessReminder) => void;
  customReminderDays: number;
  setCustomReminderDays: (days: number) => void;
}) {
  const options: Array<{ value: WellnessReminder; label: string; copy: string }> = [
    { value: "never", label: "Never", copy: "No reminder. Retake whenever you choose." },
    { value: "monthly", label: "Monthly", copy: "A gentle prompt roughly once a month." },
    { value: "quarterly", label: "Quarterly", copy: "A slower seasonal rhythm." },
    { value: "custom", label: "Custom", copy: "Choose a cadence between 7 and 365 days." },
  ];
  return (
    <div>
      <p className="signal-label">Set your own pace</p>
      <h1 id="assessment-title" className="mt-3 text-balance text-3xl font-semibold sm:text-5xl">Would a future check-in be useful?</h1>
      <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">This preference is saved with the snapshot. DeskOps does not currently send notifications, and will not promise one until that feature exists.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className={cn("dimension-option", reminder === option.value && "dimension-option-selected")}>
            <input type="radio" name="reminder" value={option.value} checked={reminder === option.value} onChange={() => setReminder(option.value)} className="sr-only" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{option.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{option.copy}</span>
            </span>
          </label>
        ))}
      </div>
      {reminder === "custom" && (
        <label className="mt-5 block max-w-xs text-sm font-medium">
          Days between check-ins
          <Input type="number" min={7} max={365} value={customReminderDays} onChange={(event) => setCustomReminderDays(Number(event.target.value))} className="mt-2 h-10" />
        </label>
      )}
    </div>
  );
}
