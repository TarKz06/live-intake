"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n";

type Props = {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  /** Inclusive max date (YYYY-MM-DD). */
  max?: string;
};

const WEEKDAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DateField({ value, onChange, invalid, max }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => (value ? parseYMD(value) : null), [value]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxDate = useMemo(() => (max ? parseYMD(max) : null), [max]);

  const [view, setView] = useState(() => {
    const base = parsed ?? today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  useEffect(() => {
    if (open && parsed) setView({ y: parsed.getFullYear(), m: parsed.getMonth() });
  }, [open, parsed]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const thisYear = today.getFullYear();
  const years = useMemo(
    () => Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i),
    [thisYear]
  );
  const grid = useMemo(() => buildGrid(view.y, view.m), [view.y, view.m]);
  const weekdays = locale === "th" ? WEEKDAYS_TH : WEEKDAYS_EN;

  const pick = (d: Date) => {
    onChange(toYMD(d));
    setOpen(false);
  };
  const goPrev = () =>
    setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: v.m === 0 ? 11 : v.m - 1 }));
  const goNext = () =>
    setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }));

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-invalid={invalid}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`ag-input flex items-center justify-between text-left ${
          invalid ? "" : ""
        }`}
      >
        <span className={parsed ? "tnum text-ink" : "text-mute"}>
          {parsed ? formatDisplay(parsed) : "dd/mm/yyyy"}
        </span>
        <Calendar size={16} className="text-mute" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.patient.fields.dateOfBirth}
          className="absolute left-0 top-full z-50 mt-1.5 w-[300px] max-w-[calc(100vw-2rem)] rounded-[12px] border border-line bg-white p-3 shadow-card"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md p-1.5 text-ink-2 transition hover:bg-[#f3f6f4]"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
              <select
                value={view.m}
                onChange={(e) => setView((v) => ({ ...v, m: +e.target.value }))}
                className="rounded-md border border-line bg-white px-2 py-1 text-[13px] text-ink transition hover:bg-[#f7faf8] focus:outline-none focus:ring-2 focus:ring-primary-tint"
              >
                {t.patient.months.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
              <select
                value={view.y}
                onChange={(e) => setView((v) => ({ ...v, y: +e.target.value }))}
                className="tnum rounded-md border border-line bg-white px-2 py-1 text-[13px] text-ink transition hover:bg-[#f7faf8] focus:outline-none focus:ring-2 focus:ring-primary-tint"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={goNext}
              className="rounded-md p-1.5 text-ink-2 transition hover:bg-[#f3f6f4]"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-mute">
            {weekdays.map((d, i) => (
              <div key={i} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((d) => {
              const inMonth = d.getMonth() === view.m;
              const isToday = d.getTime() === today.getTime();
              const isSelected = parsed !== null && d.getTime() === parsed.getTime();
              const disabled = !!maxDate && d.getTime() > maxDate.getTime();
              return (
                <button
                  key={d.getTime()}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  className={[
                    "tnum aspect-square rounded-[8px] text-[13px] transition",
                    isSelected
                      ? "bg-primary font-semibold text-white"
                      : disabled
                        ? "cursor-not-allowed text-[#cfd7d3]"
                        : !inMonth
                          ? "text-mute hover:bg-[#f3f6f4]"
                          : isToday
                            ? "text-primary-ink ring-1 ring-inset ring-primary-tint hover:bg-primary-tint"
                            : "text-ink-2 hover:bg-[#f3f6f4]",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[12px]">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-mute transition hover:text-ink-2"
            >
              {t.patient.clear}
            </button>
            <button
              type="button"
              disabled={!!maxDate && today.getTime() > maxDate.getTime()}
              onClick={() => pick(today)}
              className="font-medium text-primary transition hover:text-primary-ink disabled:cursor-not-allowed disabled:text-mute"
            >
              {t.patient.today}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function parseYMD(s: string): Date | null {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatDisplay(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}/${d.getFullYear()}`;
}

function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = first.getDay();
  const start = new Date(year, month, 1 - offset);
  start.setHours(0, 0, 0, 0);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    cells.push(d);
  }
  return cells;
}
