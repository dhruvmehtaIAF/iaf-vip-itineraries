import { RSVP_LABELS, RSVP_CLASSES } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { RsvpStatus } from "@/lib/types";

export default function StatusBadge({
  status,
  className,
}: {
  status: RsvpStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] uppercase tracking-widest px-2 py-1 ring-1 ring-inset",
        RSVP_CLASSES[status] ?? RSVP_CLASSES.not_sent,
        className
      )}
    >
      {RSVP_LABELS[status] ?? status}
    </span>
  );
}
