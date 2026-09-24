// ── Metadata за всяка страница — title, description, canonical, OG, robots ───
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export function ogImage(title: string, eyebrow?: string) {
	const q = new URLSearchParams({ t: title.slice(0, 90), ...(eyebrow ? { e: eyebrow.slice(0, 60) } : {}) });
	return `/og?${q.toString()}`;
}

export function pageMeta(o: { title: string; description?: string; path: string; ogTitle?: string; eyebrow?: string; index?: boolean; type?: "website" | "article"; published?: string; modified?: string }): Metadata {
	const img = ogImage(o.ogTitle || o.title.replace(/\s*[|—]\s*Digital Effect.*$/, ""), o.eyebrow);
	return {
		title: o.title,
		description: o.description,
		alternates: { canonical: o.path },
		openGraph: {
			type: o.type || "website",
			url: `${SITE.url}${o.path}`,
			title: o.title,
			description: o.description,
			siteName: SITE.name,
			locale: "bg_BG",
			images: [{ url: img, width: 1200, height: 630, alt: o.ogTitle || o.title }],
			...(o.type === "article" ? { publishedTime: o.published, modifiedTime: o.modified, authors: [SITE.founder.name] } : {}),
		},
		twitter: { card: "summary_large_image", title: o.title, description: o.description, images: [img] },
		...(o.index === false ? { robots: { index: false, follow: true } } : {}),
	};
}
