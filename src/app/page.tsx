"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function Home() {
  const t = useT();

  return (
    <div className="mx-auto max-w-[1160px] px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-24">
      <section className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-tint px-3 py-1 text-[12px] font-medium text-primary-ink">
            <span className="ag-dot bg-primary animate-pulse-dot" />
            {t.landing.kicker}
          </span>

          <h1 className="mt-5 font-semibold tracking-tight text-ink" style={{ fontSize: "clamp(40px, 5.6vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            {t.landing.h1}
          </h1>

          <p className="mt-5 max-w-[54ch] text-[17px] leading-relaxed text-ink-2">
            {t.landing.sub}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/patient" className="ag-btn-primary">
              {t.landing.ctaStart}
              <ArrowRight size={16} />
            </Link>
            <Link href="/staff" className="ag-btn-ghost">
              {t.landing.ctaDash}
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-5 text-left">
            {[
              { value: "3", label: t.landing.statFilling },
              { value: "27", label: t.landing.statSubmitted },
              { value: "1.8", label: t.landing.statAvg },
            ].map((s) => (
              <div key={s.label}>
                <dt className="tnum text-[30px] font-semibold tracking-tight text-ink">{s.value}</dt>
                <dd className="mt-0.5 text-[12.5px] text-mute">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-2">
          <DualPreview />
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {t.landing.features.map((f) => (
          <article key={f.kicker} className="ag-card p-6">
            <div className="ag-mono">{f.kicker}</div>
            <h3 className="mt-3 text-[17px] font-semibold text-ink">{f.title}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{f.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function DualPreview() {
  return (
    <div className="grid gap-3">
      <div className="ag-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="ag-kicker">Patient</span>
          <span className="ag-chip bg-primary-tint text-primary-ink">
            <span className="ag-dot bg-primary animate-pulse-dot" />
            Live
          </span>
        </div>
        <div>
          <div className="ag-label">First name</div>
          <div className="mt-1 rounded-[10px] border border-primary bg-white px-3 py-2.5 text-[14px] ring-4 ring-primary-tint">
            Somchai<span className="ag-caret" />
          </div>
        </div>
        <div className="mt-3">
          <div className="ag-label">Date of birth</div>
          <div className="mt-1 rounded-[10px] border border-line bg-white px-3 py-2.5 text-[14px] text-mute">
            14 / 02 / 1961
          </div>
        </div>
      </div>

      <div className="ag-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="ag-kicker">Staff</span>
          <span className="ag-chip bg-primary-tint text-primary-ink">
            <span className="ag-dot bg-primary animate-pulse-dot" />
            Typing
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3ecef] text-[13px] font-semibold text-ink-2">
            SC
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold text-ink">Somchai C.</div>
            <div className="truncate text-[12px] text-mute">อัปเดต 2 วินาทีที่แล้ว · +66 …</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-mute">
            <span>5 / 13</span>
            <span className="ag-mono">38%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef1f0]">
            <div className="h-full rounded-full bg-primary" style={{ width: "38%" }} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[12px]">
          <Check size={14} className="text-success" />
          <span className="text-ink-2">First name</span>
          <span className="text-mute">· Somchai</span>
        </div>
      </div>
    </div>
  );
}
