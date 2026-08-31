# Diskbit

Free, open-source online tools that run 100% in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)

Diskbit is a privacy-first toolbox of small utilities: PDF tools, image tools, student calculators, and everyday helpers. Every tool runs entirely client-side. Files are processed in your browser's memory and **never uploaded to a server**. There is no backend, no database, no accounts, and no file size paywalls.

## Table of contents

- [Tools](#tools)
- [Why Diskbit](#why-diskbit)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [How to add a new tool](#how-to-add-a-new-tool)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Tools

| Category | Tools |
| --- | --- |
| PDF | Merge, Split, Compress, Images to PDF, File to PDF, PDF to Word, Delete pages, Resize pages, Sign & Watermark |
| Image | Compressor, Resizer, Format converter, Cropper, Remove photo location |
| Student | GPA calculator, Percentage calculator, Age calculator, Unit converter |
| Everyday | QR code generator, Password generator |

## Why Diskbit

Most "free online tools" send your files to a server and cap file sizes to sell you a subscription. Diskbit takes a different approach:

- **Nothing is uploaded.** All processing happens on your device. You can verify this in the DevTools Network tab: no requests fire while a tool works.
- **Open source.** Every line of code is public, so the privacy claims are checkable, not just marketing.
- **No accounts, no limits.** The only size constraint is your own browser's memory. We show a friendly warning above 50 MB.
- **Fast.** Fully static pages, and each tool's libraries load only on that tool's page.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router, fully static output)
- TypeScript and [Tailwind CSS](https://tailwindcss.com/)
- [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation in the browser
- [pdf.js](https://mozilla.github.io/pdf.js/) for reading PDF text and page previews
- [docx](https://docx.js.org/) for building Word files in the browser
- [mammoth](https://github.com/mwilliamson/mammoth.js) and [jsPDF](https://github.com/parallax/jsPDF) for Word to PDF
- [exifr](https://github.com/MikeKovarik/exifr) for spotting hidden photo location data
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) for image compression in a web worker
- [jszip](https://stuk.github.io/jszip/) for ZIP archives when a tool outputs multiple files
- [qrcode](https://github.com/soldair/node-qrcode) for QR codes

No database, no auth, no server-side processing. Deploys to any static host.

## Getting started

Requires Node.js 20.9 or later.

```bash
git clone https://github.com/infrixtech/diskbit.tech
cd diskbit.tech
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To create and serve a production build:

```bash
npm run build
npm start
```

## Configuration

Copy `.env.example` to `.env.local`. The only variable is optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used in the sitemap, canonical tags, and JSON-LD. Defaults to `https://diskbit.tech`. |

Do not put API keys, passwords, or other secrets in the repo. `.env` files are gitignored.

## How to add a new tool

A new tool is **one registry entry plus one component**. Everything else (the homepage card, category page, search index, sitemap entry, and SEO page shell) is generated from the registry.

1. **Register the tool** in [`lib/tools.ts`](lib/tools.ts):

```ts
{
  slug: "my-tool",
  name: "My Tool",
  description: "One sentence used on cards and as the meta description.",
  category: "pdf-tools", // pdf-tools | image-tools | student-tools | utility-tools
  icon: "fileText",      // any icon name from components/Icon.tsx
  keywords: ["my tool", "searchable phrases"],
}
```

2. **Write the SEO content** in [`lib/tool-content.ts`](lib/tool-content.ts): a tagline, an intro paragraph, how-to steps, and FAQs. The FAQs also become FAQPage structured data.

3. **Create the component** at `components/tools/MyTool.tsx`. It must be a client component (`"use client"`) and should reuse the shared building blocks: `FileDropzone`, `DownloadButton`, and the error and result patterns used by the existing tools.

4. **Map the slug to the component** in [`app/tools/[slug]/page.tsx`](app/tools/%5Bslug%5D/page.tsx):

```ts
"my-tool": dynamic(() => import("@/components/tools/MyTool")),
```

Run `npm run build` and `/tools/my-tool` is statically generated with metadata, JSON-LD, and the shared layout.

## Project structure

```
app/                  Routes (homepage, tool pages, categories, about, privacy)
  tools/[slug]/       Statically generated page for every registered tool
  sitemap.ts          Generated from the tool registry
  robots.ts
components/           Shared UI (FileDropzone, ToolLayout, DownloadButton)
  tools/              One component per tool
lib/
  tools.ts            The tool registry. This single file drives everything.
  tool-content.ts     Per-tool SEO copy (how-to steps and FAQs)
  site.ts             Site name and URL configuration
```

## Contributing

Contributions are welcome, from typo fixes to whole new tools. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. In short:

- Tools must run fully client-side, with no network requests during processing.
- `npm run lint` and `npm run build` must pass.
- Reuse the shared components so the UI stays consistent.

## Security

The attack surface is intentionally small: static pages, no server code, no stored data. If you find a security issue anyway (for example an XSS vector or a dependency vulnerability), please open a GitHub issue, or report it privately via GitHub security advisories if it is sensitive.

## License

[MIT](LICENSE). Free to use, copy, modify, and self-host.
