"use client";

import { useSyncExternalStore } from "react";
import Icon from "@/components/Icon";

// The theme lives on <html> as a "dark" class (set before paint by the inline
// script in app/layout.tsx). Light is the default. useSyncExternalStore reads
// it without hydration mismatches: the server snapshot is light, then React
// swaps the icon after hydration if the visitor saved dark mode.
let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
  return false;
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode); theme just won't persist.
    }
    listeners.forEach((listener) => listener());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-cream-200 hover:text-ink dark:text-cream-200 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <Icon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
}
