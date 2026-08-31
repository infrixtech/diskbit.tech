import type { Metadata } from "next";
import CategoryPage from "@/components/CategoryPage";
import { siteUrl } from "@/lib/site";
import { getCategoryBySlug } from "@/lib/tools";

const category = getCategoryBySlug("student-tools")!;

export const metadata: Metadata = {
  title: "Free Student Tools - GPA, Percentage, Age & Unit Converter",
  description: category.description,
  alternates: { canonical: `${siteUrl}/student-tools` },
};

export default function Page() {
  return <CategoryPage slug="student-tools" />;
}
