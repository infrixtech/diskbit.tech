import Link from "next/link";
import ToolCard from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export default function NotFound() {
  const popular = tools.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink text-balance dark:text-cream-50 sm:text-4xl">
        This page does not exist
      </h1>
      <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-ink-muted dark:text-cream-200">
        The page you are looking for may have moved or never existed. Head back home, or try one of
        these popular tools.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
      >
        Back to all tools
      </Link>
      <div className="mx-auto mt-14 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {popular.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
