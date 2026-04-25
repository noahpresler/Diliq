import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { resolveCompany } from "@/lib/ai/resolver";
import { Hero } from "@/components/brief/hero";
import { SectionSkeleton } from "@/components/brief/section-skeleton";
import { WhatCard } from "@/components/brief/what-card";
import { FoundersCard } from "@/components/brief/founders-card";
import { NewsCard } from "@/components/brief/news-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const company = await resolveCompany(decodeURIComponent(slug));
    return {
      title: `${company.name} — Diliq`,
      description: `Investment brief on ${company.name}.`,
    };
  } catch {
    return { title: "Company — Diliq" };
  }
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const requested = decodeURIComponent(rawSlug);
  const company = await resolveCompany(requested);

  if (company.slug !== requested) {
    redirect(`/c/${company.slug}`);
  }

  return (
    <main className="relative min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-white/50 transition hover:text-white/90"
        >
          ← Back
        </Link>

        <div className="mt-8">
          <Hero company={company} />
        </div>

        <section className="mt-10 grid gap-4">
          <Suspense fallback={<SectionSkeleton title="What they do" />}>
            <WhatCard slug={company.slug} />
          </Suspense>
          <Suspense
            fallback={<SectionSkeleton title="Founders & key people" />}
          >
            <FoundersCard slug={company.slug} />
          </Suspense>
          <Suspense fallback={<SectionSkeleton title="Recent news" />}>
            <NewsCard slug={company.slug} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
