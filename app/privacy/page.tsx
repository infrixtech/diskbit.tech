import type { Metadata } from "next";
import { githubUrl, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    `${siteName}'s privacy policy: your files are processed in your browser and never uploaded.`,
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="border-b border-cream-200 pb-8 dark:border-white/10">
        <h1 className="text-3xl font-bold tracking-tight text-ink text-balance dark:text-cream-50 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-muted dark:text-cream-200">Last updated: September 1, 2026</p>
      </header>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Your files never leave your device
          </h2>
          <p className="mt-4 copy-justify">
            Every tool on {siteName} runs entirely in your web browser. Files you select, whether
            PDFs, images, or anything else, are read into your browser&apos;s memory, processed
            locally by JavaScript, and offered back as a download. They are{" "}
            <strong className="font-semibold text-ink dark:text-cream-50">never uploaded</strong> to
            our servers or to any third party, and we could not access them even if we wanted to.
            Text you type into the calculators is likewise processed in memory only and disappears
            when you close the page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Data we do not collect
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 copy">
            <li>We do not require accounts, and we never ask for your name or email address.</li>
            <li>We do not store, log, or inspect the contents of your files or text.</li>
            <li>We do not sell any data to anyone.</li>
            <li>This project does not include advertising or ad-tracking scripts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Local storage
          </h2>
          <p className="mt-4 copy-justify">
            The site stores a single preference in your browser&apos;s local storage: your light or
            dark theme choice. This value stays on your device and is not transmitted to us. Light
            is the default. Dark is only used if you turn it on.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Hosting and basic logs
          </h2>
          <p className="mt-4 copy-justify">
            The site is served as static files by the hosting provider, which may keep standard
            server logs (IP address, user agent, requested page) for security and operational
            purposes, as virtually all web hosts do. These logs are not linked to any tool usage,
            because tool processing happens on your device and generates no extra requests.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Open source
          </h2>
          <p className="mt-4 copy-justify">
            {siteName} is open source. You can read the code, run your own copy, and check that files
            are not uploaded. The history of this policy is public in the repository.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Children&apos;s privacy
          </h2>
          <p className="mt-4 copy-justify">
            {siteName} does not knowingly collect personal information from anyone, including children
            under 13. The site collects no personal information at all.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Changes to this policy
          </h2>
          <p className="mt-4 copy-justify">
            If this policy changes, the updated version will be published on this page with a new
            &quot;last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink text-balance dark:text-cream-50">
            Contact
          </h2>
          <p className="mt-4 copy-justify">
            Questions about this policy? Open an issue on{" "}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
            >
              GitHub
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
