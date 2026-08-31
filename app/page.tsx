import Icon from "@/components/Icon";
import HomeSearch from "@/components/HomeSearch";
import { siteUrl, siteName, siteDescription } from "@/lib/site";
import { jsonLdString } from "@/lib/utils";

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(websiteJsonLd) }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <section className="py-14 text-center sm:py-20">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-accent-400 bg-accent-50 px-4 py-1.5 text-sm font-semibold text-accent-800 dark:border-accent-500 dark:bg-accent-900/40 dark:text-accent-200">
              <Icon name="shield" size={16} />
              Private by design. Files stay on your device.
            </p>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-ink text-balance dark:text-cream-50 sm:text-5xl">
              Everyday tools, without the upload
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-ink-muted dark:text-cream-200">
              {siteName} helps you merge PDFs, turn files into PDFs, crop photos, make a password,
              and more. Free, open source, and built so anyone can use them. No account required.
            </p>
          </section>

          <section aria-label="All tools" className="pb-10">
            <HomeSearch />
          </section>
      </div>
    </>
  );
}
