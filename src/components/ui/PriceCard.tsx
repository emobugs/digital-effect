// ── Ценови карти — всичко идва от ценоразписа в de-os ────────────────────────
import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { priceParts, type PublicService } from "@/lib/services";
import { fmtNum, tierRows } from "@/lib/fees";

export function PriceTag({ s, big = false }: { s: PublicService; big?: boolean }) {
	const p = priceParts(s);
	return (
		<div className="flex flex-wrap items-baseline gap-x-2">
			{p.prefix && <span className="text-[14px] text-[var(--muted)]">{p.prefix}</span>}
			<span className={`font-display font-black tabular tracking-[-0.03em] ${big ? "text-[clamp(44px,5vw,72px)]" : "text-[clamp(32px,3vw,44px)]"}`}>{p.value}</span>
			{p.suffix && <span className="text-[14px] text-[var(--muted)]">{p.suffix}</span>}
		</div>
	);
}

/** Една услуга: име, цена, точки; за choice/tiers — всички нива с цените им. */
export function ServicePrice({ s, href }: { s: PublicService; href?: string }) {
	const levels = s.options?.length ? s.options.map((o) => ({ label: o.label, price: o.price, desc: o.desc, features: o.features, popular: o.popular })) : s.tiers?.length ? s.tiers.map((t) => ({ label: t.label, price: t.price, desc: t.desc, features: t.features, popular: t.popular })) : null;
	return (
		<div className="card card-spot flex h-full flex-col p-6 md:p-8">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="font-display text-[22px] font-extrabold tracking-[-0.015em]">{s.name}</h3>
					<p className="mt-1 text-[14px] text-[var(--muted)]">{s.short}</p>
				</div>
				{s.badge && <span className="chip chip-orange whitespace-nowrap">{s.badge}</span>}
			</div>
			<div className="mt-6"><PriceTag s={s} /></div>
			{s.priceNote && <p className="mt-2 text-[13px] leading-relaxed text-[var(--dim)]">{s.priceNote}</p>}

			{levels ? (
				<div className="mt-6 space-y-2">
					{levels.map((l) => (
						<div key={l.label} className={`rounded-2xl p-4 ring-1 ${l.popular ? "bg-[#f26522]/[0.08] ring-[#f26522]/40" : "ring-white/[0.08]"}`}>
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-[15px] font-semibold">{l.label}{l.popular && <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f5813a]">най-избиран</span>}</span>
								<span className="whitespace-nowrap font-display text-[20px] font-black tabular">€{fmtNum(l.price)}<span className="text-[12px] font-medium text-[var(--dim)]">{s.price.monthly ? "/мес." : ""}</span></span>
							</div>
							{l.features?.length ? (
								<ul className="mt-2 space-y-1">{l.features.map((f) => <li key={f} className="flex gap-2 text-[13px] text-[var(--muted)]"><Check size={14} className="mt-0.5 flex-shrink-0 text-[#f26522]" />{f}</li>)}</ul>
							) : l.desc ? <p className="mt-1 text-[13px] text-[var(--muted)]">{l.desc}</p> : null}
						</div>
					))}
				</div>
			) : (
				<ul className="mt-6 space-y-2.5">
					{(s.includes?.length ? s.includes : s.siteFeatures).map((f) => (
						<li key={f} className="flex gap-3 text-[15px] text-[var(--text)]/85"><Check size={17} className="mt-0.5 flex-shrink-0 text-[#f26522]" />{f}</li>
					))}
				</ul>
			)}

			{s.pctTiers?.length ? (
				<table className="mt-6 w-full text-left text-[13px]">
					<caption className="mb-2 text-left text-[12px] uppercase tracking-[0.16em] text-[var(--dim)]">Стъпаловиден % от бюджета</caption>
					<tbody>
						{tierRows(s.pctTiers).map((r) => (
							<tr key={r.range} className="border-t border-white/[0.06]"><td className="py-2 text-[var(--muted)]">{r.range}</td><td className="py-2 text-right font-semibold tabular">{r.pct}%</td></tr>
						))}
					</tbody>
				</table>
			) : null}

			{href && (
				<Link href={href} className="group mt-auto inline-flex items-center gap-2 pt-7 text-[15px] font-semibold">
					<span className="border-b border-[#f26522]/60 pb-0.5 group-hover:border-white">Какво точно включва</span>
					<ArrowUpRight size={17} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
				</Link>
			)}
		</div>
	);
}

/** Growth Partner — голямата карта с „отделно струва“. */
export function GrowthCard({ s }: { s: PublicService }) {
	return (
		<div className="relative overflow-hidden rounded-[24px] p-7 md:p-12" style={{ background: "radial-gradient(120% 120% at 100% 0%, rgba(242,101,34,.28), transparent 50%), linear-gradient(140deg, #2d1060 0%, #150a2a 50%, #0b0b10 100%)", boxShadow: "inset 0 0 0 1px rgba(107,59,214,.45), 0 60px 140px -60px rgba(107,59,214,.6)" }}>
			<div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
				<div>
					<span className="chip !text-[#e3d8ff] ![box-shadow:inset_0_0_0_1px_rgba(201,179,255,.35)]">{s.badge || "Най-изгодно"}</span>
					<h3 className="display mt-6 text-[clamp(40px,5vw,76px)]">{s.name}</h3>
					<p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/70">{s.description}</p>
					<div className="mt-8 flex flex-wrap items-end gap-4">
						<PriceTag s={s} big />
						{s.compareAt ? <span className="pb-3 text-[16px] text-white/45 line-through">€{fmtNum(s.compareAt)}/мес. отделно</span> : null}
					</div>
					{s.priceNote && <p className="mt-2 max-w-lg text-[13px] text-white/45">{s.priceNote}</p>}
				</div>
				<ul className="grid gap-2.5">
					{(s.includes?.length ? s.includes : s.siteFeatures).map((f) => (
						<li key={f} className="flex gap-3 rounded-2xl bg-white/[0.05] p-3.5 text-[15px] text-white/85 ring-1 ring-white/10"><Check size={17} className="mt-0.5 flex-shrink-0 text-[#f59c1a]" />{f}</li>
					))}
				</ul>
			</div>
		</div>
	);
}
