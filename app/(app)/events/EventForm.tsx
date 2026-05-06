"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/Button";
import type { Event } from "@/lib/types";
import type { EventFormState } from "./actions";

const inputCls =
  "h-10 border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:border-neutral-900";
const textareaCls =
  "min-h-24 border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-neutral-900";

function Field({
  label,
  hint,
  children,
  span = 1,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span?: 1 | 2 | 3;
}) {
  return (
    <label
      className={`flex flex-col gap-2 ${
        span === 3 ? "sm:col-span-3" : span === 2 ? "sm:col-span-2" : ""
      }`}
    >
      <span className="text-[11px] uppercase tracking-widest text-neutral-500">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-neutral-400">— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

export default function EventForm({
  action,
  event,
  submitLabel,
}: {
  action: (state: EventFormState, fd: FormData) => Promise<EventFormState>;
  event?: Event;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<EventFormState, FormData>(action, undefined);
  const defaultMode = event?.mode ?? "invite";

  return (
    <form action={formAction} className="grid sm:grid-cols-3 gap-5 max-w-3xl">
      <Field label="Event name" span={3}>
        <input name="name" defaultValue={event?.name ?? ""} className={inputCls} required />
      </Field>

      <Field
        label="Description"
        hint="1–2 lines — appears on the printed itinerary"
        span={3}
      >
        <textarea
          name="description"
          defaultValue={event?.description ?? ""}
          className={textareaCls}
          maxLength={300}
          placeholder="A short, public-facing description of the event."
        />
      </Field>

      <Field label="Date">
        <input
          type="date"
          name="event_date"
          defaultValue={event?.event_date ?? ""}
          className={inputCls}
          required
        />
      </Field>
      <Field label="Start time">
        <input
          type="time"
          name="start_time"
          defaultValue={event?.start_time ?? ""}
          className={inputCls}
        />
      </Field>
      <Field label="End time">
        <input
          type="time"
          name="end_time"
          defaultValue={event?.end_time ?? ""}
          className={inputCls}
        />
      </Field>

      <Field label="Venue" span={3}>
        <input name="venue" defaultValue={event?.venue ?? ""} className={inputCls} />
      </Field>

      <Field label="Map link" hint="Google Maps share URL — shows up as a pin in the itinerary" span={3}>
        <input
          name="map_url"
          type="url"
          defaultValue={event?.map_url ?? ""}
          className={inputCls}
          placeholder="https://maps.google.com/?q=…"
        />
      </Field>

      <Field label="Capacity">
        <input
          type="number"
          min={0}
          name="capacity"
          defaultValue={event?.capacity ?? ""}
          className={inputCls}
        />
      </Field>

      <fieldset className="sm:col-span-2 flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-widest text-neutral-500">
          Access
        </span>
        <div className="grid grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
          <label className="flex items-start gap-3 bg-white px-3 py-2.5 cursor-pointer hover:bg-neutral-50">
            <input
              type="radio"
              name="mode"
              value="invite"
              defaultChecked={defaultMode === "invite"}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">By invitation</span>
              <span className="block text-xs text-neutral-500 mt-0.5">Closed list — only invited VIPs.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 bg-white px-3 py-2.5 cursor-pointer hover:bg-neutral-50">
            <input
              type="radio"
              name="mode"
              value="rsvp"
              defaultChecked={defaultMode === "rsvp"}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">Open RSVP</span>
              <span className="block text-xs text-neutral-500 mt-0.5">Open to all VIPs — they RSVP to attend.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <Field label="Internal notes" hint="Not shown on itinerary" span={3}>
        <textarea name="notes" defaultValue={event?.notes ?? ""} className={textareaCls} />
      </Field>

      {state?.error && (
        <p className="sm:col-span-3 text-sm text-rose-700">{state.error}</p>
      )}

      <div className="sm:col-span-3 flex items-center gap-3 pt-4 border-t border-neutral-200">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
