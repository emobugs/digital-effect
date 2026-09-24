// ── Ценоразписът на Digital Effect — ЕДИН източник за сайта ────────────────
// Цените живеят в de-os (Supabase, панел „Сайт и цени“). Сайтът ги дърпа от
// deos.digitaleffect.bg/api/services с кеш таг "deos-catalog": de-os вика
// /api/revalidate след всеки запис → новите цени са на сайта за секунди
// (иначе до 5 мин). Вграден fallback (src/data/services.fallback.json), за да
// не остане никога без цени. Никъде в сайта не се пишат цифри на ръка.
import fallbackJson from "@/data/services.fallback.json";
import { feeFor, type PctTier } from "@/lib/fees";

export type ServiceKind = "fee_budget" | "choice" | "tiers" | "flat" | "one_time" | "quote";
export type ServiceCategory = "reklama" | "smm" | "web" | "ai" | "growth";

export interface ServiceOption { id: string; label: string; price: number; desc?: string; features?: string[]; popular?: boolean; badge?: string | null }
export interface ServiceTier { label: string; price: number; desc?: string; features?: string[]; popular?: boolean }

export interface PublicService {
	id: string;
	sort: number;
	name: string;
	short: string;
	description: string;
	kind: ServiceKind;
	category?: ServiceCategory | null;
	price: { from: number | null; fixed?: number; pctOfBudget?: number; monthly: boolean };
	priceMax?: number | null;
	priceNote?: string | null;
	sitePrice: string | null;
	sitePricePrefix: string;
	sitePriceLabel: string;
	badge: string | null;
	highlight?: boolean;
	siteFeatures: string[];
	pctTiers?: PctTier[];
	setup?: { min: number; max: number };
	budget?: { min: number; max: number; step: number; default: number };
	includes?: string[];
	compareAt?: number;
	options?: ServiceOption[];
	tiers?: ServiceTier[];
}

export interface PublicCatalog {
	source: "supabase" | "fallback";
	fetchedAt: string | null;
	currency: string;
	pilot?: { days: number; headline: string; text: string };
	services: PublicService[];
}

type FallbackService = PublicService & { siteVisible: boolean; helloVisible: boolean };
const FALLBACK = fallbackJson as unknown as { currency: string; pilot?: PublicCatalog["pilot"]; services: FallbackService[] };

export const deosApi = () => (process.env.DEOS_API_URL?.trim() || "https://deos.digitaleffect.bg/api").replace(/\/$/, "");

/** Синхронен fallback (клиентски компоненти без данни от сървъра). */
export function fallbackCatalog(forHello: boolean): PublicCatalog {
	return {
		source: "fallback",
		fetchedAt: null,
		currency: FALLBACK.currency || "€",
		pilot: FALLBACK.pilot,
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
			next: { revalidate: 300, tags: ["deos-catalog"] },
			signal: AbortSignal.timeout(6000),
		});
		if (!r.ok) throw new Error(`HTTP ${r.status}`);
		const j = (await r.json()) as PublicCatalog;
		if (!Array.isArray(j.services) || !j.services.length) throw new Error("празен каталог");
		// Старият de-os (преди v2) не праща category/pilot — допълваме от fallback-а
		return withFallbackMeta(j, forHello);
	} catch (e) {
		console.warn("[services] de-os недостъпен, fallback:", e instanceof Error ? e.message : e);
		return fallbackCatalog(forHello);
	}
}

function withFallbackMeta(j: PublicCatalog, forHello: boolean): PublicCatalog {
	const fb = fallbackCatalog(forHello);
	const byId = Object.fromEntries(fb.services.map((s) => [s.id, s]));
	return {
		...j,
		pilot: j.pilot?.headline ? j.pilot : fb.pilot,
		services: j.services.map((s) => ({ ...byId[s.id], ...s, category: s.category ?? byId[s.id]?.category ?? null })),
	};
}

/* ── помощни ─────────────────────────────────────────────────────────────── */
export const byCategory = (cat: PublicCatalog, c: ServiceCategory) => cat.services.filter((s) => s.category === c).sort((a, b) => a.sort - b.sort);
export const byIds = (cat: PublicCatalog, ids: string[]) => ids.map((id) => cat.services.find((s) => s.id === id)).filter(Boolean) as PublicService[];

const n = (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Най-ниската цена като число (за „от €X“ и schema.org). */
export function fromPrice(s: PublicService): number | null {
	if (s.kind === "fee_budget" && s.pctTiers?.length) return feeFor({ fixed: s.price.fixed ?? 150, pctTiers: s.pctTiers }, s.budget?.min ?? 0);
	return s.price.from;
}

/** Главният ред на цената: { prefix, value, suffix } — от полетата за сайта или сметнат. */
export function priceParts(s: PublicService): { prefix: string; value: string; suffix: string } {
	if (s.sitePrice) return { prefix: s.sitePricePrefix || "", value: s.sitePrice.startsWith("€") ? s.sitePrice : `€${s.sitePrice}`, suffix: s.sitePriceLabel || (s.price.monthly ? "/ месец" : "") };
	if (s.kind === "quote" || s.price.from == null) return { prefix: "", value: "По запитване", suffix: "" };
	const from = fromPrice(s) ?? 0;
	const range = s.priceMax ? `€${n(from)}–${n(s.priceMax)}` : `€${n(from)}`;
	return { prefix: s.priceMax ? "" : "от", value: range, suffix: s.price.monthly ? "/ месец" : "еднократно" };
}

export const CATEGORY_META: Record<ServiceCategory, { label: string; href: string; module: "ads" | "smm" | "web" | "ai" | "growth" }> = {
	reklama: { label: "Реклама", href: "/uslugi/reklama", module: "ads" },
	smm: { label: "Социални мрежи", href: "/uslugi/socialni-mrezhi", module: "smm" },
	web: { label: "Сайтове", href: "/uslugi/izrabotka-na-sait", module: "web" },
	ai: { label: "AI и автоматизация", href: "/uslugi/ai-avtomatizacia", module: "ai" },
	growth: { label: "Growth Partner", href: "/uslugi/growth-partner", module: "growth" },
};

/** Цените за „Сглоби си ефекта“ — от каталога, с резервни стойности от v2. */
export function configPrices(cat: PublicCatalog) {
	const get = (id: string) => cat.services.find((s) => s.id === id);
	const opt = (id: string, o: string, d: number) => get(id)?.options?.find((x) => x.id === o)?.price ?? d;
	const ads = get("meta_ads") || get("google_ads");
	return {
		adsFixed: ads?.price.fixed ?? 150,
		pctTiers: ads?.pctTiers?.length ? ads.pctTiers : [{ upTo: 1000, pct: 10 }, { upTo: 5000, pct: 8 }, { upTo: 10000, pct: 6 }, { upTo: null, pct: 5 }],
		setupMin: ads?.setup?.min ?? 50,
		setupMax: ads?.setup?.max ?? 150,
		smmGrowth: opt("smm", "smm_growth", 299),
		smmScale: opt("smm", "smm_scale", 449),
		landing: get("web_landing")?.price.from ?? 449,
		website: get("website")?.price.from ?? 799,
		custom: get("web_custom")?.price.from ?? 1190,
		advanced: get("web_advanced")?.price.from ?? 1490,
		chatbot: get("ai_chatbot")?.price.from ?? 290,
		growthPartner: get("growth_partner")?.price.from ?? 790,
		growthCompare: get("growth_partner")?.compareAt ?? 937,
	};
}
