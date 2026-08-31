"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
} as const;

type SetKey = keyof typeof SETS;

/** Uniform random integer in [0, max) using rejection sampling (no modulo bias). */
function randomInt(max: number): number {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

function generatePassword(length: number, enabled: SetKey[]): string {
  const pool = enabled.map((k) => SETS[k]).join("");
  // Guarantee at least one character from every selected set.
  const chars = enabled.map((k) => SETS[k][randomInt(SETS[k].length)]);
  while (chars.length < length) {
    chars.push(pool[randomInt(pool.length)]);
  }
  // Fisher-Yates shuffle so the guaranteed characters aren't always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, length).join("");
}

function strength(length: number, poolSize: number): { label: string; percent: number; color: string } {
  const bits = length * Math.log2(Math.max(poolSize, 2));
  if (bits < 40) return { label: "Weak", percent: 25, color: "bg-red-500" };
  if (bits < 60) return { label: "Fair", percent: 50, color: "bg-amber-500" };
  if (bits < 80) return { label: "Strong", percent: 75, color: "bg-lime-500" };
  return { label: "Very strong", percent: 100, color: "bg-emerald-500" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<Record<SetKey, boolean>>({
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const enabled = (Object.keys(options) as SetKey[]).filter((k) => options[k]);
  const poolSize = enabled.reduce((n, k) => n + SETS[k].length, 0);
  const meter = strength(length, poolSize);

  function onGenerate() {
    if (enabled.length === 0) return;
    setPassword(generatePassword(length, enabled));
    setCopied(false);
  }

  async function copy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; user can still select the text manually.
    }
  }

  const optionLabels: { key: SetKey; label: string }[] = [
    { key: "upper", label: "Uppercase (A-Z)" },
    { key: "lower", label: "Lowercase (a-z)" },
    { key: "digits", label: "Numbers (0-9)" },
    { key: "symbols", label: "Symbols (!@#$...)" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-xl border border-cream-200 bg-white p-3 dark:border-white/15 dark:bg-black">
        <output
          className="min-h-[2rem] flex-1 select-all break-all px-2 font-mono text-lg text-ink dark:text-white"
          aria-live="polite"
        >
          {password || <span className="text-base text-ink-muted">Click Generate to create a password</span>}
        </output>
        <button
          type="button"
          onClick={copy}
          disabled={!password}
          aria-label="Copy password"
          className="shrink-0 rounded-lg p-2.5 text-ink-muted transition-colors hover:bg-accent-50 hover:text-ink disabled:opacity-40 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Icon name={copied ? "check" : "copy"} size={18} />
        </button>
      </div>

      {password && (
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink dark:text-white/70">Strength</span>
            <span className="font-semibold text-ink dark:text-white">{meter.label}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-white/15">
            <div
              className={`h-full rounded-full transition-all ${meter.color}`}
              style={{ width: `${meter.percent}%` }}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="pw-length" className="flex items-center justify-between text-sm font-medium text-ink dark:text-white/70">
          Length
          <span className="font-bold text-accent-600 dark:text-accent-400">{length} characters</span>
        </label>
        <input
          id="pw-length"
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value, 10))}
          className="mt-2 w-full accent-accent-600"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink dark:text-white/70">Include</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {optionLabels.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-cream-200 bg-white px-3.5 py-2.5 text-sm text-ink dark:border-white/15 dark:bg-black dark:text-white/70">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                className="h-4 w-4 rounded accent-accent-600"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {enabled.length === 0 && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
          Select at least one character type.
        </p>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={enabled.length === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="convert" size={18} />
        {password ? "Generate another" : "Generate"}
      </button>

      <p className="text-xs text-ink-muted dark:text-white/55">
        Generated with the Web Crypto API on your device. Passwords are never stored or transmitted.
      </p>
    </div>
  );
}
