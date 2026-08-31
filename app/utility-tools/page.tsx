import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { siteUrl } from "@/lib/site";
import { getCategoryBySlug } from "@/lib/tools";

const category = getCategoryBySlug("utility-tools")!;

export const metadata: Metadata = {
  title: "Free Everyday Tools - QR Codes & Passwords",
  description: category.description,
  alternates: { canonical: `${siteUrl}/utility-tools` },
};

export default function Page() {
  return <CategoryPage slug="utility-tools" />;
}
