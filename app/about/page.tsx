import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { githubUrl, siteName, siteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About",
  description:
    `${siteName} is a free, open-source set of PDF, photo, school, and everyday tools that run in your browser. Files never leave your device.`,
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="border-b border-cream-200 pb-8 dark:border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-ink text-balance dark:text-cream-50 sm:text-4xl">
          About {siteName}
        </h1>
        <p className="mt-4 copy-justify text-lg">
          A free set of {tools.length} small tools for PDFs, photos, school work, and everyday
          tasks. Everything runs in your browser. Nothing is uploaded.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section>
          <p className="copy-justify">
            {siteName} exists because merging two PDFs, shrinking a photo, or converting a file
            should not mean installing software, creating an account, or sending private files to
            someone else&apos;s server. The tools are written in plain language so anyone can use
            them, whether they work with files every day or only need help once.
          </p>
        </section>

        <section className="rounded-2xl border border-cream-200 bg-white p-6 dark:border-white/10 dark:bg-ink sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink dark:text-cream-50">
            <Icon name="shield" size={20} className="text-accent-600" />
            Privacy is the whole point
          </h2>
          <p className="mt-3 copy-justify">
            Every tool runs 100% in your browser. When you choose a file, it never leaves your
            device. It is read into memory, processed there, and offered back as a download. There
            is no backend, no file storage, and nothing for us to leak.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Open source and free forever
          </h2>
          <p className="mt-4 copy-justify">
            The entire site is open source under the MIT license. You can read every line of code,
            check the privacy claims yourself, run your own copy, or contribute a new tool. It is
            built with Next.js and deploys as a static site. There are no premium tiers, no locked
            features, and no upsells.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Found a bug or want a new tool?
          </h2>
          <p className="mt-4 copy-justify">
            Open an issue or a pull request on{" "}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
            >
              GitHub
            </a>
            . Adding a tool is straightforward: one registry entry and one React component. If you
            just want to use the tools,{" "}
            <Link
              href="/"
              className="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
            >
              head back to the homepage
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
