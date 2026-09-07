// ── Digital Effect Partners — публичните параметри на програмата ────────────
// Източникът на истината са настройките в de-os (панел → Партньори →
// Настройки). Страниците ги теглят сървърно през `loadProgram()`
// (src/lib/partners-program.ts, кеш 10 мин). PROGRAM тук е само FALLBACK —
// ако de-os не отговори, страницата показва тези стойности вместо да падне.
// Дръж го в синхрон с DEFAULT_SETTINGS в de-os/lib/partners.js.

export type Tier = { min: number; rate: number };
export type ProjectTier = { max: number | null; rate: number };
export type Program = {
	tiers: Tier[];
	projectTiers: ProjectTier[];
	level2Rate: number;
	months: number;
	minPayout: number;
	creditBonus: number;
	payoutDay: number;
	attributionDays: number;
	manualLeadDays: number;
	/** откъде са числата — "deos" (живи) или "fallback" (де-ос не отговори) */
	source: "deos" | "fallback";
	updatedAt: string | null;
};

export const PROGRAM: Program = {
	tiers: [
		{ min: 1, rate: 0.10 },
		{ min: 2, rate: 0.12 },
		{ min: 3, rate: 0.18 },
	],
	projectTiers: [
		{ max: 1000, rate: 0.20 },
		{ max: 3000, rate: 0.15 },
		{ max: null, rate: 0.10 },
	],
	level2Rate: 0.03,
	months: 12,
	minPayout: 50,
	creditBonus: 0.10,
	payoutDay: 10,
	attributionDays: 90,
	manualLeadDays: 30,
	source: "fallback",
	updatedAt: null,
};

const rateOk = (r: unknown): r is number => typeof r === "number" && Number.isFinite(r) && r >= 0 && r <= 1;
const numOk = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;

/** Отговорът на de-os `GET /api/partners/program` (snake_case) → Program. null при невалидни данни. */
export function programFromDeos(d: unknown): Program | null {
	if (!d || typeof d !== "object") return null;
	const s = d as Record<string, unknown>;
	const tiers = Array.isArray(s.tiers)
		? s.tiers.map((t) => ({ min: Number((t as Tier).min), rate: Number((t as Tier).rate) })).filter((t) => Number.isInteger(t.min) && t.min >= 1 && rateOk(t.rate)).sort((a, b) => a.min - b.min)
		: [];
	const projectTiers = Array.isArray(s.project_tiers)
		? s.project_tiers.map((t) => { const x = t as ProjectTier; return { max: x.max == null ? null : Number(x.max), rate: Number(x.rate) }; })
			.filter((t) => (t.max === null || numOk(t.max)) && rateOk(t.rate))
			.sort((a, b) => (a.max == null ? 1 : b.max == null ? -1 : a.max - b.max))
		: [];
	if (!tiers.length || tiers[0].min !== 1 || !projectTiers.length || projectTiers[projectTiers.length - 1].max !== null) return null;
	const num = (k: string, fallback: number) => (numOk(s[k]) ? (s[k] as number) : fallback);
	return {
		tiers,
		projectTiers,
		level2Rate: rateOk(s.level2_rate) ? s.level2_rate : PROGRAM.level2Rate,
		creditBonus: rateOk(s.credit_bonus) ? s.credit_bonus : PROGRAM.creditBonus,
		months: num("months", PROGRAM.months),
		minPayout: num("min_payout", PROGRAM.minPayout),
		payoutDay: num("payout_day", PROGRAM.payoutDay),
		attributionDays: num("attribution_days", PROGRAM.attributionDays),
		manualLeadDays: num("manual_lead_days", PROGRAM.manualLeadDays),
		source: "deos",
		updatedAt: typeof s.updated_at === "string" ? s.updated_at : null,
	};
}

export function tierRate(activeClients: number, tiers: Tier[] = PROGRAM.tiers): number {
	let rate = 0;
	for (const t of [...tiers].sort((a, b) => a.min - b.min)) if (activeClients >= t.min) rate = t.rate;
	return rate;
}

export const pct = (r: number) => `${Math.round(r * 1000) / 10} %`;
export const eur = (n: number) => `${Math.round(n).toLocaleString("bg-BG")} €`;

export const ROLES: { value: string; label: string }[] = [
	{ value: "accountant", label: "Счетоводител" },
	{ value: "lawyer", label: "Адвокат / нотариус" },
	{ value: "broker", label: "Брокер на имоти" },
	{ value: "photographer", label: "Фотограф / видеограф" },
	{ value: "it", label: "IT support / системен администратор" },
	{ value: "pos", label: "POS / ERP / касови системи" },
	{ value: "print", label: "Печат / табели / реклама" },
	{ value: "web", label: "Web freelancer / дизайнер" },
	{ value: "consultant", label: "Бизнес консултант" },
	{ value: "hr", label: "HR агенция" },
	{ value: "other", label: "Друго" },
];
