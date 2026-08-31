import Link from "next/link";
import Icon from "@/components/Icon";
import ToolCard from "@/components/ToolCard";
import { getCategoryBySlug, getToolsByCategory } from "@/lib/tools";
import type { CategorySlug } from "@/lib/tools";
import { categoryTint } from "@/lib/category-styles";

export default function CategoryPage({ slug }: { slug: CategorySlug }) {
  const category = getCategoryBySlug(slug)!;
  const categoryTools = getToolsByCategory(slug);
  const tint = categoryTint[slug];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted dark:text-cream-200">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent-600 dark:hover:text-accent-400">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink dark:text-cream-50">
            {category.name}
          </li>
        </ol>
      </nav>
      <div className="flex items-start gap-4">
        <span className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tint.idle}`}>
          <Icon name={category.icon} size={26} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-cream-50 sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted dark:text-cream-200">
            {category.description}
          </p>
          <p className="mt-2 text-sm font-medium text-ink-muted dark:text-cream-200">
            {categoryTools.length} tools. All run in your browser.
          </p>
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
