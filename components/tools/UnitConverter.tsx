"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";

type Category = "length" | "weight" | "temperature" | "data";

interface Unit {
  id: string;
  label: string;
  /** Multiply this unit by factor to get the category base. */
  toBase: number;
}

const CATEGORIES: { id: Category; label: string; units: Unit[] }[] = [
  {
    id: "length",
    label: "Length",
    units: [
      { id: "mm", label: "Millimetres (mm)", toBase: 0.001 },
      { id: "cm", label: "Centimetres (cm)", toBase: 0.01 },
      { id: "m", label: "Metres (m)", toBase: 1 },
      { id: "km", label: "Kilometres (km)", toBase: 1000 },
      { id: "in", label: "Inches (in)", toBase: 0.0254 },
      { id: "ft", label: "Feet (ft)", toBase: 0.3048 },
      { id: "yd", label: "Yards (yd)", toBase: 0.9144 },
      { id: "mi", label: "Miles (mi)", toBase: 1609.344 },
    ],
  },
  {
    id: "weight",
    label: "Weight",
    units: [
      { id: "mg", label: "Milligrams (mg)", toBase: 0.000001 },
      { id: "g", label: "Grams (g)", toBase: 0.001 },
      { id: "kg", label: "Kilograms (kg)", toBase: 1 },
      { id: "oz", label: "Ounces (oz)", toBase: 0.028349523125 },
      { id: "lb", label: "Pounds (lb)", toBase: 0.45359237 },
    ],
  },
  {
    id: "temperature",
    label: "Temperature",
    units: [
      { id: "c", label: "Celsius (°C)", toBase: 1 },
      { id: "f", label: "Fahrenheit (°F)", toBase: 1 },
      { id: "k", label: "Kelvin (K)", toBase: 1 },
    ],
  },
  {
    id: "data",
    label: "Data size",
    units: [
      { id: "b", label: "Bytes (B)", toBase: 1 },
      { id: "kb", label: "Kilobytes (KB)", toBase: 1024 },
      { id: "mb", label: "Megabytes (MB)", toBase: 1024 ** 2 },
      { id: "gb", label: "Gigabytes (GB)", toBase: 1024 ** 3 },
      { id: "tb", label: "Terabytes (TB)", toBase: 1024 ** 4 },
    ],
  },
];

function celsiusFrom(id: string, value: number): number {
  if (id === "c") return value;
  if (id === "f") return (value - 32) * (5 / 9);
  return value - 273.15;
}

function celsiusTo(id: string, c: number): number {
  if (id === "c") return c;
  if (id === "f") return c * (9 / 5) + 32;
  return c + 273.15;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  const digits = abs === 0 ? 0 : abs >= 1000 ? 2 : abs >= 1 ? 4 : 6;
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>("length");
  const [sourceId, setSourceId] = useState("m");
  const [sourceValue, setSourceValue] = useState("1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const group = CATEGORIES.find((c) => c.id === category)!;

  function switchCategory(id: Category) {
    const next = CATEGORIES.find((c) => c.id === id)!;
    setCategory(id);
    setSourceId(next.units[0].id);
    setSourceValue("1");
    setCopiedId(null);
  }

  const values = useMemo(() => {
    const n = parseFloat(sourceValue.replace(/,/g, ""));
    if (!Number.isFinite(n)) return null;
    const map: Record<string, number> = {};
    if (category === "temperature") {
      const c = celsiusFrom(sourceId, n);
      for (const unit of group.units) map[unit.id] = celsiusTo(unit.id, c);
    } else {
      const source = group.units.find((u) => u.id === sourceId)!;
      const base = n * source.toBase;
      for (const unit of group.units) map[unit.id] = base / unit.toBase;
    }
    return map;
  }, [category, group.units, sourceId, sourceValue]);

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard unavailable.
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Unit category">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={category === c.id}
            onClick={() => switchCategory(c.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              category === c.id
                ? "bg-accent-600 text-white"
                : "bg-white text-ink-muted hover:bg-accent-50 dark:bg-black dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="unit-value" className="block text-sm font-medium text-ink dark:text-white/70">
          Value
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="unit-value"
            type="text"
            inputMode="decimal"
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-white/15 dark:bg-black dark:text-white"
          />
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            aria-label="Source unit"
            className="w-44 rounded-xl border border-cream-200 bg-white px-3 py-2.5 text-sm text-ink dark:border-white/15 dark:bg-black dark:text-white"
          >
            {group.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {values ? (
        <ul className="divide-y divide-cream-200 overflow-hidden rounded-xl border border-cream-200 dark:divide-white/10 dark:border-white/15">
          {group.units.map((unit) => {
            const display = formatNumber(values[unit.id]);
            return (
              <li key={unit.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-black">
                <div>
                  <p className="text-sm text-ink-muted dark:text-white/55">{unit.label}</p>
                  <p className="font-semibold tabular-nums text-ink dark:text-white">{display}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(unit.id, String(values[unit.id]))}
                  className="rounded-lg p-2 text-ink-muted hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-white/10"
                  aria-label={`Copy ${unit.label}`}
                >
                  <Icon name={copiedId === unit.id ? "check" : "copy"} size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Enter a number to convert.
        </p>
      )}
    </div>
  );
}
