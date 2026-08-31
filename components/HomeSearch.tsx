"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import ToolCard from "@/components/ToolCard";
import { categories, tools } from "@/lib/tools";
import { categoryTint } from "@/lib/category-styles";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (categoryFilter && tool.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.includes(q))
      );
    });
  }, [query, categoryFilter]);

  const visibleCategories = categoryFilter
    ? categories.filter((c) => c.slug === categoryFilter)
    : categories;

  return (
    <div>
      <div className="relative mx-auto max-w-2xl">
        <Icon
          name="search"
          size={20}
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try merge PDF, crop photo, password..."
          aria-label="Search tools"
          className="w-full rounded-lg border border-cream-200 bg-white py-4 pr-4 text-base text-ink shadow-none placeholder:text-ink-muted focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:border-white/15 dark:bg-ink dark:text-white"
          style={{ paddingLeft: "3.25rem" }}
        />
      </div>

      <label className="mx-auto mt-5 block max-w-2xl md:hidden">
        <span className="sr-only">Show tools by category</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full rounded-lg border border-cream-200 bg-white px-4 py-3 text-base font-medium text-ink focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:border-white/15 dark:bg-ink dark:text-white"
        >
          <option value="">All tools</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.shortName}
            </option>
          ))}
        </select>
      </label>

      <div className="mx-auto mt-5 hidden max-w-2xl flex-wrap justify-center gap-2 md:flex">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${categoryTint[category.slug].chip}`}
          >
            <Icon name={category.icon} size={14} />
            {category.shortName}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted dark:text-cream-200">
          No tools match &quot;{query}&quot; yet. Try &quot;pdf&quot;, &quot;image&quot;, or
          &quot;password&quot;.
        </p>
      ) : (
        <div className="mt-8 space-y-10 md:mt-14 md:space-y-16">
          {visibleCategories.map((category) => {
            const categoryTools = filtered.filter((t) => t.category === category.slug);
            if (categoryTools.length === 0) return null;
            return (
              <section key={category.slug} aria-labelledby={`heading-${category.slug}`}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2
                      id={`heading-${category.slug}`}
                      className="flex items-center gap-2 text-2xl font-bold tracking-tight text-ink dark:text-cream-50"
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${categoryTint[category.slug].idle}`}
                      >
                        <Icon name={category.icon} size={18} />
                      </span>
                      {category.name}
                    </h2>
                    <p className="mt-1.5 max-w-2xl text-pretty leading-relaxed text-ink-muted dark:text-cream-200">
                      {category.description}
                    </p>
                  </div>
                  <Link
                    href={`/${category.slug}`}
                    className="text-sm font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
