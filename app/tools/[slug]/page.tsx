import type { Metadata } from "next";
import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import ToolLayout from "@/components/ToolLayout";
import { siteUrl, siteName } from "@/lib/site";
import { toolContent } from "@/lib/tool-content";
import { getToolBySlug, tools } from "@/lib/tools";
import { jsonLdString } from "@/lib/utils";

const componentBySlug: Record<string, ComponentType> = {
  "merge-pdf": dynamic(() => import("@/components/tools/MergePdf")),
  "split-pdf": dynamic(() => import("@/components/tools/SplitPdf")),
  "compress-pdf": dynamic(() => import("@/components/tools/CompressPdf")),
  "images-to-pdf": dynamic(() => import("@/components/tools/ImagesToPdf")),
  "word-to-pdf": dynamic(() => import("@/components/tools/WordToPdf")),
  "pdf-to-word": dynamic(() => import("@/components/tools/PdfToWord")),
  "delete-pdf-pages": dynamic(() => import("@/components/tools/DeletePdfPages")),
  "resize-pdf-pages": dynamic(() => import("@/components/tools/ResizePdfPages")),
  "stamp-pdf": dynamic(() => import("@/components/tools/StampPdf")),
  "image-compressor": dynamic(() => import("@/components/tools/ImageCompressor")),
  "image-resizer": dynamic(() => import("@/components/tools/ImageResizer")),
  "image-converter": dynamic(() => import("@/components/tools/ImageConverter")),
  "image-cropper": dynamic(() => import("@/components/tools/ImageCropper")),
  "remove-photo-location": dynamic(() => import("@/components/tools/RemovePhotoLocation")),
  "gpa-calculator": dynamic(() => import("@/components/tools/GpaCalculator")),
  "percentage-calculator": dynamic(() => import("@/components/tools/PercentageCalculator")),
  "age-calculator": dynamic(() => import("@/components/tools/AgeCalculator")),
  "unit-converter": dynamic(() => import("@/components/tools/UnitConverter")),
  "qr-code-generator": dynamic(() => import("@/components/tools/QrCodeGenerator")),
  "password-generator": dynamic(() => import("@/components/tools/PasswordGenerator")),
};

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const title = `${tool.name} - Free, Private, No Upload`;
  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: `${siteUrl}/tools/${tool.slug}` },
    openGraph: {
      title,
      description: tool.description,
      url: `${siteUrl}/tools/${tool.slug}`,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  const ToolComponent = componentBySlug[slug];
  if (!tool || !ToolComponent) notFound();

  const content = toolContent[tool.slug];

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: `${siteUrl}/tools/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const faqJsonLd = content
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(softwareJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
        />
      )}
      <ToolLayout tool={tool}>
        <ToolComponent />
      </ToolLayout>
    </>
  );
}
