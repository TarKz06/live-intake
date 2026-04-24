"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Search, Users } from "lucide-react";
import { getStaffSocket } from "@/lib/socket";
import { useT } from "@/lib/i18n";
import type { PatientData, PatientSession, PatientStatus } from "@/lib/types";
import StatusBadge from "./StatusBadge";

type FilterKey = "all" | PatientStatus;

const FIELD_KEYS: (keyof PatientData)[] = [
  "firstName", "middleName", "lastName", "dateOfBirth", "gender",
  "phone", "email", "address", "preferredLanguage", "nationality",
  "emergencyContactName", "emergencyContactRelationship", "religion",
];

const AVATAR_PALETTE = [
  { bg: "#e3ecef", text: "#3a4a52" },
  { bg: "#d5ece6", text: "#084f47" },
  { bg: "#fbecd3", text: "#7a4207" },
  { bg: "#e9e4ef", text: "#4b3f63" },
  { bg: "#e3f2ea", text: "#085e40" },
  { bg: "#f1e4d8", text: "#66452a" },
];

export default function StaffView() {
  const t = useT();
  const [sessions, setSessions] = useState<Record<string, PatientSession>>({});
  const [lastField, setLastField] = useState<Record<string, keyof PatientData>>({});
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState(() => new Date());
  const [, tick] = useState(0);

  const prevRef = useRef<Record<string, PatientData>>({});

  useEffect(() => {
    const socket = getStaffSocket();
    const onConnect = () => {
      setConnected(true);
      socket.emit("staff:snapshot");
    };
    const onDisconnect = () => setConnected(false);

    const diffLastField = (id: string, next: PatientData) => {
      const prev = prevRef.current[id] || {};
      let changed: keyof PatientData | null = null;
      for (const k of FIELD_KEYS) {
        const pv = (prev as Record<string, unknown>)[k as string];
        const nv = (next as Record<string, unknown>)[k as string];
        if (nv && nv !== pv) changed = k;
      }
      if (changed) {
        setLastField((m) => ({ ...m, [id]: changed as keyof PatientData }));
      } else if (!(id in prevRef.current)) {
        const first = FIELD_KEYS.find((k) => (next as Record<string, unknown>)[k as string]);
        if (first) setLastField((m) => ({ ...m, [id]: first }));
      }
      prevRef.current[id] = { ...next };
    };

    const onSnapshot = (list: PatientSession[]) => {
      const next: Record<string, PatientSession> = {};
      for (const s of list) {
        next[s.id] = s;
        diffLastField(s.id, s.data);
      }
      setSessions(next);
    };
    const onUpdate = (s: PatientSession) => {
      diffLastField(s.id, s.data);
      setSessions((prev) => ({ ...prev, [s.id]: s }));
    };
    const onLeave = ({ id }: { id: string }) => {
      delete prevRef.current[id];
      setSessions((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setLastField((m) => {
        const { [id]: _, ...rest } = m;
        return rest;
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sessions:snapshot", onSnapshot);
    socket.on("session:update", onUpdate);
    socket.on("session:leave", onLeave);
    if (socket.connected) {
      setConnected(true);
      socket.emit("staff:snapshot");
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sessions:snapshot", onSnapshot);
      socket.off("session:update", onUpdate);
      socket.off("session:leave", onLeave);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date());
      tick((x) => x + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const c: Record<PatientStatus, number> = { active: 0, inactive: 0, submitted: 0 };
    for (const s of Object.values(sessions)) c[s.status] += 1;
    return c;
  }, [sessions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = Object.values(sessions).filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (!q) return true;
      const hay = [
        s.data.firstName, s.data.middleName, s.data.lastName,
        s.data.phone, s.data.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    const rank: Record<PatientStatus, number> = { inactive: 0, active: 1, submitted: 2 };
    return arr.sort((a, b) => rank[a.status] - rank[b.status] || b.updatedAt - a.updatedAt);
  }, [sessions, filter, query]);

  const clockStr = `${String(clock.getHours()).padStart(2, "0")}:${String(clock.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-8 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="ag-kicker tnum">
            <span className="ag-dot bg-primary animate-pulse-dot" />
            {t.staff.kickerLive} · {clockStr}
          </div>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-ink">{t.staff.h1}</h1>
          <p className="mt-1 text-[14px] text-mute">{t.staff.sub}</p>
        </div>

        <AttentionBanner
          idleCount={counts.inactive}
          connected={connected}
          onClick={() => setFilter("inactive")}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-white p-1 sm:inline-flex sm:gap-0">
          {(["all", "active", "inactive", "submitted"] as FilterKey[]).map((key) => {
            const active = filter === key;
            const label =
              key === "all" ? t.staff.filters.all :
              key === "active" ? t.staff.filters.active :
              key === "inactive" ? t.staff.filters.inactive :
              t.staff.filters.submitted;
            const count = key === "all" ? Object.keys(sessions).length : counts[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] transition sm:w-auto sm:justify-start ${
                  active ? "bg-primary text-white shadow-sm" : "text-ink-2 hover:bg-[#f3f6f4]"
                }`}
              >
                {label}
                <span
                  className={`tnum inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-[#eef1f0] text-mute"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <label className="relative inline-flex items-center">
          <Search size={14} className="pointer-events-none absolute left-3 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.staff.searchPlaceholder}
            className="ag-input w-full pl-9 sm:w-[280px]"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <SessionCard key={s.id} session={s} lastField={lastField[s.id]} />
          ))}
        </div>
      )}
    </div>
  );
}

function AttentionBanner({
  idleCount,
  connected,
  onClick,
}: {
  idleCount: number;
  connected: boolean;
  onClick: () => void;
}) {
  const t = useT();
  if (!connected) {
    return (
      <span className="ag-chip bg-[#f4f7f6] text-mute">
        <span className="ag-dot bg-mute" />
        {t.staff.disconnected}
      </span>
    );
  }
  if (idleCount === 0) {
    return (
      <span className="ag-chip bg-[#f4f8f6] text-ink-2">
        <Check size={12} className="text-success" />
        {t.staff.allOk}
      </span>
    );
  }
  return (
    <button
      onClick={onClick}
      className="ag-chip border border-[#f1d9ae] bg-warn-soft text-warn-ink animate-pulse-dot-warn hover:brightness-[.98]"
    >
      <AlertTriangle size={13} />
      {t.staff.needsAttention(idleCount)}
    </button>
  );
}

function SessionCard({
  session,
  lastField,
}: {
  session: PatientSession;
  lastField?: keyof PatientData;
}) {
  const t = useT();
  const { data, status } = session;

  const name =
    [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ").trim() ||
    "—";
  const initials = computeInitials(data);
  const avatar = pickAvatar(session.id);

  const filled = FIELD_KEYS.filter((k) => !!data[k]).length;
  const pct = Math.round((filled / FIELD_KEYS.length) * 100);
  const barColor =
    status === "submitted" ? "bg-success" : status === "inactive" ? "bg-warn" : "bg-primary";
  const edgeColor =
    status === "submitted" ? "bg-success" : status === "inactive" ? "bg-warn" : "bg-primary";
  const cardGradient =
    status === "inactive"
      ? "border-[#f1d9ae] bg-gradient-to-b from-warn-soft/40 to-white"
      : status === "submitted"
      ? "bg-gradient-to-b from-success-soft/40 to-white"
      : "";

  const metaBits = [
    relativeTime(session.updatedAt, t),
    data.phone,
  ].filter(Boolean) as string[];

  return (
    <article className={`ag-card relative p-5 ${cardGradient}`}>
      <span className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${edgeColor}`} />

      <header className="flex items-start gap-3">
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
          style={{ background: avatar.bg, color: avatar.text }}
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold text-ink">{name}</h2>
          <p className="truncate text-[12px] text-mute">{metaBits.join(" · ") || "—"}</p>
        </div>
        <StatusBadge status={status} />
      </header>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-mute">
          <span className="tnum">
            {filled}/{FIELD_KEYS.length}
          </span>
          <span className="ag-mono">{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef1f0]">
          <div
            className={`h-full rounded-full ${barColor} transition-[width]`}
            style={{ width: `${Math.max(3, pct)}%`, transitionDuration: "500ms" }}
          />
        </div>
      </div>

      <LastTypedPanel status={status} data={data} lastField={lastField} />

      <TagRow data={data} />
    </article>
  );
}

function LastTypedPanel({
  status,
  data,
  lastField,
}: {
  status: PatientStatus;
  data: PatientData;
  lastField?: keyof PatientData;
}) {
  const t = useT();

  if (status === "submitted") {
    return (
      <div className="mt-3 rounded-[10px] border border-line bg-[#fafcfb] px-3 py-2.5">
        <div className="ag-mono mb-0.5" style={{ letterSpacing: "0.14em" }}>
          {t.staff.lastLabel}
        </div>
        <div className="text-[13.5px] text-ink-2">{t.staff.submittedText}</div>
      </div>
    );
  }
  if (!lastField || !data[lastField]) {
    return (
      <div className="mt-3 rounded-[10px] border border-line bg-[#fafcfb] px-3 py-2.5">
        <div className="ag-mono mb-0.5" style={{ letterSpacing: "0.14em" }}>
          {t.staff.lastLabel}
        </div>
        <div className="text-[13.5px] italic text-mute">{t.staff.lastNone}</div>
      </div>
    );
  }

  const label = t.patient.fields[lastField as keyof typeof t.patient.fields] ?? lastField;
  const raw = data[lastField];
  const value =
    lastField === "gender" && raw
      ? t.patient.genders[raw as keyof typeof t.patient.genders]
      : String(raw);

  return (
    <div className="mt-3 rounded-[10px] border border-line bg-[#fafcfb] px-3 py-2.5">
      <div className="ag-mono mb-0.5" style={{ letterSpacing: "0.14em" }}>
        {t.staff.lastLabel}
      </div>
      <div className="flex items-baseline gap-2 text-[13.5px] text-ink">
        <span className="inline-flex items-center rounded-md bg-primary-tint px-1.5 py-0.5 text-[11px] font-medium text-primary-ink">
          {label}
        </span>
        <span className="truncate">{value}</span>
        {status === "active" && <span className="ag-caret" />}
      </div>
    </div>
  );
}

function TagRow({ data }: { data: PatientData }) {
  const t = useT();
  const tags: string[] = [];
  if (data.dateOfBirth) tags.push(data.dateOfBirth);
  if (data.gender) tags.push(t.patient.genders[data.gender]);
  if (data.email) tags.push(data.email);
  if (data.nationality) tags.push(data.nationality);
  if (tags.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="max-w-[180px] truncate rounded-full bg-[#eef3f1] px-2 py-0.5 text-[11.5px] text-ink-2"
          title={tag}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function EmptyState() {
  const t = useT();
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
        <Users size={28} className="text-primary-ink" />
      </div>
      <h3 className="mt-4 text-[17px] font-semibold text-ink">{t.staff.emptyTitle}</h3>
      <p className="mt-1 max-w-sm text-[14px] text-mute">{t.staff.emptySub}</p>
    </div>
  );
}

function relativeTime(ms: number, t: ReturnType<typeof useT>) {
  const diff = Math.max(0, Date.now() - ms);
  if (diff < 5_000) return t.staff.justNow;
  if (diff < 60_000) return t.staff.updatedAgo(t.staff.secs(Math.floor(diff / 1000)));
  if (diff < 3_600_000) return t.staff.updatedAgo(t.staff.mins(Math.floor(diff / 60000)));
  return t.staff.updatedAgo(t.staff.hours(Math.floor(diff / 3_600_000)));
}

function computeInitials(d: PatientData) {
  const f = (d.firstName || "").trim();
  const l = (d.lastName || "").trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  if (l) return l.slice(0, 2).toUpperCase();
  return "··";
}

function pickAvatar(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}
