"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/Icon";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, day] = value.split("-").map(Number);
  const date = new Date(y, m - 1, day);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== day) return null;
  return date;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function ageBreakdown(birth: Date, asOf: Date) {
  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = asOf.getMonth() === 0 ? 11 : asOf.getMonth() - 1;
    const prevYear = asOf.getMonth() === 0 ? asOf.getFullYear() - 1 : asOf.getFullYear();
    days += daysInMonth(prevYear, prevMonth);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function nextBirthday(birth: Date, asOf: Date): Date {
  let next = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
  if (next <= asOf) next = new Date(asOf.getFullYear() + 1, birth.getMonth(), birth.getDate());
  // Feb 29 on non-leap years falls on Mar 1 in most civil calendars.
  if (birth.getMonth() === 1 && birth.getDate() === 29 && next.getDate() !== 29) {
    next = new Date(next.getFullYear(), 2, 1);
  }
  return next;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AgeCalculator() {
  const [now, setNow] = useState(() => Date.now());
  const today = toInputDate(new Date(now));
  const [birth, setBirth] = useState("2000-01-01");
  const [asOf, setAsOf] = useState(today);
  const live = asOf === today;

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live]);

  const result = useMemo(() => {
    const birthDate = parseDate(birth);
    const asOfDay = parseDate(asOf);
    if (!birthDate || !asOfDay) return { error: "Enter a valid date in YYYY-MM-DD form." } as const;
    if (asOfDay < birthDate) return { error: "The \"as of\" date cannot be before the date of birth." } as const;

    const asOfInstant = live ? new Date(now) : asOfDay;
    const parts = ageBreakdown(birthDate, startOfDay(asOfInstant));
    const ms = Math.max(0, asOfInstant.getTime() - birthDate.getTime());
    const totalDays = Math.floor(ms / 86_400_000);
    const next = nextBirthday(birthDate, startOfDay(asOfInstant));
    const daysUntil = Math.round((next.getTime() - startOfDay(asOfInstant).getTime()) / 86_400_000);
    return {
      error: null,
      parts,
      clock: {
        hours: asOfInstant.getHours(),
        minutes: asOfInstant.getMinutes(),
        seconds: asOfInstant.getSeconds(),
      },
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalHours: Math.floor(ms / 3_600_000),
      totalMinutes: Math.floor(ms / 60_000),
      totalSeconds: Math.floor(ms / 1000),
      next,
      daysUntil,
      live,
    } as const;
  }, [birth, asOf, live, now]);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="age-birth" className="block text-sm font-medium text-ink dark:text-white/70">
            Date of birth
          </label>
          <input
            id="age-birth"
            type="date"
            value={birth}
            max={today}
            onChange={(e) => setBirth(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="age-asof" className="block text-sm font-medium text-ink dark:text-white/70">
            Age as of
          </label>
          <input
            id="age-asof"
            type="date"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {result.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          {result.error}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Years" value={result.parts.years} />
            <Stat label="Months" value={result.parts.months} />
            <Stat label="Days" value={result.parts.days} />
          </div>
          {result.live && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Hours" value={result.clock.hours} />
              <Stat label="Minutes" value={result.clock.minutes} />
              <Stat label="Seconds" value={result.clock.seconds} />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <TotalStat label="Hours lived" value={result.totalHours} />
            <TotalStat label="Minutes lived" value={result.totalMinutes} />
            <TotalStat label="Seconds lived" value={result.totalSeconds} />
          </div>
          {result.live && (
            <p className="text-xs text-ink-muted dark:text-white/55">These numbers update every second.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">Total</p>
              <p className="mt-1 font-semibold text-ink dark:text-white">
                {result.totalDays.toLocaleString()} days ({result.totalWeeks.toLocaleString()} weeks)
              </p>
            </div>
            <div className="rounded-xl border border-cream-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">
                Next birthday
              </p>
              <p className="mt-1 font-semibold text-ink dark:text-white">
                {result.daysUntil === 0
                  ? "Today!"
                  : `${result.daysUntil} day${result.daysUntil === 1 ? "" : "s"} (${WEEKDAYS[result.next.getDay()]})`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-accent-50 px-3 py-4 dark:bg-accent-900/20">
      <p className="text-2xl font-bold text-accent-700 dark:text-accent-300">{value}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-accent-600 dark:text-accent-400">
        {label}
      </p>
    </div>
  );
}

function TotalStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-white px-3 py-4 text-center dark:border-white/10 dark:bg-black">
      <p className="text-xl font-bold tabular-nums text-ink dark:text-white">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">
        {label}
      </p>
    </div>
  );
}
