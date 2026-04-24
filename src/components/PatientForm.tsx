"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  User,
  Phone,
  Languages,
  ShieldAlert,
} from "lucide-react";
import DateField from "./DateField";
import { patientSchema, type PatientFormValues } from "@/lib/validation";
import { getPatientSocket } from "@/lib/socket";
import { useT } from "@/lib/i18n";

type StepKey = "identity" | "contact" | "prefs" | "emergency";

const STEPS: { key: StepKey; fields: (keyof PatientFormValues)[]; required: (keyof PatientFormValues)[] }[] = [
  {
    key: "identity",
    fields: ["firstName", "middleName", "lastName", "dateOfBirth", "gender"],
    required: ["firstName", "lastName", "dateOfBirth", "gender"],
  },
  {
    key: "contact",
    fields: ["phone", "email", "address"],
    required: ["phone", "email", "address"],
  },
  {
    key: "prefs",
    fields: ["preferredLanguage", "nationality", "religion"],
    required: ["preferredLanguage", "nationality"],
  },
  {
    key: "emergency",
    fields: ["emergencyContactName", "emergencyContactRelationship"],
    required: [],
  },
];

const STEP_ICON: Record<StepKey, typeof User> = {
  identity: User,
  contact: Phone,
  prefs: Languages,
  emergency: ShieldAlert,
};

const LANGUAGES = ["English", "Thai", "Mandarin", "Japanese", "Korean", "Spanish", "French", "Arabic", "Other"];
const GENDER_VALUES: PatientFormValues["gender"][] = ["male", "female", "other", "prefer_not_to_say"];

export default function PatientForm() {
  const t = useT();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "", middleName: "", lastName: "", dateOfBirth: "",
      gender: undefined as unknown as PatientFormValues["gender"],
      phone: "", email: "", address: "",
      preferredLanguage: "", nationality: "", religion: "",
      emergencyContactName: "", emergencyContactRelationship: "",
    },
  });

  const [step, setStep] = useState(0);
  const [connected, setConnected] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const socketRef = useRef<ReturnType<typeof getPatientSocket> | null>(null);
  const emitDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextEmitRef = useRef(false);

  useEffect(() => {
    const socket = getPatientSocket();
    socketRef.current = socket;

    const requestState = () => socket.emit("patient:state");
    const onConnect = () => {
      setConnected(true);
      requestState();
    };
    const onDisconnect = () => setConnected(false);
    const onState = (state: { data: PatientFormValues; status: "active" | "inactive" | "submitted" }) => {
      skipNextEmitRef.current = true;
      reset(state.data as PatientFormValues);
      if (state.status === "submitted") {
        setSubmitted(true);
        return;
      }
      const resume = STEPS.findIndex((s) =>
        s.required.some((f) => !((state.data as Record<string, unknown>)[f as string] as string | undefined)?.toString().trim())
      );
      setStep(resume === -1 ? STEPS.length - 1 : resume);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("patient:state", onState);
    if (socket.connected) {
      setConnected(true);
      requestState();
    }
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("patient:state", onState);
    };
  }, [reset]);

  useEffect(() => {
    const sub = watch((values) => {
      if (submitted) return;
      if (skipNextEmitRef.current) {
        skipNextEmitRef.current = false;
        return;
      }
      setSaveState("saving");
      if (emitDebounceRef.current) clearTimeout(emitDebounceRef.current);
      if (saveClearRef.current) clearTimeout(saveClearRef.current);
      emitDebounceRef.current = setTimeout(() => {
        socketRef.current?.emit("patient:update", values);
        setSaveState("saved");
        saveClearRef.current = setTimeout(() => setSaveState("idle"), 2000);
      }, 400);
    });
    return () => sub.unsubscribe();
  }, [watch, submitted]);

  const values = watch();
  const stepValid = (i: number) =>
    STEPS[i].required.every((f) => {
      const v = values[f];
      return typeof v === "string" ? v.trim().length > 0 : !!v;
    });
  const allValid = STEPS.every((_, i) => stepValid(i));

  const onNext = async () => {
    const fields = STEPS[step].required as (keyof PatientFormValues)[];
    const ok = await trigger(fields);
    if (!ok) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const onBack = () => setStep((s) => Math.max(s - 1, 0));

  const onValid = (v: PatientFormValues) => {
    socketRef.current?.emit("patient:submit", v);
    setSubmitted(true);
  };
  const onInvalid = () => {
    const badStep = STEPS.findIndex((s) => s.fields.some((f) => errors[f as keyof typeof errors]));
    if (badStep >= 0) setStep(badStep);
  };

  const onReset = () => {
    reset();
    setSubmitted(false);
    setStep(0);
  };

  const doneCount = useMemo(() => STEPS.filter((_, i) => stepValid(i)).length, [values]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalSteps = STEPS.length;

  if (submitted) return <SuccessScreen onReset={onReset} />;

  const StepIcon = STEP_ICON[STEPS[step].key];
  const stepMeta = t.patient.steps[step];

  return (
    <div className="mx-auto max-w-[780px] px-4 sm:px-6 pt-8 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink">{t.patient.h1}</h1>
          <p className="mt-1 text-[14px] text-mute">{t.patient.sub}</p>
        </div>
        <SaveIndicator state={saveState} connected={connected} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 sm:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-white">
            {step + 1}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-primary-ink">
              {t.patient.steps[step].label}
            </div>
            <div className="text-[11px] text-mute tnum">
              {step + 1} / {STEPS.length}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i < step ? "bg-primary" : i === step ? "bg-primary" : "bg-[#e4ece9]"
              }`}
            />
          ))}
        </div>
      </div>

      <ol className="mt-6 hidden items-center gap-0 sm:flex">
        {STEPS.map((s, i) => {
          const done = stepValid(i) && i < step;
          const active = i === step;
          const reachable = i <= step || STEPS.slice(0, i).every((_, j) => stepValid(j));
          const meta = t.patient.steps[i];
          return (
            <li key={s.key} className="flex flex-shrink-0 items-center">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && setStep(i)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] transition ${
                  active
                    ? "bg-primary-tint text-primary-ink"
                    : done
                    ? "text-ink-2 hover:bg-[#eef3f1]"
                    : "text-mute"
                } ${reachable ? "" : "cursor-not-allowed opacity-60"}`}
              >
                <span
                  className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-semibold ${
                    active
                      ? "bg-primary text-white"
                      : done
                      ? "bg-primary-soft text-primary-ink"
                      : "bg-[#eef1f0] text-mute"
                  }`}
                >
                  {done ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{meta.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="mx-2 h-px w-10 bg-line" />}
            </li>
          );
        })}
      </ol>

      <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
        <section className="ag-card mt-5 p-6 sm:p-10">
          <div className="flex items-center gap-2">
            <span className="ag-kicker">
              <StepIcon size={14} />
              {stepMeta.label}
            </span>
          </div>
          <p className="mt-2 text-[15px] text-ink-2">{stepMeta.desc}</p>

          <div className="mt-6 grid grid-cols-1 gap-5">
            {STEPS[step].key === "identity" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldInput label={t.patient.fields.firstName} required error={errors.firstName?.message}>
                    <input className="ag-input" aria-invalid={!!errors.firstName} {...register("firstName")} />
                  </FieldInput>
                  <FieldInput label={t.patient.fields.middleName}>
                    <input className="ag-input" {...register("middleName")} />
                  </FieldInput>
                  <FieldInput label={t.patient.fields.lastName} required error={errors.lastName?.message}>
                    <input className="ag-input" aria-invalid={!!errors.lastName} {...register("lastName")} />
                  </FieldInput>
                  <FieldInput label={t.patient.fields.dateOfBirth} required error={errors.dateOfBirth?.message}>
                    <DateField
                      value={values.dateOfBirth || ""}
                      invalid={!!errors.dateOfBirth}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(v) => setValue("dateOfBirth", v, { shouldValidate: true, shouldDirty: true })}
                    />
                  </FieldInput>
                </div>
                <FieldInput label={t.patient.fields.gender} required error={errors.gender?.message}>
                  <GenderPicker
                    value={values.gender}
                    onChange={(g) => setValue("gender", g, { shouldValidate: true, shouldDirty: true })}
                  />
                </FieldInput>
              </>
            )}

            {STEPS[step].key === "contact" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldInput label={t.patient.fields.phone} required error={errors.phone?.message}>
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="+66 81 234 5678"
                      className="ag-input tnum"
                      aria-invalid={!!errors.phone}
                      {...register("phone")}
                    />
                  </FieldInput>
                  <FieldInput label={t.patient.fields.email} required error={errors.email?.message}>
                    <input
                      type="email"
                      inputMode="email"
                      placeholder="name@example.com"
                      className="ag-input"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                  </FieldInput>
                </div>
                <FieldInput label={t.patient.fields.address} required error={errors.address?.message}>
                  <textarea rows={3} className="ag-input" aria-invalid={!!errors.address} {...register("address")} />
                </FieldInput>
              </>
            )}

            {STEPS[step].key === "prefs" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldInput label={t.patient.fields.preferredLanguage} required error={errors.preferredLanguage?.message}>
                    <select className="ag-input" defaultValue="" aria-invalid={!!errors.preferredLanguage} {...register("preferredLanguage")}>
                      <option value="" disabled>—</option>
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </FieldInput>
                  <FieldInput label={t.patient.fields.nationality} required error={errors.nationality?.message}>
                    <input className="ag-input" placeholder="Thai" aria-invalid={!!errors.nationality} {...register("nationality")} />
                  </FieldInput>
                </div>
                <FieldInput label={t.patient.fields.religion}>
                  <input className="ag-input" {...register("religion")} />
                </FieldInput>
              </>
            )}

            {STEPS[step].key === "emergency" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldInput label={t.patient.fields.emergencyContactName}>
                    <input className="ag-input" {...register("emergencyContactName")} />
                  </FieldInput>
                  <FieldInput label={t.patient.fields.emergencyContactRelationship}>
                    <input className="ag-input" placeholder="Spouse / Mother / …" {...register("emergencyContactRelationship")} />
                  </FieldInput>
                </div>

                <ReviewSummary values={getValues()} />
              </>
            )}
          </div>
        </section>

        <div className="mt-5 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4 text-[12.5px] text-mute">
            <ProgressRing value={doneCount} total={totalSteps} />
            <span className="tnum">
              {doneCount}/{totalSteps} · {t.patient.stepCompletion}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {step > 0 && (
              <button type="button" className="ag-btn-ghost" onClick={onBack}>
                <ArrowLeft size={14} />
                {t.patient.back}
              </button>
            )}
            <button type="button" className="ag-btn-ghost" onClick={() => reset()}>
              <RotateCcw size={14} />
              {t.patient.clear}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="ag-btn-primary"
                onClick={onNext}
                disabled={!stepValid(step)}
              >
                {t.patient.next}
                <ArrowRight size={14} />
              </button>
            ) : (
              <button type="submit" className="ag-btn-primary" disabled={!allValid}>
                <Check size={14} />
                {t.patient.submit}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function FieldInput({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="ag-label">{label}</span>
        <span className={required ? "ag-label-req-on" : "ag-label-req"}>
          {required ? t.patient.required : t.patient.optional}
        </span>
      </span>
      {children}
      {error && <span className="ag-field-error">{error}</span>}
    </label>
  );
}

function GenderPicker({
  value,
  onChange,
}: {
  value: PatientFormValues["gender"] | undefined;
  onChange: (v: PatientFormValues["gender"]) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {GENDER_VALUES.map((g) => {
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`whitespace-nowrap rounded-[10px] border px-3 py-2.5 text-[13.5px] transition ${
              active
                ? "border-primary bg-primary-tint text-primary-ink ring-[3px] ring-primary-tint"
                : "border-line bg-white text-ink-2 hover:border-[#cbd7d3]"
            }`}
            aria-pressed={active}
          >
            {t.patient.genders[g]}
          </button>
        );
      })}
    </div>
  );
}

function SaveIndicator({ state, connected }: { state: "idle" | "saving" | "saved"; connected: boolean }) {
  const t = useT();
  if (!connected) {
    return (
      <span className="ag-chip bg-[#f4f7f6] text-mute" aria-live="polite">
        <span className="ag-dot bg-mute" />
        {t.patient.offline}
      </span>
    );
  }
  if (state === "saving") {
    return (
      <span className="ag-chip bg-warn-soft text-warn-ink" aria-live="polite">
        <span className="ag-dot bg-warn animate-pulse-dot-warn" />
        {t.patient.save.saving}
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="ag-chip bg-primary-tint text-primary-ink" aria-live="polite">
        <span className="ag-dot bg-primary" />
        {t.patient.save.saved}
      </span>
    );
  }
  return (
    <span className="ag-chip bg-primary-tint text-primary-ink" aria-live="polite">
      <span className="ag-dot bg-primary animate-pulse-dot" />
      {t.patient.live}
    </span>
  );
}

function ProgressRing({ value, total }: { value: number; total: number }) {
  const size = 22;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : value / total;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef1f0" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#0d7d6f"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(.2,.7,.2,1)" }}
      />
    </svg>
  );
}

function ReviewSummary({ values }: { values: PatientFormValues }) {
  const t = useT();
  const items: { label: string; value: string }[] = [
    { label: t.patient.fields.firstName, value: [values.firstName, values.middleName, values.lastName].filter(Boolean).join(" ") },
    { label: t.patient.fields.dateOfBirth, value: values.dateOfBirth || "" },
    { label: t.patient.fields.gender, value: values.gender ? t.patient.genders[values.gender] : "" },
    { label: t.patient.fields.phone, value: values.phone || "" },
    { label: t.patient.fields.email, value: values.email || "" },
    { label: t.patient.fields.preferredLanguage, value: values.preferredLanguage || "" },
    { label: t.patient.fields.nationality, value: values.nationality || "" },
  ];

  return (
    <div className="mt-2 rounded-[12px] border border-line bg-[#f7faf8] p-4">
      <div className="ag-mono mb-3">{t.patient.review.title}</div>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-3">
            <dt className="text-[12.5px] text-mute">{it.label}</dt>
            <dd className={`text-right text-[13.5px] ${it.value ? "text-ink" : "text-mute"}`}>
              {it.value || "—"}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[12.5px] text-mute">{t.patient.review.sub}</p>
    </div>
  );
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  const t = useT();
  const [pieces, setPieces] = useState<
    { id: number; x: number; dx: number; r: number; d: number; w: number; h: number; c: string }[]
  >([]);

  useEffect(() => {
    const palette = ["#0d7d6f", "#084f47", "#c2680c", "#0a8a5c", "#d5ece6", "#fbecd3"];
    const count = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 34;
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      dx: (Math.random() - 0.5) * 240,
      r: 360 + Math.random() * 360,
      d: 1.8 + Math.random() * 1.6,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 9,
      c: palette[i % palette.length],
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 3800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mx-auto max-w-[640px] px-4 sm:px-6 pt-20 pb-24">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="ag-confetti"
          style={
            {
              "--x": `${p.x}%`,
              "--dx": `${p.dx}px`,
              "--r": `${p.r}deg`,
              "--d": `${p.d}s`,
              "--w": `${p.w}px`,
              "--h": `${p.h}px`,
              "--c": p.c,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="ag-card animate-rise p-10 text-center sm:p-12">
        <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-primary-tint">
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden>
            <circle cx="23" cy="23" r="21" stroke="#0d7d6f" strokeWidth="2" opacity=".2" />
            <path
              d="M13 24 L20 31 L34 16"
              stroke="#0d7d6f"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw"
              style={{ strokeDasharray: 60 }}
            />
          </svg>
        </div>
        <h2 className="mt-5 text-[26px] font-semibold tracking-tight text-ink">{t.patient.success.title}</h2>
        <p className="mt-2 text-[15px] text-mute">{t.patient.success.sub}</p>
        <button className="ag-btn-primary mt-6" onClick={onReset}>
          {t.patient.success.cta}
        </button>
      </div>
    </div>
  );
}
