"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AgnosMark from "./AgnosMark";
import { useLocale, useT } from "@/lib/i18n";

export default function Header() {
  const pathname = usePathname();
  const t = useT();
  const { locale, setLocale } = useLocale();

  const nav = [
    { href: "/patient", label: t.nav.patient },
    { href: "/staff", label: t.nav.staff },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/75 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1360px] items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <AgnosMark />
          <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-tight text-ink sm:inline">
            {t.brand}
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] transition sm:px-3 sm:text-[13.5px] ${
                  active
                    ? "bg-primary-tint font-medium text-primary-ink"
                    : "text-ink-2 hover:bg-[#f3f6f4]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
            className="ml-1 whitespace-nowrap rounded-md px-1.5 py-1 text-[11.5px] font-medium text-mute transition hover:text-ink-2 sm:ml-2 sm:px-2 sm:text-[12px]"
            aria-label="Toggle language"
          >
            <span className={locale === "th" ? "text-ink-2" : ""}>TH</span>
            <span className="mx-1 text-line">·</span>
            <span className={locale === "en" ? "text-ink-2" : ""}>EN</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
