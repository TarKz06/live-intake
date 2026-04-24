"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "th" | "en";

const dict = {
  th: {
    brand: "Intake System",
    nav: { patient: "ผู้ป่วย", staff: "เจ้าหน้าที่" },
    locale: { th: "TH", en: "EN" },
    landing: {
      kicker: "ระบบลงทะเบียนผู้ป่วย • เรียลไทม์",
      h1: "ลงทะเบียนสั้น ชัด และปลอดภัย",
      sub: "แบบฟอร์มที่ออกแบบมาให้ผู้ป่วยกรอกได้ไม่เกินสองนาที และเจ้าหน้าที่มองเห็นทุกการพิมพ์ได้ทันทีโดยไม่ต้องรีเฟรช",
      ctaStart: "เริ่มกรอก",
      ctaDash: "เปิดแดชบอร์ด",
      statFilling: "กำลังกรอก",
      statSubmitted: "ส่งแล้ววันนี้",
      statAvg: "นาทีโดยเฉลี่ย",
      features: [
        { kicker: "01", title: "เรียลไทม์", body: "ข้อมูลที่ผู้ป่วยกรอกแสดงบนแดชบอร์ดของเจ้าหน้าที่ทันที ไม่ต้องรีเฟรชหน้า" },
        { kicker: "02", title: "รู้สถานะผู้ป่วย", body: "เห็นว่าใครกำลังกรอก ใครหยุดพิมพ์ หรือส่งข้อมูลแล้ว พร้อมตัวบ่งชี้ที่ชัดเจน" },
        { kicker: "03", title: "ใช้งานง่าย", body: "แบ่งเป็นหัวข้อทีละขั้น ตัวอักษรและปุ่มขนาดพอดี เหมาะกับผู้ใช้ทุกวัย" },
      ],
    },
    patient: {
      h1: "ข้อมูลผู้ป่วย",
      sub: "กรอกข้อมูลเพื่อเริ่มการลงทะเบียน ใช้เวลาประมาณ 2 นาที",
      required: "จำเป็น",
      optional: "ไม่บังคับ",
      save: { idle: "พร้อม", saving: "กำลังบันทึก", saved: "บันทึกอัตโนมัติ" },
      back: "ย้อนกลับ",
      clear: "ล้าง",
      next: "ถัดไป",
      submit: "ส่งข้อมูล",
      today: "วันนี้",
      stepCompletion: "หัวข้อที่กรอกแล้ว",
      steps: [
        { key: "identity", label: "ข้อมูลตัวบุคคล", desc: "ชื่อ วันเกิด และเพศ — ใช้เพื่อระบุตัวผู้ป่วยในระบบ" },
        { key: "contact", label: "ติดต่อ", desc: "ช่องทางติดต่อหากเจ้าหน้าที่ต้องการยืนยันข้อมูล" },
        { key: "prefs", label: "ความชอบ", desc: "ภาษาและสัญชาติสำหรับการให้บริการ" },
        { key: "emergency", label: "ฉุกเฉิน", desc: "ผู้ที่สามารถติดต่อได้ในกรณีเร่งด่วน (ไม่บังคับ)" },
      ],
      fields: {
        firstName: "ชื่อจริง",
        middleName: "ชื่อกลาง",
        lastName: "นามสกุล",
        dateOfBirth: "วันเกิด",
        gender: "เพศ",
        phone: "เบอร์โทรศัพท์",
        email: "อีเมล",
        address: "ที่อยู่",
        preferredLanguage: "ภาษาที่ใช้สื่อสาร",
        nationality: "สัญชาติ",
        religion: "ศาสนา",
        emergencyContactName: "ชื่อผู้ติดต่อฉุกเฉิน",
        emergencyContactRelationship: "ความสัมพันธ์",
      },
      genders: {
        male: "ชาย",
        female: "หญิง",
        other: "อื่น ๆ",
        prefer_not_to_say: "ไม่ระบุ",
      },
      months: [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
      ],
      review: {
        title: "ตรวจทานก่อนส่ง",
        sub: "โปรดตรวจสอบว่าทุกข้อมูลถูกต้อง",
      },
      success: {
        title: "ส่งข้อมูลแล้ว ขอบคุณครับ",
        sub: "เจ้าหน้าที่กำลังตรวจข้อมูลของท่าน เชิญพักรอบริเวณหน้าเคาน์เตอร์",
        cta: "กรอกผู้ป่วยคนถัดไป",
      },
      live: "ซิงค์เรียลไทม์",
      offline: "ออฟไลน์",
    },
    staff: {
      kickerLive: "Live",
      h1: "แดชบอร์ดเจ้าหน้าที่",
      sub: "เห็นทุกการพิมพ์ของผู้ป่วยในเวลาจริง เรียงตามความเร่งด่วนอัตโนมัติ",
      allOk: "ทุกอย่างเรียบร้อย",
      needsAttention: (n: number) => `${n} รายการต้องดูแล`,
      searchPlaceholder: "ค้นหาชื่อ เบอร์ หรืออีเมล",
      filters: { all: "ทั้งหมด", active: "กำลังพิมพ์", inactive: "ไม่ตอบสนอง", submitted: "ส่งแล้ว" },
      lastLabel: "Last",
      lastNone: "ยังไม่ได้เริ่มพิมพ์",
      submittedText: "ส่งฟอร์มเรียบร้อยแล้ว",
      updatedAgo: (s: string) => `อัปเดต ${s}`,
      emptyTitle: "ยังไม่มีผู้ป่วย",
      emptySub: "เปิดหน้าผู้ป่วยในหน้าต่างอื่นเพื่อดูการซิงค์แบบเรียลไทม์",
      justNow: "เมื่อสักครู่",
      secs: (n: number) => `${n} วินาทีที่แล้ว`,
      mins: (n: number) => `${n} นาทีที่แล้ว`,
      hours: (n: number) => `${n} ชั่วโมงที่แล้ว`,
      connected: "เชื่อมต่อ",
      disconnected: "ขาดการเชื่อมต่อ",
    },
  },
  en: {
    brand: "Intake System",
    nav: { patient: "Patient", staff: "Staff" },
    locale: { th: "TH", en: "EN" },
    landing: {
      kicker: "Real-time patient sign-in",
      h1: "Short, clear, safe sign-in",
      sub: "A form patients finish in under two minutes and a dashboard where every keystroke appears instantly — no refresh.",
      ctaStart: "Start the form",
      ctaDash: "Open dashboard",
      statFilling: "Filling now",
      statSubmitted: "Submitted today",
      statAvg: "Average minutes",
      features: [
        { kicker: "01", title: "Real-time", body: "Data the patient enters shows up on the staff dashboard right away — no page reload." },
        { kicker: "02", title: "See patient status", body: "See who's typing, who stopped, and who has submitted, with clear status indicators." },
        { kicker: "03", title: "Easy to use", body: "One topic at a time, comfortable text size and buttons — friendly for any age." },
      ],
    },
    patient: {
      h1: "Patient information",
      sub: "Fill in your details to register. About two minutes.",
      required: "Required",
      optional: "Optional",
      save: { idle: "Ready", saving: "Saving…", saved: "Auto-saved" },
      back: "Back",
      clear: "Clear",
      next: "Next",
      submit: "Submit",
      today: "Today",
      stepCompletion: "Sections complete",
      steps: [
        { key: "identity", label: "Identity", desc: "Name, date of birth, and gender — used to identify you in the system." },
        { key: "contact", label: "Contact", desc: "How staff can reach you if we need to confirm something." },
        { key: "prefs", label: "Preferences", desc: "Language and nationality for tailored service." },
        { key: "emergency", label: "Emergency", desc: "Someone to contact in case of urgency (optional)." },
      ],
      fields: {
        firstName: "First name",
        middleName: "Middle name",
        lastName: "Last name",
        dateOfBirth: "Date of birth",
        gender: "Gender",
        phone: "Phone",
        email: "Email",
        address: "Address",
        preferredLanguage: "Preferred language",
        nationality: "Nationality",
        religion: "Religion",
        emergencyContactName: "Emergency contact name",
        emergencyContactRelationship: "Relationship",
      },
      genders: {
        male: "Male",
        female: "Female",
        other: "Other",
        prefer_not_to_say: "Prefer not to say",
      },
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
      review: {
        title: "Review before submitting",
        sub: "Please make sure everything is correct.",
      },
      success: {
        title: "Submitted — thank you",
        sub: "Staff are reviewing your information now. Please take a seat at the counter.",
        cta: "Register another patient",
      },
      live: "Live sync",
      offline: "Offline",
    },
    staff: {
      kickerLive: "Live",
      h1: "Staff dashboard",
      sub: "Every keystroke, in real time. Sorted by who needs help first.",
      allOk: "All clear",
      needsAttention: (n: number) => `${n} need${n === 1 ? "s" : ""} attention`,
      searchPlaceholder: "Search name, phone, or email",
      filters: { all: "All", active: "Typing", inactive: "Idle", submitted: "Submitted" },
      lastLabel: "Last",
      lastNone: "Not started yet",
      submittedText: "Form submitted",
      updatedAgo: (s: string) => `Updated ${s}`,
      emptyTitle: "No patient sessions yet",
      emptySub: "Open the patient page in another window to see the real-time sync.",
      justNow: "just now",
      secs: (n: number) => `${n}s ago`,
      mins: (n: number) => `${n}m ago`,
      hours: (n: number) => `${n}h ago`,
      connected: "Connected",
      disconnected: "Disconnected",
    },
  },
};

type Dict = typeof dict.th;

const LocaleCtx = createContext<{ locale: Locale; setLocale: (l: Locale) => void; t: Dict }>({
  locale: "th",
  setLocale: () => {},
  t: dict.th,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
    if (saved === "th" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("locale", l);
  };

  return (
    <LocaleCtx.Provider value={{ locale, setLocale, t: dict[locale] }}>
      {children}
    </LocaleCtx.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleCtx);
}

export function useT() {
  return useContext(LocaleCtx).t;
}
