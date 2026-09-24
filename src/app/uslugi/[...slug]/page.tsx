// ── /uslugi/<slug…> — страниците за услуги (съдържание от de-os) ─────────────
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageView from "@/components/page/ServicePageView";
import { getSiteContent, pagePath } from "@/lib/content";
import { getCatalog } from "@/lib/services";
import { pageMeta } from "@/lib/meta";

export const revalidate = 300;
export const dynamicParams = true;

type Params = Promise<{ slug: string[] }>;

export async function generateStaticParams() {
	const c = await getSiteContent();
	return c.pages.filter((p) => p.type === "service").map((p) => ({ slug: p.slug.split("/") }));
}

async function load(slug: string[]) {
	const c = await getSiteContent();
	const page = c.pages.find((p) => p.type === "service" && p.slug === slug.join("/"));
	return { c, page };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const { page } = await load(slug);
	if (!page) return {};
	const d = page.data;
	return pageMeta({ title: d.seoTitle || d.h1, description: d.metaDescription, path: pagePath(page), ogTitle: d.h1, eyebrow: d.eyebrow, index: d.indexable !== false });
}

export default async function ServicePage({ params }: { params: Params }) {
	const { slug } = await params;
	const [{ c, page }, catalog] = await Promise.all([load(slug), getCatalog(false)]);
	if (!page) notFound();
	const crumbs = [{ name: "Услуги", href: "/uslugi" }];
	if (slug.length > 1) {
		const parent = c.pages.find((p) => p.type === "service" && p.slug === slug.slice(0, -1).join("/"));
		if (parent) crumbs.push({ name: parent.data.title, href: pagePath(parent) });
	}
	crumbs.push({ name: page.data.title, href: pagePath(page) });
	return <ServicePageView page={page} catalog={catalog} content={c} crumbs={crumbs} />;
}
