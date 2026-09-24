// ═══════════════════════════════════════════════════════════════════════════
// Такса за управление на реклама — КОПИЕ на de-os lib/oferta/fees.js.
// Пази ги еднакви: сайтът показва същите числа, които офертата и договорът смятат.
//
// Стъпаловиден %: всеки процент важи само за своя отрязък от бюджета.
//   €0–1 000 → 10% · €1 000–5 000 → 8% · €5 000–10 000 → 6% · над €10 000 → 5%
//   €200 → €170 · €1 000 → €250 · €5 000 → €570 · €10 000 → €870
// Без pctTiers → стар плосък pctOfBudget (старите оферти).
// ═══════════════════════════════════════════════════════════════════════════

export type PctTier = { upTo: number | null; pct: number };
export type Fee = { fixed: number; pctOfBudget?: number; pctTiers?: PctTier[] | null };

export const DEFAULT_PCT_TIERS: PctTier[] = [
	{ upTo: 1000, pct: 10 },
	{ upTo: 5000, pct: 8 },
	{ upTo: 10000, pct: 6 },
	{ upTo: null, pct: 5 },
];

export function normalizeTiers(tiers: unknown): PctTier[] {
	if (!Array.isArray(tiers)) return [];
	const list = tiers
		.map((t: { upTo?: unknown; pct?: unknown }) => ({
			upTo: t?.upTo === null || t?.upTo === "" || t?.upTo === undefined ? null : Number(t.upTo),
			pct: Number(t?.pct) || 0,
		}))
		.filter((t) => t.upTo === null || (Number.isFinite(t.upTo) && (t.upTo as number) > 0));
	list.sort((a, b) => (a.upTo ?? Infinity) - (b.upTo ?? Infinity));
	return list;
}

export function pctPart(fee: Pick<Fee, "pctTiers" | "pctOfBudget">, budget: number): number {
	const b = Math.max(0, Number(budget) || 0);
	const tiers = normalizeTiers(fee.pctTiers);
	if (!tiers.length) return ((Number(fee.pctOfBudget) || 0) / 100) * b;
	let rest = b, from = 0, sum = 0;
	for (const t of tiers) {
		const to = t.upTo ?? Infinity;
		const slice = Math.max(0, Math.min(rest, to - from));
		sum += (t.pct / 100) * slice;
		rest -= slice;
		from = to;
		if (rest <= 0) break;
	}
	return sum;
}

export function feeFor(fee: Fee | null | undefined, budget: number): number {
	return Math.round((Number(fee?.fixed) || 0) + pctPart(fee || { fixed: 0 }, budget));
}

export const fmtNum = (n: number) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const eur = (n: number) => `€${fmtNum(n)}`;

/** „до €1 000 — 10%“ … за таблици и ЧЗВ */
export function tierRows(tiers: PctTier[] | null | undefined) {
	let from = 0;
	return normalizeTiers(tiers).map((t) => {
		const range = t.upTo === null ? `над ${eur(from)}` : from === 0 ? `до ${eur(t.upTo)}` : `${eur(from)} – ${eur(t.upTo)}`;
		from = t.upTo ?? from;
		return { range, pct: t.pct };
	});
}
