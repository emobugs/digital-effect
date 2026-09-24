// ── Страниците и ресурсите от de-os (панел „Сайт и цени“) ────────────────────
// de-os /api/site-content → кеш таг "deos-content" (de-os вика /api/revalidate
// след запис) → fallback src/data/content.fallback.json (същият файл като
// de-os lib/site/default-content.json).
import fallbackJson from "@/data/content.fallback.json";
import { deosApi } from "@/lib/services";

export type PageType = "service" | "industry" | "city";
export type SceneModule = "ads" | "smm" | "web" | "ai" | "growth";

export interface PageData {
	title: string;
	module?: SceneModule;
	serviceIds?: string[];
	seoTitle?: string;
	metaDescription?: string;
	eyebrow?: string;
	h1: string;
	lead?: string;
	summary?: string;
	city?: string;
	benefits?: { title: string; text: string; stat?: string }[];
	compareLabels?: { them: string; us: string };
	compare?: { topic: string; them: string; us: string }[];
	process?: { when?: string; title: string; text: string }[];
	faq?: { q: string; a: string }[];
	caseSlug?: string | null;
	resourceSlug?: string | null;
	related?: string[];
	indexable?: boolean;
}
export interface SitePage { slug: string; type: PageType; sort: number; published?: boolean; updatedAt?: string | null; data: PageData }

export interface ResourceData {
	code?: string;
	title: string;
	short?: string;
	description?: string;
	outcome?: string;
	returnReason?: string;
	href?: string | null;
	cta?: string;
	services?: string[];
	homepage?: boolean;
	visual?: string;
}
export interface SiteResource { slug: string; status: "live" | "soon" | "hidden"; sort: number; updatedAt?: string | null; data: ResourceData }

export interface SiteContent { source: "supabase" | "fallback"; pages: SitePage[]; resources: SiteResource[] }

const FALLBACK = fallbackJson as unknown as { pages: SitePage[]; resources: SiteResource[] };

export function fallbackContent(): SiteContent {
	return {
		source: "fallback",
		pages: FALLBACK.pages.filter((p) => p.published !== false),
		resources: FALLBACK.resources.filter((r) => r.status !== "hidden"),
	};
}

export async function getSiteContent(): Promise<SiteContent> {
	try {
		const r = await fetch(`${deosApi()}/site-content`, {
			headers: { Origin: "https://digitaleffect.bg" },
			next: { revalidate: 300, tags: ["deos-content"] },
			signal: AbortSignal.timeout(6000),
		});
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		const j = (await r.json()) as SiteContent;
		if (!Array.isArray(j.pages) || !j.pages.length) throw new Error("празно съдържание");
		return { source: j.source, pages: j.pages, resources: j.resources || [] };
	} catch (e) {
		// Преди деплоя на de-os v2 endpoint-ът го няма → 404 → fallback. Нормално.
		if (process.env.NODE_ENV !== "production") console.warn("[content] fallback:", e instanceof Error ? e.message : e);
		return fallbackContent();
	}
}

export function pagePath(p: Pick<SitePage, "type" | "slug">) {
	if (p.type === "industry") return `/za/${p.slug}`;
	if (p.type === "city") return `/marketing-agencia/${p.slug}`;
	return `/uslugi/${p.slug}`;
}

export async function getPage(type: PageType, slug: string) {
	const c = await getSiteContent();
	return c.pages.find((p) => p.type === type && p.slug === slug) || null;
}

export async function getResource(slug: string) {
	const c = await getSiteContent();
	return c.resources.find((r) => r.slug === slug) || null;
}
