"use client";

import { useState } from "react";
import { ArrowRight, Calendar, Check, Search } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import DateField from "@/components/DateField";

const COLOR_GROUPS: { title: string; tokens: { name: string; hex: string; tw: string }[] }[] = [
  {
    title: "Brand",
    tokens: [
      { name: "primary", hex: "#0d7d6f", tw: "bg-primary" },
      { name: "primary-ink", hex: "#084f47", tw: "bg-primary-ink" },
      { name: "primary-soft", hex: "#d5ece6", tw: "bg-primary-soft" },
      { name: "primary-tint", hex: "#eaf6f2", tw: "bg-primary-tint" },
    ],
  },
  {
    title: "Neutrals",
    tokens: [
      { name: "ink", hex: "#0e1a1f", tw: "bg-ink" },
      { name: "ink-2", hex: "#3a4a52", tw: "bg-ink-2" },
      { name: "mute", hex: "#6e7e85", tw: "bg-mute" },
      { name: "line", hex: "#e4ece9", tw: "bg-line" },
      { name: "canvas", hex: "#f3f6f4", tw: "bg-canvas" },
      { name: "surface", hex: "#ffffff", tw: "bg-surface" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { name: "warn", hex: "#c2680c", tw: "bg-warn" },
      { name: "warn-soft", hex: "#fbecd3", tw: "bg-warn-soft" },
      { name: "warn-ink", hex: "#7a4207", tw: "bg-warn-ink" },
      { name: "success", hex: "#0a8a5c", tw: "bg-success" },
      { name: "success-soft", hex: "#e3f2ea", tw: "bg-success-soft" },
      { name: "success-ink", hex: "#085e40", tw: "bg-success-ink" },
      { name: "danger", hex: "#b42318", tw: "bg-danger" },
    ],
  },
];

const TYPE_SAMPLES = [
  { role: "Hero H1", className: "text-[48px] font-semibold tracking-tight leading-[1.05]", sample: "Short, clear, safe sign-in" },
  { role: "Page H1", className: "text-[28px] font-semibold tracking-tight", sample: "ข้อมูลผู้ป่วย" },
  { role: "H2", className: "text-[22px] font-semibold tracking-tight", sample: "ส่งข้อมูลแล้ว" },
  { role: "H3 / Card title", className: "text-[17px] font-semibold", sample: "Real-time" },
  { role: "Body", className: "text-[15px] leading-relaxed", sample: "ข้อมูลที่ผู้ป่วยกรอกแสดงบนแดชบอร์ดทันที" },
  { role: "Small body", className: "text-[13px]", sample: "Updated 12 seconds ago" },
  { role: "Label", className: "text-[13px] font-medium tracking-[0.01em] text-ink-2", sample: "First name" },
  { role: "Hint / meta", className: "text-[12.5px] text-mute", sample: "Optional · ไม่บังคับ" },
  { role: "Kicker", className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-ink", sample: "IDENTITY" },
  { role: "Mono kicker", className: "font-mono text-[11px] uppercase tracking-[0.2em] text-mute", sample: "01" },
];

export default function StyleGuide() {
  const [date, setDate] = useState("");

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <header className="mb-10">
        <div className="ag-mono">Internal · Reference</div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-ink">Style guide</h1>
        <p className="mt-1 max-w-prose text-[14px] text-mute">
          ระบบสีและส่วนประกอบที่ใช้ในแอป — ใช้เป็นแหล่งอ้างอิงเดียวเวลาออกแบบหน้าใหม่
        </p>
      </header>

      <Section title="Color">
        <div className="space-y-6">
          {COLOR_GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-mute">{g.title}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {g.tokens.map((t) => (
                  <div key={t.name} className="ag-card overflow-hidden">
                    <div className={`${t.tw} h-16 w-full border-b border-line`} />
                    <div className="p-3">
                      <div className="text-[13px] font-medium text-ink">{t.name}</div>
                      <div className="tnum text-[12px] text-mute">{t.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="ag-card divide-y divide-line">
          {TYPE_SAMPLES.map((t) => (
            <div key={t.role} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-[160px_1fr] sm:items-baseline">
              <div className="text-[12px] font-medium text-mute">{t.role}</div>
              <div className={t.className}>{t.sample}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="ag-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button className="ag-btn-primary">
              Submit <Check size={14} />
            </button>
            <button className="ag-btn-primary">
              Next <ArrowRight size={14} />
            </button>
            <button className="ag-btn-primary" disabled>
              Disabled
            </button>
            <button className="ag-btn-ghost">Cancel</button>
            <button className="ag-btn-ghost">
              <Calendar size={14} /> With icon
            </button>
          </div>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="ag-card p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Default">
              <input className="ag-input" placeholder="Type here" />
            </Field>
            <Field label="Filled">
              <input className="ag-input" defaultValue="Somchai" />
            </Field>
            <Field label="Focused (click to see)">
              <input className="ag-input" placeholder="Click and tab in" />
            </Field>
            <Field label="Invalid">
              <input className="ag-input" defaultValue="bogus" aria-invalid />
            </Field>
            <Field label="Disabled">
              <input className="ag-input" defaultValue="Read-only" disabled />
            </Field>
            <Field label="Select">
              <select className="ag-input" defaultValue="">
                <option value="" disabled>—</option>
                <option>English</option>
                <option>Thai</option>
              </select>
            </Field>
            <Field label="Textarea">
              <textarea className="ag-input" rows={3} placeholder="Multi-line input" />
            </Field>
            <Field label="With icon">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input className="ag-input pl-9" placeholder="Search…" />
              </div>
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Date picker">
        <div className="ag-card p-6">
          <Field label="Date of birth">
            <DateField
              value={date}
              onChange={setDate}
              max={new Date().toISOString().slice(0, 10)}
            />
          </Field>
          <p className="ag-hint mt-3 tnum">value: {date || "—"}</p>
        </div>
      </Section>

      <Section title="Status pills">
        <div className="ag-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="active" />
            <StatusBadge status="inactive" />
            <StatusBadge status="submitted" />
          </div>
          <p className="ag-hint mt-4">
            <code className="font-mono text-[12px]">aria-live=&quot;polite&quot;</code> — screen readers announce transitions.
          </p>
        </div>
      </Section>

      <Section title="Chips">
        <div className="ag-card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="ag-chip bg-primary-tint text-primary-ink">
              <span className="ag-dot bg-primary animate-pulse-dot" />
              Live
            </span>
            <span className="ag-chip bg-warn-soft text-warn-ink">
              <span className="ag-dot bg-warn animate-pulse-dot-warn" />
              Saving
            </span>
            <span className="ag-chip bg-success-soft text-success-ink">
              <Check size={12} /> All clear
            </span>
            <span className="ag-chip bg-[#f4f7f6] text-mute">
              <span className="ag-dot bg-mute" />
              Offline
            </span>
          </div>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="ag-card p-5">
            <div className="ag-mono">Default card</div>
            <h3 className="mt-2 text-[16px] font-semibold text-ink">.ag-card</h3>
            <p className="mt-1 text-[13.5px] text-ink-2">
              Surface = white, border = line, shadow-card. Used for grouped content.
            </p>
          </article>
          <article className="ag-card relative p-5">
            <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
            <div className="ag-mono">With status edge</div>
            <h3 className="mt-2 text-[16px] font-semibold text-ink">Session card variant</h3>
            <p className="mt-1 text-[13.5px] text-ink-2">
              Add a left edge bar to convey status at a glance.
            </p>
          </article>
        </div>
      </Section>

      <Section title="Caret animation">
        <div className="ag-card p-6">
          <div className="flex items-baseline gap-2 text-[14px] text-ink-2">
            <span>Patient is typing</span>
            <span className="ag-caret" />
          </div>
          <p className="ag-hint mt-3">Used inside the staff card&apos;s last-typed panel.</p>
        </div>
      </Section>

      <Section title="Spacing scale">
        <div className="ag-card p-6">
          <div className="space-y-3 text-[13px]">
            {[
              { label: "Card padding (compact)", cls: "p-6" },
              { label: "Card padding (comfortable)", cls: "p-7 sm:p-10" },
              { label: "Grid gutter (comfortable)", cls: "gap-4" },
              { label: "Grid gutter (compact)", cls: "gap-3" },
              { label: "Card radius", cls: "rounded-card (14px)" },
              { label: "Input radius", cls: "rounded-[10px]" },
              { label: "Pill radius", cls: "rounded-full" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                <span className="text-ink-2">{s.label}</span>
                <code className="tnum font-mono text-[12px] text-mute">{s.cls}</code>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-[18px] font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="ag-label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
