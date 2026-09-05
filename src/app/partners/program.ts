// ── Digital Effect Partners — публичните параметри на програмата ────────────
// Източникът на истината са настройките в de-os (панел → Партньори →
// Настройки). Това тук е КОПИЕ за страницата и калкулатора — при промяна там
// смени и тук, иначе страницата обещава едно, а начисляваме друго.

export const PROGRAM = {
	tiers: [
		{ min: 1, rate: 0.10 },
		{ min: 2, rate: 0.12 },
		{ min: 3, rate: 0.18 },
	],
	projectTiers: [
		{ max: 1000, rate: 0.20 },
		{ max: 3000, rate: 0.15 },
		{ max: null as number | null, rate: 0.10 },
	],
	level2Rate: 0.03,
	months: 12,
	minPayout: 50,
	creditBonus: 0.10,
	payoutDay: 10,
	attributionDays: 90,
	manualLeadDays: 30,
};

export function tierRate(activeClients: number, tiers = PROGRAM.tiers): number {
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
