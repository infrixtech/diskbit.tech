"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeToggle";
import { githubUrl, siteName } from "@/lib/site";
import { categories } from "@/lib/tools";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream/95 dark:border-white/10 dark:bg-ink/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteName} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-600 text-cream-50">
            <Icon name="fileText" size={16} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink dark:text-cream-50">
            {siteName}
          </span>
        </Link>
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Categories">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-200 hover:text-ink dark:text-cream-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {c.shortName}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${siteName} on GitHub`}
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-cream-200 hover:text-ink dark:text-cream-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Icon name="github" size={18} />
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-cream-200 dark:text-cream-200 dark:hover:bg-white/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "x" : "menu"} size={20} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="border-t border-cream-200 bg-cream px-4 py-3 dark:border-white/10 dark:bg-ink lg:hidden"
          aria-label="Mobile categories"
        >
          <ul className="grid grid-cols-2 gap-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream-200 dark:text-cream-50 dark:hover:bg-white/10"
                >
                  <Icon name={c.icon} size={16} />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
