// ── /sitemap.xml — генерира се от съдържанието в de-os (lastmod = updated_at) ─
// Влизат само индексируемите страници; черновите и „В Google: изкл.“ — не.
import type { MetadataRoute } from "next";
import { getSiteContent, pagePath } from "@/lib/content";
import { CASES } from "@/data/cases";
import { ARTICLES } from "@/data/articles";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const c = await getSiteContent();
	const now = new Date();
	const u = (path: string, priority: number, lastModified: Date | string = now, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({ url: `${SITE.url}${path}`, lastModified, changeFrequency, priority });
	return [
		u("/", 1, now, "weekly"),
		u("/uslugi", 0.9),
		u("/ceni", 0.9, now, "weekly"),
		...c.pages.filter((p) => p.data.indexable !== false).map((p) => u(pagePath(p), p.type === "service" ? (p.slug.includes("/") ? 0.8 : 0.9) : 0.7, p.updatedAt || now)),
		u("/rezultati", 0.7),
		...CASES.map((x) => u(`/rezultati/${x.slug}`, 0.6)),
		u("/resursi", 0.7),
		...c.resources.filter((r) => r.status === "live").map((r) => u(`/resursi/${r.slug}`, 0.6)),
		u("/radar", 0.7),
		u("/znanie", 0.6),
		...ARTICLES.map((a) => u(`/znanie/${a.slug}`, 0.7, a.updated)),
		u("/za-nas", 0.6),
		u("/kontakti", 0.6),
		u("/partners", 0.4),
	];
}
