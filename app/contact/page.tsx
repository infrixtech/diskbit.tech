import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  contactEmail,
  githubIssuesUrl,
  siteName,
  siteUrl,
} from "@/lib/site";
import { jsonLdString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: `Questions about ${siteName}? Open a GitHub issue, email ${contactEmail}, or ask about a private copy for your organization.`,
  alternates: { canonical: `${siteUrl}/contact` },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${siteName}`,
    url: `${siteUrl}/contact`,
    description: `How to reach ${siteName} for questions, bugs, or a private copy of the tools.`,
    mainEntity: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      email: contactEmail,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: contactEmail,
          url: githubIssuesUrl,
        },
      ],
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <header className="border-b border-cream-200 pb-8 dark:border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-ink text-balance dark:text-cream-50 sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-4 copy text-lg">
          A question, a bug, or a private copy of the tools, here is how to reach us.
        </p>
      </header>

      <div className="mt-10 space-y-6">
        <section className="rounded-2xl border border-cream-200 bg-white p-6 dark:border-white/10 dark:bg-ink sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink dark:text-cream-50">
            <Icon name="github" size={20} className="text-accent-600" />
            Open a GitHub issue
          </h2>
          <p className="mt-3 copy-justify">
            If you have a question, found a bug, or have an idea for a new tool, open an issue on
            our GitHub. That is the best place for things other people may also want to see.
          </p>
          <a
            href={githubIssuesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center rounded-xl bg-accent-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-700"
          >
            Open an issue
          </a>
        </section>

        <section className="rounded-2xl border border-cream-200 bg-white p-6 dark:border-white/10 dark:bg-ink sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink dark:text-cream-50">
            <Icon name="mail" size={20} className="text-accent-600" />
            Email us
          </h2>
          <p className="mt-3 copy-justify">
            Prefer a private note? Write to us at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
            >
              {contactEmail}
            </a>
            . Use this for questions you would rather not post in public.
          </p>
        </section>

        <section className="rounded-2xl border border-cream-200 bg-white p-6 dark:border-white/10 dark:bg-ink sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink dark:text-cream-50">
            <Icon name="shield" size={20} className="text-accent-600" />
            A copy for your work
          </h2>
          <p className="mt-3 copy-justify">
            We can customize {siteName} for your own work and help you run it on a private site
            for your organization. Your files can stay inside your own setup. Email{" "}
            <a
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Private ${siteName} for our organization`)}`}
              className="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
            >
              {contactEmail}
            </a>{" "}
            and we can talk it through.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-ink-muted dark:text-cream-200">
        Looking for a tool instead?{" "}
        <Link
          href="/"
          className="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
        >
          Back to all tools
        </Link>
        .
      </p>
    </article>
  );
}
