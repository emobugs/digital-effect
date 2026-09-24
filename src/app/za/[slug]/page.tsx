// ── /za/<slug> — страница тип „industry“ (съдържание от de-os) ──
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageView from "@/components/page/ServicePageView";
import { getSiteContent, pagePath } from "@/lib/content";
import { getCatalog } from "@/lib/services";
import { pageMeta } from "@/lib/meta";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	const c = await getSiteContent();
	return c.pages.filter((p) => p.type === "industry").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const c = await getSiteContent();
	const page = c.pages.find((p) => p.type === "industry" && p.slug === slug);
	if (!page) return {};
	const d = page.data;
	return pageMeta({ title: d.seoTitle || d.h1, description: d.metaDescription, path: pagePath(page), ogTitle: d.h1, eyebrow: d.eyebrow, index: d.indexable !== false });
}

export default async function Page({ params }: { params: Params }) {
	const { slug } = await params;
	const [c, catalog] = await Promise.all([getSiteContent(), getCatalog(false)]);
	const page = c.pages.find((p) => p.type === "industry" && p.slug === slug);
	if (!page) notFound();
	return <ServicePageView page={page} catalog={catalog} content={c} crumbs={[{ name: "За кого", href: "/uslugi#industry" }, { name: page.data.title, href: pagePath(page) }]} />;
}
