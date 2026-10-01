"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Icon from "@/components/Icon";

/** 1 = easiest … 5 = hardest */
type Difficulty = 1 | 2 | 3 | 4 | 5;
type Phase = "ready" | "running" | "finished";

const DURATIONS = [15, 30, 60, 120] as const;

const LEVELS: { value: Difficulty; label: string; hint: string }[] = [
  { value: 1, label: "1", hint: "Easy" },
  { value: 2, label: "2", hint: "Light" },
  { value: 3, label: "3", hint: "Moderate" },
  { value: 4, label: "4", hint: "Challenging" },
  { value: 5, label: "5", hint: "Hard" },
];

const PASSAGES: Record<Difficulty, string[]> = {
  1: [
    "the quick brown fox jumps over the lazy dog near the quiet river bank where soft grass grows in the warm sun",
    "she sells fresh bread every morning at the corner shop and greets each neighbor with a bright smile",
    "a small cat sat on the mat and watched the birds fly past the open window into the blue sky",
    "please bring me a cup of tea and a simple snack before we start the long walk around the park",
    "good habits grow when you practice a little each day and keep your goals clear and close",
  ],
  2: [
    "Typing gets easier when you look at the words ahead instead of your fingers. Keep a steady pace and breathe.",
    "Short daily practice beats one long rush. Warm up slowly, then raise your speed once the keys feel familiar.",
    "Clear posture helps you type longer without pain. Sit upright, relax your shoulders, and keep wrists light.",
    "Common words are your friends on an easy day. Focus on smooth motion more than chasing a high score.",
    "When you make a mistake, fix it calmly and move on. Panic slows you more than the error itself.",
  ],
  3: [
    "Typing well is less about racing and more about steady rhythm. Keep your eyes on the text, trust your fingers, and correct mistakes without panic.",
    "Clear writing saves time for everyone. Short sentences, familiar words, and careful punctuation make ideas easier to share and remember.",
    "Practice builds skill faster than talent alone. Ten focused minutes each day can raise your speed and accuracy more than one long, tired session.",
    "When deadlines arrive, calm typing still wins. Slow down just enough to avoid errors, then find your pace again once the words start to flow.",
    "A reliable keyboard layout and good posture reduce strain. Sit upright, relax your shoulders, and let your wrists float above the keys.",
  ],
  4: [
    "Mixed case and punctuation raise the challenge: try Emails, Quotes, and Lists—then add numbers like 12, 48, or 365 without breaking rhythm.",
    "Office work blends chat, docs, and forms. Train on commas, apostrophes, and question marks so real messages don't stall your hands.",
    "Recovery speed matters: after a typo, backspace once, re-type cleanly, and resume. Chasing perfection mid-flow often costs more time.",
    "Aim for consistency across a full minute. A stable 55 WPM with 97% accuracy beats a shaky 70 that collapses after twenty seconds.",
    "Technical notes often include hyphens, slashes, and parentheses (like this). Build comfort with those keys before you chase peak speed.",
  ],
  5: [
    "Efficiency isn't only speed; it's the ratio of useful output to wasted motion. Measure WPM, but also track accuracy, backspaces, and recovery after each slip.",
    "Developers often switch contexts: docs, code, chat, and tickets. Strong touch-typing keeps attention on problems instead of hunting for keys under pressure.",
    "Punctuation matters: commas, colons, quotes, and hyphens change meaning fast. Train with mixed symbols so real-world messages don't slow you down.",
    "Consistency beats bursts. Aim for a sustainable cadence you can hold for a full minute, then stretch duration before chasing a higher peak score.",
    "Cognitive load rises with unfamiliar vocabulary. Warm up on plain prose, then introduce technical terms, numbers (e.g. 2,048 KB), and edge-case capitalization.",
  ],
};

/** Stable first passage for SSR + first paint (no Math.random during render). */
function firstPassage(difficulty: Difficulty): string {
  return PASSAGES[difficulty][0];
}

function pickPassage(difficulty: Difficulty, avoid?: string): string {
  const list = PASSAGES[difficulty];
  if (list.length === 1) return list[0];
  let next = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (next === avoid && guard < 8) {
    next = list[Math.floor(Math.random() * list.length)];
    guard += 1;
  }
  return next;
}

function scoreLabel(wpm: number, accuracy: number): { title: string; blurb: string } {
  if (accuracy < 85) {
    return {
      title: "Focus on accuracy",
      blurb: "Slow down a little. Clean keystrokes raise your real WPM faster than rushing.",
    };
  }
  if (wpm < 30) {
    return {
      title: "Building foundation",
      blurb: "Solid start. Short daily practice will lift both speed and confidence.",
    };
  }
  if (wpm < 45) {
    return {
      title: "Everyday ready",
      blurb: "You type at a practical pace for email, schoolwork, and browsing.",
    };
  }
  if (wpm < 65) {
    return {
      title: "Strong typer",
      blurb: "Above average. Great for writing, chat, and office work under time pressure.",
    };
  }
  if (wpm < 90) {
    return {
      title: "Fast hands",
      blurb: "Excellent speed with room to polish consistency on harder passages.",
    };
  }
  return {
    title: "Elite pace",
    blurb: "Outstanding. Keep accuracy high and you are in rare company.",
  };
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

export default function TypingSpeedTest() {
  const [difficulty, setDifficulty] = useState<Difficulty>(3);
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(60);
  const [passage, setPassage] = useState(() => firstPassage(3));
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("ready");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typedRef = useRef("");
  const phaseRef = useRef<Phase>("ready");
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (finalTyped: string, start: number | null) => {
      if (phaseRef.current === "finished") return;
      clearTick();
      const end = Date.now();
      setElapsedMs(start ? Math.max(end - start, 1) : duration * 1000);
      setTyped(finalTyped);
      typedRef.current = finalTyped;
      phaseRef.current = "finished";
      setPhase("finished");
      setSecondsLeft(0);
    },
    [clearTick, duration],
  );

  const reset = useCallback(
    (nextDifficulty: Difficulty = difficulty, nextDuration: (typeof DURATIONS)[number] = duration) => {
      clearTick();
      setDifficulty(nextDifficulty);
      setDuration(nextDuration);
      setPassage((prev) =>
        mountedRef.current ? pickPassage(nextDifficulty, prev) : firstPassage(nextDifficulty),
      );
      setTyped("");
      typedRef.current = "";
      phaseRef.current = "ready";
      setPhase("ready");
      setSecondsLeft(nextDuration);
      setStartedAt(null);
      setElapsedMs(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [clearTick, difficulty, duration],
  );

  const begin = useCallback(() => {
    if (phaseRef.current !== "ready") return;
    const start = Date.now();
    phaseRef.current = "running";
    setPhase("running");
    setStartedAt(start);
    setSecondsLeft(duration);
    setElapsedMs(1);
    clearTick();
    tickRef.current = setInterval(() => {
      const passed = Date.now() - start;
      const left = Math.max(0, duration - Math.floor(passed / 1000));
      setElapsedMs(Math.max(passed, 1));
      setSecondsLeft(left);
      if (left <= 0) finish(typedRef.current, start);
    }, 200);
  }, [duration, clearTick, finish]);

  useEffect(() => () => clearTick(), [clearTick]);

  useEffect(() => {
    if (phase === "running" && typed.length >= passage.length) {
      finish(typed, startedAt);
    }
  }, [typed, passage.length, phase, finish, startedAt]);

  const stats = useMemo(() => {
    const chars = typed.length;
    let correct = 0;
    for (let i = 0; i < chars; i++) {
      if (typed[i] === passage[i]) correct += 1;
    }
    const errors = chars - correct;
    const minutes = Math.max(elapsedMs / 60_000, 1 / 60_000);
    const wpm = Math.round(correct / 5 / minutes);
    const rawWpm = Math.round(chars / 5 / minutes);
    const accuracy = chars === 0 ? 100 : Math.round((correct / chars) * 100);
    return { chars, correct, errors, wpm, rawWpm, accuracy };
  }, [typed, passage, elapsedMs]);

  const progress = passage.length === 0 ? 0 : Math.min(100, (typed.length / passage.length) * 100);
  const rating = scoreLabel(stats.wpm, stats.accuracy);
  const locked = phase === "running";
  const activeLevel = LEVELS.find((l) => l.value === difficulty)!;

  function onChange(value: string) {
    if (phaseRef.current === "finished") return;
    if (phaseRef.current === "ready" && value.length > 0) begin();
    const next = value.slice(0, passage.length);
    typedRef.current = next;
    setTyped(next);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      if (phaseRef.current === "finished") reset();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      reset();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={locked}
            onClick={() => reset(difficulty, d)}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
              duration === d
                ? "bg-accent-600 text-white shadow-sm"
                : "border border-cream-200 bg-white text-ink hover:bg-accent-50 disabled:opacity-50 dark:border-white/15 dark:bg-black dark:text-white/80 dark:hover:bg-white/10"
            }`}
          >
            {formatTime(d)}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-ink dark:text-white/70">Difficulty</span>
          <span className="text-ink-muted dark:text-white/55">
            {activeLevel.hint}
            <span className="mx-1.5 text-ink/25 dark:text-white/25">·</span>
            Easy → Hard
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              disabled={locked}
              title={level.hint}
              aria-label={`Difficulty ${level.value}, ${level.hint}`}
              onClick={() => reset(level.value, duration)}
              className={`rounded-xl px-2 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed ${
                difficulty === level.value
                  ? "bg-ink text-white shadow-sm dark:bg-white dark:text-ink"
                  : "border border-cream-200 bg-white text-ink hover:bg-accent-50 disabled:opacity-50 dark:border-white/15 dark:bg-black dark:text-white/80 dark:hover:bg-white/10"
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Time", value: phase === "finished" ? "Done" : formatTime(secondsLeft) },
          { label: "WPM", value: String(phase === "ready" ? 0 : stats.wpm) },
          { label: "Accuracy", value: `${phase === "ready" ? 100 : stats.accuracy}%` },
          { label: "Errors", value: String(stats.errors) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-cream-200 bg-white px-3 py-3 text-center dark:border-white/15 dark:bg-black"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-ink-muted dark:text-white/55">
              {item.label}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-ink dark:text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-cream-200 bg-white dark:border-white/15 dark:bg-black">
        <div className="h-1.5 bg-ink/10 dark:bg-white/10">
          <div
            className="h-full bg-accent-600 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          className="w-full cursor-text px-4 py-5 text-left sm:px-5 sm:py-6"
          onClick={() => inputRef.current?.focus()}
        >
          <p className="font-mono text-lg leading-relaxed tracking-wide text-ink/35 dark:text-white/30 sm:text-xl">
            {passage.split("").map((char, i) => {
              let className = "text-ink/35 dark:text-white/30";
              if (i < typed.length) {
                className =
                  typed[i] === char
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "rounded-sm bg-red-500/20 text-red-600 dark:text-red-400";
              } else if (i === typed.length && phase !== "finished") {
                className =
                  "rounded-sm bg-accent-600/20 text-ink underline decoration-accent-600 decoration-2 underline-offset-2 dark:text-white";
              }
              return (
                <span key={`${char}-${i}`} className={className}>
                  {char}
                </span>
              );
            })}
          </p>
          {phase === "ready" && (
            <p className="mt-4 text-sm text-ink-muted dark:text-white/55">
              Click here and start typing, the timer begins on your first keystroke.
            </p>
          )}
        </button>

        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={phase === "finished"}
          aria-label="Typing test input"
          className="sr-only"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      {phase === "finished" && (
        <div className="space-y-4 rounded-xl border border-accent-200 bg-accent-50/80 p-4 dark:border-accent-500/30 dark:bg-accent-500/10 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-accent-700 dark:text-accent-300">{rating.title}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-ink dark:text-white">
                {stats.wpm} <span className="text-lg font-semibold text-ink-muted dark:text-white/60">WPM</span>
              </p>
              <p className="mt-1 max-w-prose text-sm text-ink-muted dark:text-white/65">{rating.blurb}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-ink-muted dark:text-white/55">Raw WPM</span>
                <div className="font-semibold tabular-nums text-ink dark:text-white">{stats.rawWpm}</div>
              </div>
              <div>
                <span className="text-ink-muted dark:text-white/55">Accuracy</span>
                <div className="font-semibold tabular-nums text-ink dark:text-white">{stats.accuracy}%</div>
              </div>
              <div>
                <span className="text-ink-muted dark:text-white/55">Correct</span>
                <div className="font-semibold tabular-nums text-ink dark:text-white">{stats.correct}</div>
              </div>
              <div>
                <span className="text-ink-muted dark:text-white/55">Errors</span>
                <div className="font-semibold tabular-nums text-ink dark:text-white">{stats.errors}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
        >
          <Icon name="convert" size={18} />
          {phase === "ready" ? "New passage" : "Try again"}
        </button>
        {phase === "running" && (
          <button
            type="button"
            onClick={() => finish(typed, startedAt)}
            className="inline-flex items-center gap-2 rounded-xl border border-cream-200 bg-white px-5 py-3 font-semibold text-ink transition-colors hover:bg-accent-50 dark:border-white/15 dark:bg-black dark:text-white dark:hover:bg-white/10"
          >
            Finish now
          </button>
        )}
        <p className="text-xs text-ink-muted dark:text-white/55">
          Esc resets · Tab retries after a run · Nothing you type is stored
        </p>
      </div>
    </div>
  );
}