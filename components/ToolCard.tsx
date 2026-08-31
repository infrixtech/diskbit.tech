import Link from "next/link";
import Icon from "@/components/Icon";
import type { Tool } from "@/lib/tools";
import { getCategoryBySlug } from "@/lib/tools";
import { categoryTint } from "@/lib/category-styles";

export default function ToolCard({ tool }: { tool: Tool }) {
  const tint = categoryTint[tool.category];
  const category = getCategoryBySlug(tool.category);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`group flex flex-col rounded-lg border border-cream-200 bg-white p-5 dark:border-white/10 dark:bg-ink ${tint.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${tint.icon}`}
        >
          <Icon name={tool.icon} size={22} />
        </span>
        {category && (
          <span className="rounded-full border border-cream-200 bg-cream-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted dark:border-white/15 dark:bg-white/10 dark:text-cream-200">
            {category.shortName}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink dark:text-cream-50">{tool.name}</h3>
      <p className="mt-1.5 flex-1 text-pretty text-sm leading-relaxed text-ink-muted dark:text-cream-200">
        {tool.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-600 opacity-80 transition-all group-hover:gap-2 group-hover:opacity-100 dark:text-accent-400">
        Open tool
        <Icon name="chevronRight" size={16} />
      </span>
    </Link>
  );
}
