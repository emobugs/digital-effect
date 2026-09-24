// ── Схема v2 на офертата — обща с de-os (lib/oferta/build.js) и с офлайн
// шаблона (бизнеси/_oferta-template). Промяна тук = промяна и там.

export type FeatureIcon = "check" | "gift";
export interface OfferFeature { icon: FeatureIcon; html: string }

export interface OfferBudget {
	sectionTitle?: string;
	label: string;
	note?: string;
	min: number;
	max: number;
	step?: number;
	default: number;
}

export interface OfferPackage {
	id: string;
	title: string;
	subtitle?: string;
	priceLabel: string;
	totalRowLabel?: string;
	/** pctTiers = стъпаловиден % (09.2026); без него — стар плосък pctOfBudget */
	fee: { fixed: number; pctOfBudget?: number; pctTiers?: { upTo: number | null; pct: number }[] | null };
	oldFixed?: number;
	discountPct?: number;
	optional?: boolean;
	defaultOn?: boolean;
	highlight?: boolean;
	badge?: string;
	budget?: OfferBudget;
	features: OfferFeature[];
}

export interface OfferOption { id: string; label: string; desc?: string; price: number; oldPrice?: number }
export interface OfferChoiceGroup { id: string; title?: string; noneLabel?: string; note?: string; highlight?: boolean; badge?: string; /** id на опцията, маркирана при отваряне; иначе стартира на „Без“ */ defaultOption?: string; options: OfferOption[] }
export interface OfferTier { label: string; desc?: string; price: number; oldPrice?: number }
export interface OfferTierGroup { id: string; title: string; noneLabel?: string; note?: string; highlight?: boolean; badge?: string; /** начална позиция на слайдера: 0 = „Без“, 1 = първото ниво */ defaultIndex?: number; tiers: OfferTier[] }
export interface OfferCheckbox { id: string; label: string; desc?: string; price: number; oldPrice?: number; defaultOn?: boolean; highlight?: boolean; badge?: string }
export interface OfferCounter { id: string; label: string; desc?: string; unit: number }
/** `optional: true` → чекбокс; влиза в сумата и в договора само когато е отметнат. */
export interface OfferOneTime { id: string; label: string; desc?: string; price: number; oldPrice?: number; badge?: string; optional?: boolean; defaultOn?: boolean }

export interface OfferData {
	version?: number;
	theme?: string;
	docTitle?: string;
	eyebrow?: string;
	brandTitle: string;
	tagline?: string;
	calcTitle?: string;
	calcSubtitle?: string;
	addonsTitle?: string;
	/** Стар формат (v1): един пакет + бюджет на първо ниво. */
	base?: Omit<OfferPackage, "id"> & { id?: string };
	budget?: OfferBudget;
	packages?: OfferPackage[];
	choiceGroups?: OfferChoiceGroup[];
	tierGroups?: OfferTierGroup[];
	checkboxes?: OfferCheckbox[];
	counters?: OfferCounter[];
	oneTime?: OfferOneTime[];
	totalLabels?: { agency?: string; budget?: string; grand?: string; oneTime?: string };
	infoNotes?: string[];
	commitment?: string;
	footerLine?: string;
	validUntil?: string;
	client?: { name?: string; contact?: string; email?: string; phone?: string };
}

/** v1 → v2: `base` + `budget` стават packages[0]. */
export function normalizeOffer(d: OfferData): OfferData & { packages: OfferPackage[] } {
	if (d.packages?.length || !d.base) return { ...d, packages: d.packages ?? [] };
	const { base, budget, ...rest } = d;
	return { ...rest, packages: [{ id: base.id ?? "base", defaultOn: true, ...base, budget: base.budget ?? budget }] };
}
