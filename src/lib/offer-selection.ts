// ── Изборът на клиента в офертата — общ формат със de-os (lib/oferta/build.js computeTotals) ──
export interface OfferSelection {
	packages: Record<string, { on: boolean; budget?: number }>;
	choices: Record<string, string>;
	tiers: Record<string, number>;
	checkboxes: Record<string, boolean>;
	counters: Record<string, number>;
}

export interface CompanyForm {
	name: string; eik: string; vat: string; address: string; mol: string; email: string; phone: string;
}

export interface AcceptedInfo {
	contractNo: string;
	acceptedAt: string;
	selection: OfferSelection | null;
	totals: { agency: number; budget: number; grand: number; oneTime: number } | null;
	companyName: string;
	sent: boolean;
}
