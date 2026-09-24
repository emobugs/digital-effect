"use client";

// ── Калкулатор на таксата за реклама — същата формула като офертата и договора
import { useState } from "react";
import { feeFor, fmtNum, type PctTier } from "@/lib/fees";

export default function AdsFeeCalc({ fixed, tiers, min = 200, max = 20000, setup }: { fixed: number; tiers: PctTier[]; min?: number; max?: number; setup?: { min: number; max: number } }) {
	const STEPS = [200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000].filter((x) => x >= min && x <= max);
	const [i, setI] = useState(Math.max(0, STEPS.indexOf(1000)));
	const budget = STEPS[i];
	const fee = feeFor({ fixed, pctTiers: tiers }, budget);
	const pct = ((fee - fixed) / budget) * 100;
	return (
		<div className="card p-6 md:p-8" style={{ containerType: "inline-size" }}>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--dim)]">Калкулатор на таксата</div>
					<label htmlFor="ads-budget" className="mt-2 block text-[15px] text-[var(--muted)]">Месечен рекламен бюджет</label>
				</div>
				<div className="font-display text-[34px] font-black tabular">€{fmtNum(budget)}</div>
			</div>
			<input id="ads-budget" type="range" min={0} max={STEPS.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} className="mt-4 w-full accent-[#f26522]" aria-valuetext={`€${budget}`} />
			<dl className="fee-dl mt-6 grid gap-3">
				<div className="rounded-2xl bg-[#f26522]/10 p-4 ring-1 ring-[#f26522]/30"><dt className="text-[12px] text-[#ffd2b8]">Нашата такса</dt><dd className="mt-1 font-display text-[26px] font-black tabular whitespace-nowrap">€{fmtNum(fee)}</dd></div>
				<div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07]"><dt className="text-[12px] text-[var(--dim)]">Ефективно</dt><dd className="mt-1 font-display text-[26px] font-black tabular whitespace-nowrap">{pct.toFixed(1)}%</dd></div>
				<div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07]"><dt className="text-[12px] text-[var(--dim)]">Общо на месец</dt><dd className="mt-1 font-display text-[26px] font-black tabular whitespace-nowrap">€{fmtNum(fee + budget)}</dd></div>
			</dl>
			<p className="mt-4 text-[13px] leading-relaxed text-[var(--dim)]">€{fixed} фиксирано + стъпаловиден % само върху съответната част от бюджета. Бюджетът се плаща директно на платформата.{setup ? ` Setup: €${setup.min}–${setup.max} еднократно.` : ""}</p>
		</div>
	);
}
