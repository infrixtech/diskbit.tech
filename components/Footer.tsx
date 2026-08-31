import Link from "next/link";
import Icon from "@/components/Icon";
import { githubUrl, siteName } from "@/lib/site";
import { categories, getToolsByCategory } from "@/lib/tools";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-cream-200 bg-cream-50 dark:border-white/10 dark:bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600 text-cream-50">
                <Icon name="fileText" size={14} />
              </span>
              <span className="font-bold text-ink dark:text-cream-50">{siteName}</span>
            </div>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted dark:text-cream-200">
              Free PDF, photo, and everyday tools. They run in your browser, so
              your files never leave your device.
            </p>
          </div>
          {categories.map((category) => (
            <nav key={category.slug} aria-label={category.name}>
              <h3 className="text-sm font-semibold text-ink dark:text-cream-50">
                <Link href={`/${category.slug}`} className="hover:text-accent-600 dark:hover:text-accent-400">
                  {category.name}
                </Link>
              </h3>
              <ul className="mt-3 space-y-2">
                {getToolsByCategory(category.slug).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="text-sm text-ink-muted transition-colors hover:text-accent-600 dark:text-cream-200 dark:hover:text-accent-400"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-cream-200 pt-6 text-sm text-ink-muted dark:border-white/10 dark:text-cream-200 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} {siteName}. MIT licensed, free forever.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-accent-600 dark:hover:text-accent-400">
              About
            </Link>
            <Link href="/contact" className="hover:text-accent-600 dark:hover:text-accent-400">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-accent-600 dark:hover:text-accent-400">
              Privacy Policy
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-600 dark:hover:text-accent-400"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
