"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type Mode = "percentOf" | "whatPercent" | "change";

const modes: { id: Mode; label: string }[] = [
  { id: "percentOf", label: "X% of Y" },
  { id: "whatPercent", label: "X is what % of Y" },
  { id: "change", label: "% change" },
];

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("percentOf");
  // Each mode keeps its own inputs so switching tabs doesn't lose values.
  const [percentOf, setPercentOf] = useState({ x: "15", y: "80" });
  const [whatPercent, setWhatPercent] = useState({ x: "45", y: "60" });
  const [change, setChange] = useState({ from: "50", to: "65" });

  const inputClass =
    "w-full rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white";
  const labelClass = "block text-sm font-medium text-ink dark:text-white/70";

  let resultNode: ReactNode = null;

  if (mode === "percentOf") {
    const x = parseFloat(percentOf.x);
    const y = parseFloat(percentOf.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      const result = (x * y) / 100;
      resultNode = (
        <ResultBox
          headline={`${formatNumber(x)}% of ${formatNumber(y)} = ${formatNumber(result)}`}
          formula={`${formatNumber(y)} × ${formatNumber(x)} ÷ 100 = ${formatNumber(result)}`}
        />
      );
    }
  } else if (mode === "whatPercent") {
    const x = parseFloat(whatPercent.x);
    const y = parseFloat(whatPercent.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      if (y === 0) {
        resultNode = (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            The whole cannot be zero, because dividing by zero is undefined.
          </p>
        );
      } else {
        const result = (x / y) * 100;
        resultNode = (
          <ResultBox
            headline={`${formatNumber(x)} is ${formatNumber(result)}% of ${formatNumber(y)}`}
            formula={`${formatNumber(x)} ÷ ${formatNumber(y)} × 100 = ${formatNumber(result)}%`}
          />
        );
      }
    }
  } else {
    const from = parseFloat(change.from);
    const to = parseFloat(change.to);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      if (from === 0) {
        resultNode = (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            Percentage change from zero is undefined, since any change from 0 is infinite.
          </p>
        );
      } else {
        const result = ((to - from) / Math.abs(from)) * 100;
        const direction = result > 0 ? "increase" : result < 0 ? "decrease" : "no change";
        resultNode = (
          <ResultBox
            headline={
              result === 0
                ? `No change between ${formatNumber(from)} and ${formatNumber(to)}`
                : `${formatNumber(Math.abs(result))}% ${direction}`
            }
            formula={`(${formatNumber(to)} − ${formatNumber(from)}) ÷ ${formatNumber(Math.abs(from))} × 100 = ${formatNumber(result)}%`}
          />
        );
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calculator mode">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              mode === m.id
                ? "bg-accent-600 text-white"
                : "bg-white text-ink-muted hover:bg-accent-50 dark:bg-black dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "percentOf" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="po-x" className={labelClass}>
              Percentage (X)
            </label>
            <input
              id="po-x"
              type="number"
              value={percentOf.x}
              onChange={(e) => setPercentOf((s) => ({ ...s, x: e.target.value }))}
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="po-y" className={labelClass}>
              Of the value (Y)
            </label>
            <input
              id="po-y"
              type="number"
              value={percentOf.y}
              onChange={(e) => setPercentOf((s) => ({ ...s, y: e.target.value }))}
              className={`${inputClass} mt-1.5`}
            />
          </div>
        </div>
      )}

      {mode === "whatPercent" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="wp-x" className={labelClass}>
              The part (X)
            </label>
            <input
              id="wp-x"
              type="number"
              value={whatPercent.x}
              onChange={(e) => setWhatPercent((s) => ({ ...s, x: e.target.value }))}
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="wp-y" className={labelClass}>
              The whole (Y)
            </label>
            <input
              id="wp-y"
              type="number"
              value={whatPercent.y}
              onChange={(e) => setWhatPercent((s) => ({ ...s, y: e.target.value }))}
              className={`${inputClass} mt-1.5`}
            />
          </div>
        </div>
      )}

      {mode === "change" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ch-from" className={labelClass}>
              From (old value)
            </label>
            <input
              id="ch-from"
              type="number"
              value={change.from}
              onChange={(e) => setChange((s) => ({ ...s, from: e.target.value }))}
              className={`${inputClass} mt-1.5`}
            />
          </div>
          <div>
            <label htmlFor="ch-to" className={labelClass}>
              To (new value)
            </label>
            <input
              id="ch-to"
              type="number"
              value={change.to}
              onChange={(e) => setChange((s) => ({ ...s, to: e.target.value }))}
              className={`${inputClass} mt-1.5`}
            />
          </div>
        </div>
      )}

      {resultNode ?? (
        <p className="rounded-xl border border-cream-200 bg-white px-4 py-6 text-center text-sm text-ink-muted dark:border-white/10 dark:bg-black dark:text-white/55">
          Fill in both numbers to see the result.
        </p>
      )}
    </div>
  );
}

function ResultBox({ headline, formula }: { headline: string; formula: string }) {
  return (
    <div className="rounded-xl bg-accent-50 px-5 py-4 dark:bg-accent-900/20">
      <p className="text-xl font-bold text-accent-700 dark:text-accent-300">{headline}</p>
      <p className="mt-1.5 text-sm text-accent-600/80 dark:text-accent-400/80">Formula: {formula}</p>
    </div>
  );
}
