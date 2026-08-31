import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { siteUrl } from "@/lib/site";
import { getCategoryBySlug } from "@/lib/tools";

const category = getCategoryBySlug("pdf-tools")!;

export const metadata: Metadata = {
  title: "Free PDF Tools - Merge, Convert Files, Sign & More",
  description: category.description,
  alternates: { canonical: `${siteUrl}/pdf-tools` },
};

export default function Page() {
  return <CategoryPage slug="pdf-tools" />;
}
