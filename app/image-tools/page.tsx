import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { siteUrl } from "@/lib/site";
import { getCategoryBySlug } from "@/lib/tools";

const category = getCategoryBySlug("image-tools")!;

export const metadata: Metadata = {
  title: "Free Image Tools - Compress, Crop & Remove Location",
  description: category.description,
  alternates: { canonical: `${siteUrl}/image-tools` },
};

export default function Page() {
  return <CategoryPage slug="image-tools" />;
}
