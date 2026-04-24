"use client";

import type { PatientStatus } from "@/lib/types";
import { useT } from "@/lib/i18n";

export default function StatusBadge({ status }: { status: PatientStatus }) {
  const t = useT();

  const styles = {
    active: {
      bg: "bg-primary-tint text-primary-ink",
      dot: "bg-primary animate-pulse-dot",
      label: t.staff.filters.active,
    },
    inactive: {
      bg: "bg-warn-soft text-warn-ink",
      dot: "bg-warn animate-pulse-dot-warn",
      label: t.staff.filters.inactive,
    },
    submitted: {
      bg: "bg-success-soft text-success-ink",
      dot: "bg-success",
      label: t.staff.filters.submitted,
    },
  } as const;

  const s = styles[status];

  return (
    <span
      aria-live="polite"
      className={`ag-chip ${s.bg}`}
    >
      <span className={`ag-dot ${s.dot}`} />
      {s.label}
    </span>
  );
}
