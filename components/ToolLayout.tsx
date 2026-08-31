import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "@/components/Icon";
import ToolCard from "@/components/ToolCard";
import { toolContent } from "@/lib/tool-content";
import { getCategoryBySlug, getToolsByCategory } from "@/lib/tools";
import type { Tool } from "@/lib/tools";

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
}

/**
 * Shared page layout for every tool: header with H1 + privacy badge,
 * the interactive tool UI, then the how-to and FAQ section.
 */
export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  const content = toolContent[tool.slug];
  const category = getCategoryBySlug(tool.category);
  const related = getToolsByCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-muted dark:text-cream-200">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent-600 dark:hover:text-accent-400">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {category && (
            <>
              <li>
                <Link
                  href={`/${category.slug}`}
                  className="hover:text-accent-600 dark:hover:text-accent-400"
                >
                  {category.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
            </>
          )}
          <li aria-current="page" className="font-medium text-ink dark:text-cream-50">
            {tool.name}
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-cream-50 sm:text-4xl">
          {tool.name}
        </h1>
        {content && (
          <p className="mt-3 text-lg text-pretty text-ink-muted dark:text-cream-200">{content.tagline}</p>
        )}
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent-400 bg-accent-50 px-4 py-1.5 text-sm font-semibold text-accent-800 dark:border-accent-500 dark:bg-accent-900/40 dark:text-accent-200">
          <Icon name="shield" size={16} />
          100% private. Your files never leave your device.
        </p>
      </div>

      <section
        aria-label={`${tool.name} tool`}
        className="rounded-lg border border-cream-200 bg-white p-5 shadow-none dark:border-white/10 dark:bg-ink sm:p-8"
      >
        {children}
      </section>

      {content && (
        <div className="mt-12 space-y-10">
          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="text-2xl font-bold tracking-tight text-ink dark:text-cream-50"
            >
              About this tool
            </h2>
            <p className="mt-4 copy-justify">{content.intro}</p>
          </section>

          <section aria-labelledby="howto-heading">
            <h2
              id="howto-heading"
              className="text-2xl font-bold tracking-tight text-ink dark:text-cream-50"
            >
              How to use
            </h2>
            <ol className="mt-4 space-y-3">
              {content.howTo.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-bold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                    {i + 1}
                  </span>
                  <span className="copy pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl font-bold tracking-tight text-ink dark:text-cream-50"
            >
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-4">
              {content.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border border-cream-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-ink"
                >
                  <summary className="cursor-pointer list-none text-pretty font-semibold text-ink marker:hidden dark:text-white">
                    {faq.question}
                  </summary>
                  <p className="mt-3 copy-justify">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <h2
            id="related-heading"
            className="text-2xl font-bold tracking-tight text-ink dark:text-cream-50"
          >
            More {category?.name.toLowerCase() ?? "tools"}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ToolCard key={item.slug} tool={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
