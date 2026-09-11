// ── Ценоразписът на Digital Effect — ЕДИН източник за сайта ────────────────
// Цените живеят в de-os (Supabase, панел /services). Сайтът ги дърпа от
// deos.digitaleffect.bg/api/services с ISR (5 мин) и има вграден fallback
// (src/data/services.fallback.json), за да не остане никога без цени.
// Никъде в сайта не се пишат цифри на ръка — само оттук.
import fallbackJson from "@/data/services.fallback.json";

export type ServiceKind = "fee_budget" | "choice" | "tiers" | "flat" | "one_time" | "quote";

export interface PublicService {
	id: string;
	sort: number;
	name: string;
	short: string;
	description: string;
	kind: ServiceKind;
	price: { from: number | null; pctOfBudget?: number; monthly: boolean };
	sitePrice: string | null;
	sitePricePrefix: string;
	sitePriceLabel: string;
	badge: string | null;
	siteFeatures: string[];
	options?: { id: string; label: string; price: number }[];
	tiers?: { label: string; price: number }[];
}

export interface PublicCatalog {
	source: "supabase" | "fallback";
	fetchedAt: string | null;
	currency: string;
	services: PublicService[];
}

type FallbackService = PublicService & { siteVisible: boolean; helloVisible: boolean };
const FALLBACK = fallbackJson as unknown as { currency: string; services: FallbackService[] };

export const deosApi = () => (process.env.DEOS_API_URL?.trim() || "https://deos.digitaleffect.bg/api").replace(/\/$/, "");

/** Синхронен fallback (клиентски компоненти без данни от сървъра). */
export function fallbackCatalog(forHello: boolean): PublicCatalog {
	return {
		source: "fallback",
		fetchedAt: null,
		currency: FALLBACK.currency || "€",
		services: FALLBACK.services
			.filter((s) => (forHello ? s.helloVisible : s.siteVisible))
			.map(({ siteVisible, helloVisible, ...s }) => { void siteVisible; void helloVisible; return s; }),
	};
}

/** Сървърно: каталогът за сайта (ценови секции) или за /hello (изборът на услуги). */
export async function getCatalog(forHello = false): Promise<PublicCatalog> {
	try {
		const r = await fetch(`${deosApi()}/services${forHello ? "?for=hello" : ""}`, {
			headers: { Origin: "https://digitaleffect.bg" },
			next: { revalidate: 300 },
		});
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		const j = (await r.json()) as PublicCatalog;
		if (!Array.isArray(j.services) || !j.services.length) throw new Error("празен каталог");
		return j;
	} catch (e) {
		console.warn("[services] de-os недостъпен, fallback:", e instanceof Error ? e.message : e);
		return fallbackCatalog(forHello);
	}
}

/* ── Картите в секция „Пакети“ ─────────────────────────────────────────── */
export interface PackageCard {
	id: string;
	name: string;
	tagline: string;
	price: string | null;
	pricePrefix: string;
	priceLabel: string;
	badge: string | null;
	accent: "orange" | "violet";
	gradient: string;
	description: string;
	features: string[];
	monthly: boolean;
}

const GRADIENTS = [
	"from-[#e8450a] via-[#f26522] to-[#f59c1a]",
	"from-[#c0300a] via-[#e8450a] to-[#f59c1a]",
	"from-[#c0300a] via-[#e8450a] to-[#f26522]",
];
const VIOLET = "from-[#0f0f1a] via-[#1a0a2e] to-[#2d1060]";

export function toPackageCards(cat: PublicCatalog): PackageCard[] {
	let i = 0;
	return [...cat.services]
		.sort((a, b) => a.sort - b.sort)
		.map((s) => {
			const quote = s.kind === "quote";
			return {
				id: s.id,
				name: s.name,
				tagline: s.short,
				price: quote ? null : s.sitePrice,
				pricePrefix: s.sitePricePrefix || "",
				priceLabel: s.sitePriceLabel || (s.price.monthly ? "/ месец" : ""),
				badge: s.badge,
				accent: quote ? "violet" : "orange",
				gradient: quote ? VIOLET : GRADIENTS[i++ % GRADIENTS.length],
				description: s.description,
				features: s.siteFeatures,
				monthly: s.price.monthly,
			};
		});
}
