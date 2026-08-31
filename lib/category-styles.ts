import type { CategorySlug } from "@/lib/tools";

export const categoryTint: Record<
  CategorySlug,
  { icon: string; idle: string; chip: string; ring: string }
> = {
  "pdf-tools": {
    icon: "bg-accent-50 text-accent-700 dark:bg-white/10 dark:text-accent-300",
    idle: "bg-accent-50 text-accent-700 dark:bg-white/10 dark:text-accent-300",
    chip: "border border-cream-200 bg-white text-accent-700 hover:bg-accent-50 dark:border-white/15 dark:bg-ink dark:text-accent-300 dark:hover:bg-white/10",
    ring: "hover:border-accent-400 dark:hover:border-accent-500",
  },
  "image-tools": {
    icon: "bg-cream-200 text-ink dark:bg-white/10 dark:text-cream-100",
    idle: "bg-cream-200 text-ink dark:bg-white/10 dark:text-cream-100",
    chip: "border border-cream-200 bg-white text-ink hover:bg-cream-200 dark:border-white/15 dark:bg-ink dark:text-cream-100 dark:hover:bg-white/10",
    ring: "hover:border-cream-200 dark:hover:border-white/20",
  },
  "student-tools": {
    icon: "bg-white text-ink-muted dark:bg-white/10 dark:text-cream-200",
    idle: "bg-white text-ink-muted dark:bg-white/10 dark:text-cream-200",
    chip: "border border-cream-200 bg-white text-ink-muted hover:bg-cream-50 dark:border-white/15 dark:bg-ink dark:text-cream-200 dark:hover:bg-white/10",
    ring: "hover:border-ink-muted dark:hover:border-white/20",
  },
  "utility-tools": {
    icon: "bg-accent-100 text-accent-800 dark:bg-white/10 dark:text-accent-200",
    idle: "bg-accent-100 text-accent-800 dark:bg-white/10 dark:text-accent-200",
    chip: "border border-cream-200 bg-white text-accent-800 hover:bg-accent-50 dark:border-white/15 dark:bg-ink dark:text-accent-200 dark:hover:bg-white/10",
    ring: "hover:border-accent-300 dark:hover:border-accent-600",
  },
};
