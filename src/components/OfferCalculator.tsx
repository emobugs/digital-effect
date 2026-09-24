"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OfferCalculator — интерактивната оферта на digitaleffect.bg/oferta/<token>.
// React порт на офертния шаблон v2 (бизнеси/_oferta-template/template.html):
// пакети с такса (фикс + % от бюджет) и бюджет-слайдери, радио нива, степенни
// слайдери, чекбокси, броячи, еднократни; upsell със задраскана цена.
// Клиентът вижда само цени и условия — нищо вътрешно.
// ═══════════════════════════════════════════════════════════════════════════
import { feeFor } from "@/lib/fees";
import { useMemo, useState } from "react";
import { normalizeOffer, type OfferData } from "@/lib/offer-types";
import type { OfferSelection, AcceptedInfo } from "@/lib/offer-selection";
import OfferAccept from "@/components/OfferAccept";

const EUR = (n: number) => `${Math.round(n)} €`;
const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(" ");

const BOX = "rounded-xl border border-white/10 bg-black/30";
const HI = "border-brand-orange-l/50 bg-brand-orange-l/[0.06] shadow-[0_0_0_1px_rgba(242,101,34,.15)]";
const ACCENT = "text-brand-orange-l";
const MUTED = "text-gray-400";

function Badge({ text }: { text?: string }) {
	if (!text) return null;
	return <span className="inline-block text-[10px] font-extrabold tracking-[.14em] uppercase px-2 py-0.5 rounded-full bg-brand-grad text-white">{text}</span>;
}

function Price({ price, old, suffix }: { price: number; old?: number; suffix?: string }) {
	return (
		<span className="whitespace-nowrap">
			{old != null && old !== price && <span className="text-gray-500 line-through mr-1.5 text-xs">{EUR(old)}</span>}
			<span className={cx("font-bold", ACCENT)}>{EUR(price)}{suffix}</span>
		</span>
	);
}

function Feature({ icon, html }: { icon: string; html: string }) {
	return (
		<li className="flex gap-2 text-[13px] leading-snug text-gray-300 [&_strong]:text-gray-100 [&_.t-free]:text-emerald-400 [&_.t-free]:uppercase">
			<span className={cx("mt-0.5 flex-shrink-0", icon === "gift" ? "text-violet-400" : "text-emerald-400")} aria-hidden="true">
				{icon === "gift" ? "🎁" : "✓"}
			</span>
			<span dangerouslySetInnerHTML={{ __html: html }} />
		</li>
	);
}

function Range({ value, min, max, step, onChange, ariaLabel, disabled }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; ariaLabel: string; disabled?: boolean }) {
	return (
		<input type="range" min={min} max={max} step={step} value={value} aria-label={ariaLabel} disabled={disabled}
			onChange={(e) => onChange(Number(e.target.value))}
			className="w-full mt-3 cursor-pointer accent-brand-orange-l" />
	);
}

export default function OfferCalculator({ data, token, accepted = null }: { data: OfferData; token?: string; accepted?: AcceptedInfo | null }) {
	const o = useMemo(() => normalizeOffer(data), [data]);
	const packages = o.packages;
	// Приета оферта → калкулаторът показва точно приетия избор и е заключен
	const locked = !!accepted;
	const S = accepted?.selection ?? null;

	const [pkgOn, setPkgOn] = useState<Record<string, boolean>>(() => Object.fromEntries(packages.map((p) => [p.id, S ? S.packages?.[p.id]?.on !== false && (!!S.packages?.[p.id] || !p.optional) : p.optional ? !!p.defaultOn : p.defaultOn !== false])));
	const [budgets, setBudgets] = useState<Record<string, number>>(() => Object.fromEntries(packages.filter((p) => p.budget).map((p) => [p.id, S?.packages?.[p.id]?.budget ?? p.budget!.default])));
	const [choice, setChoice] = useState<Record<string, string>>(() => Object.fromEntries((o.choiceGroups ?? []).map((g) => [g.id, S?.choices?.[g.id] ?? g.defaultOption ?? ""])));
	const [tier, setTier] = useState<Record<string, number>>(() => Object.fromEntries((o.tierGroups ?? []).map((g) => [g.id, S?.tiers?.[g.id] ?? g.defaultIndex ?? 0])));
	const [checks, setChecks] = useState<Record<string, boolean>>(() => Object.fromEntries((o.checkboxes ?? []).map((c) => [c.id, S ? !!S.checkboxes?.[c.id] : !!c.defaultOn])));
	const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries((o.counters ?? []).map((c) => [c.id, S?.counters?.[c.id] ?? 0])));
	// Еднократните без `optional` са част от офертата и не се изключват.
	const [oneTimeOn, setOneTimeOn] = useState<Record<string, boolean>>(() => Object.fromEntries((o.oneTime ?? []).map((x) => [x.id, !x.optional || (S ? !!S.oneTime?.[x.id] : !!x.defaultOn)])));

	const T = { agency: "Общо към Digital Effect", budget: "Рекламен бюджет (директно към платформите)", grand: "ОБЩА МЕСЕЧНА ИНВЕСТИЦИЯ", oneTime: "Еднократно", ...(o.totalLabels ?? {}) };

	/* ── сметката ── */
	const rows: [string, number][] = [];
	let budgetSum = 0;
	for (const p of packages) {
		if (!pkgOn[p.id]) continue;
		let fee = p.fee.fixed;
		let label = p.totalRowLabel ?? p.title;
		if (p.budget) {
			const b = budgets[p.id] ?? p.budget.default;
			budgetSum += b;
			// Същата формула като de-os (lib/oferta/fees.js) — стъпаловиден % или стар плосък
			if (p.fee.pctTiers?.length) { fee = feeFor(p.fee, b); label += ` (${EUR(p.fee.fixed)} + стъпаловиден % от ${EUR(b)})`; }
			else if (p.fee.pctOfBudget) { fee = Math.round(feeFor(p.fee, b)); label += ` (${EUR(p.fee.fixed)} + ${p.fee.pctOfBudget}% × ${EUR(b)})`; }
		}
		rows.push([label, fee]);
	}
	for (const g of o.choiceGroups ?? []) { const opt = g.options.find((x) => x.id === choice[g.id]); if (opt) rows.push([opt.label, opt.price]); }
	for (const g of o.tierGroups ?? []) { const t = g.tiers[(tier[g.id] ?? 0) - 1]; if (t) rows.push([`${g.title} — ${t.label}`, t.price]); }
	for (const c of o.checkboxes ?? []) if (checks[c.id]) rows.push([c.label, c.price]);
	for (const c of o.counters ?? []) { const n = counts[c.id] ?? 0; if (n > 0) rows.push([`${c.label} × ${n}`, n * c.unit]); }
	const agency = rows.reduce((s, r) => s + r[1], 0);
	const oneTimeSum = (o.oneTime ?? []).reduce((s, x) => (oneTimeOn[x.id] ? s + x.price : s), 0);
	const hasBudget = packages.some((p) => p.budget && pkgOn[p.id]);
	// Изборът, който отива в de-os при преглед/приемане (сумите се смятат там)
	const selection: OfferSelection = {
		packages: Object.fromEntries(packages.map((p) => [p.id, { on: !!pkgOn[p.id], budget: p.budget ? budgets[p.id] ?? p.budget.default : undefined }])),
		choices: choice, tiers: tier, checkboxes: checks, counters: counts, oneTime: oneTimeOn,
	};
	const hasAddons = !!((o.choiceGroups?.length) || (o.tierGroups?.length) || (o.checkboxes?.length) || (o.counters?.length));

	return (
		<div className="relative w-full max-w-2xl mx-auto px-4 py-8 sm:py-14">
			{/* глоу-ове в clip-нат слой (без втори скрол) */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
				<div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[70px] opacity-60" style={{ background: "radial-gradient(circle, rgba(242,101,34,.16) 0%, transparent 65%)" }} />
				<div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blur-[70px] opacity-60" style={{ background: "radial-gradient(circle, rgba(124,58,237,.14) 0%, transparent 65%)" }} />
			</div>

			{/* хедър */}
			<div className="relative text-center mb-8">
				<div className="font-display font-black tracking-tight text-lg mb-6">Digital<span className={ACCENT}>Effect</span></div>
				{o.eyebrow && <div className={cx("text-[11px] font-extrabold tracking-[.22em] uppercase mb-3", ACCENT)}>{o.eyebrow}</div>}
				<h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-tight">{o.brandTitle}</h1>
				{o.tagline && <p className={cx("mt-4 text-[15px] leading-relaxed max-w-prose mx-auto", MUTED)}>{o.tagline}</p>}
			</div>

			<div className="relative rounded-2xl border border-white/10 bg-dark-surface/80 backdrop-blur-xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,.6)]">
				<h2 className="font-display font-bold text-lg border-b border-white/10 pb-3">{o.calcTitle ?? "Ценови калкулатор"}</h2>
				{o.calcSubtitle && <p className={cx("text-xs mt-3", MUTED)}>{o.calcSubtitle}</p>}

				{/* пакети */}
				<div className="mt-6 space-y-4">
					{packages.map((p) => {
						const on = !!pkgOn[p.id];
						const b = p.budget;
						return (
							<div key={p.id} className={cx("rounded-xl border p-4", p.highlight ? HI : "border-brand-orange-l/25 bg-brand-orange-l/[0.04]", p.optional && !on && "opacity-80")}>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										{p.badge && <div className="mb-1.5"><Badge text={p.badge} /></div>}
										<div className="font-bold text-[15px] text-gray-100 leading-snug">{p.title}</div>
										{p.subtitle && <div className={cx("text-[11px] mt-0.5", MUTED)}>{p.subtitle}</div>}
									</div>
									<div className="text-right flex-shrink-0">
										{p.oldFixed != null && p.oldFixed !== p.fee.fixed && <div className="text-xs text-gray-500 line-through">{EUR(p.oldFixed)}{p.fee.pctTiers?.length ? " + %" : p.fee.pctOfBudget ? ` + ${p.fee.pctOfBudget}%` : ""}</div>}
										<div className={cx("font-bold text-[15px]", ACCENT)}>{p.priceLabel}</div>
										{p.discountPct ? <div className="text-[10px] text-emerald-400 font-semibold">−{p.discountPct}%</div> : null}
									</div>
								</div>
								{p.optional && (
									<label className="mt-3 flex items-center gap-2 text-sm cursor-pointer select-none">
										<input type="checkbox" disabled={locked} checked={on} onChange={(e) => setPkgOn((s) => ({ ...s, [p.id]: e.target.checked }))} className="accent-brand-orange-l w-4 h-4" />
										<span className="text-gray-200">{on ? "Включено в офертата" : "Добави към офертата"}</span>
									</label>
								)}
								{p.features?.length > 0 && <ul className="mt-4 space-y-2">{p.features.map((f, i) => <Feature key={i} icon={f.icon} html={f.html} />)}</ul>}
								{b && on && (
									<div className={cx("mt-4 p-3", BOX)}>
										<div className="flex justify-between items-center gap-2">
											<span className="text-xs font-semibold text-gray-200">{b.label}</span>
											<span className={cx("text-sm font-bold", ACCENT)}>{EUR(budgets[p.id] ?? b.default)} / мес</span>
										</div>
										<Range disabled={locked} value={budgets[p.id] ?? b.default} min={b.min} max={b.max} step={b.step ?? 50} ariaLabel={b.label}
											onChange={(v) => setBudgets((s) => ({ ...s, [p.id]: v }))} />
										<div className={cx("flex justify-between text-[10px] mt-1", MUTED)}><span>{EUR(b.min)}</span><span>{EUR(b.max)}</span></div>
										{b.note && <p className={cx("text-[11px] mt-2 leading-relaxed", MUTED)}>{b.note}</p>}
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* добавки */}
				{hasAddons && (
					<div className="mt-7 space-y-4">
						<div className="text-[11px] font-extrabold tracking-[.16em] uppercase text-gray-200">{o.addonsTitle ?? "Допълнителни услуги (при нужда)"}</div>

						{(o.choiceGroups ?? []).map((g) => (
							<div key={g.id} className={cx("space-y-2 rounded-xl p-2 -m-2", g.highlight && "border border-brand-orange-l/30 bg-brand-orange-l/[0.04] p-3 -m-0")}>
								<div className="flex items-center gap-2 flex-wrap">
									{g.title && <div className="text-sm font-semibold text-gray-100">{g.title}</div>}
									<Badge text={g.badge} />
								</div>
								<label className={cx("flex items-center gap-3 p-3 cursor-pointer", BOX, choice[g.id] === "" && "border-white/25")}>
									<input type="radio" disabled={locked} name={`grp-${g.id}`} checked={choice[g.id] === ""} onChange={() => setChoice((s) => ({ ...s, [g.id]: "" }))} className="accent-brand-orange-l" />
									<span className="flex-1 flex justify-between text-sm"><span className="text-gray-200 font-medium">{g.noneLabel ?? "Без"}</span><span className={MUTED}>0 €</span></span>
								</label>
								{g.options.map((op) => (
									<label key={op.id} className={cx("flex items-start gap-3 p-3 cursor-pointer", BOX, choice[g.id] === op.id && "border-brand-orange-l/50")}>
										<input type="radio" disabled={locked} name={`grp-${g.id}`} checked={choice[g.id] === op.id} onChange={() => setChoice((s) => ({ ...s, [g.id]: op.id }))} className="mt-1 accent-brand-orange-l" />
										<span className="flex-1 min-w-0">
											<span className="flex justify-between gap-2 text-sm"><span className="text-gray-100 font-medium">{op.label}</span><Price price={op.price} old={op.oldPrice} /></span>
											{op.desc && <span className={cx("block text-[11px] mt-0.5 leading-relaxed", MUTED)}>{op.desc}</span>}
										</span>
									</label>
								))}
								{g.note && <p className={cx("text-[11px] px-1 leading-relaxed", MUTED)}>{g.note}</p>}
							</div>
						))}

						{(o.tierGroups ?? []).map((g) => {
							const stops = [{ label: g.noneLabel ?? "Без", price: 0, desc: "" }, ...g.tiers];
							const sel = stops[tier[g.id] ?? 0] ?? stops[0];
							return (
								<div key={g.id} className={cx("p-4", BOX, g.highlight && HI)}>
									<div className="flex justify-between items-center gap-2">
										<span className="text-sm font-semibold text-gray-100">{g.title}</span>
										{sel.price ? <Price price={sel.price} old={(sel as { oldPrice?: number }).oldPrice} /> : <span className={MUTED}>0 €</span>}
									</div>
									<Range disabled={locked} value={tier[g.id] ?? 0} min={0} max={stops.length - 1} step={1} ariaLabel={g.title} onChange={(v) => setTier((s) => ({ ...s, [g.id]: v }))} />
									<div className={cx("flex justify-between text-[10px] mt-1", MUTED)}>{stops.map((s, i) => <span key={i}>{s.price ? EUR(s.price) : s.label}</span>)}</div>
									{sel.desc && <p className={cx("text-[11px] mt-2 leading-relaxed", MUTED)}>{sel.desc}</p>}
									{g.note && <p className={cx("text-[11px] mt-1 leading-relaxed", MUTED)}>{g.note}</p>}
								</div>
							);
						})}

						{(o.checkboxes ?? []).map((c) => (
							<label key={c.id} className={cx("flex items-start gap-3 p-3 cursor-pointer", BOX, c.highlight && HI)}>
								<input type="checkbox" disabled={locked} checked={!!checks[c.id]} onChange={(e) => setChecks((s) => ({ ...s, [c.id]: e.target.checked }))} className="mt-1 accent-brand-orange-l" />
								<span className="flex-1 min-w-0">
									<span className="flex justify-between gap-2 text-sm"><span className="text-gray-100 font-medium">{c.label} <Badge text={c.badge} /></span><Price price={c.price} old={c.oldPrice} suffix="/мес" /></span>
									{c.desc && <span className={cx("block text-[11px] mt-0.5 leading-relaxed", MUTED)}>{c.desc}</span>}
								</span>
							</label>
						))}

						{(o.counters ?? []).map((c) => (
							<div key={c.id} className={cx("flex items-start gap-3 p-3", BOX)}>
								<div className="flex-1 min-w-0">
									<div className="flex justify-between gap-2 text-sm"><span className="text-gray-100 font-medium">{c.label}</span><span className={cx("font-bold whitespace-nowrap", ACCENT)}>{EUR(c.unit)} / бр</span></div>
									{c.desc && <p className={cx("text-[11px] mt-0.5 leading-relaxed", MUTED)}>{c.desc}</p>}
								</div>
								<div className="flex items-center gap-1.5">
									<button type="button" disabled={locked} aria-label="по-малко" onClick={() => setCounts((s) => ({ ...s, [c.id]: Math.max(0, (s[c.id] ?? 0) - 1) }))} className="w-7 h-7 rounded-md border border-white/15 text-gray-200 hover:border-white/30">−</button>
									<span className="w-6 text-center text-sm font-bold tabular-nums">{counts[c.id] ?? 0}</span>
									<button type="button" disabled={locked} aria-label="повече" onClick={() => setCounts((s) => ({ ...s, [c.id]: (s[c.id] ?? 0) + 1 }))} className="w-7 h-7 rounded-md border border-white/15 text-gray-200 hover:border-white/30">+</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* еднократни */}
				{(o.oneTime ?? []).length > 0 && (
					<div className="mt-7 space-y-2">
						<div className="text-[11px] font-extrabold tracking-[.16em] uppercase text-gray-200">{T.oneTime}</div>
						{o.oneTime!.map((x) => {
							const on = !!oneTimeOn[x.id];
							return (
								<label key={x.id} className={cx("flex items-start justify-between gap-3 p-3", BOX, x.optional && !locked && "cursor-pointer", x.optional && !on && "opacity-55")}>
									<div className="flex items-start gap-3 min-w-0">
										{x.optional && (
											<input type="checkbox" disabled={locked} checked={on} onChange={(e) => setOneTimeOn((s) => ({ ...s, [x.id]: e.target.checked }))} className="mt-1 accent-brand-orange-l" />
										)}
										<div className="min-w-0">
											<div className="text-sm text-gray-100 font-medium">{x.label} <Badge text={x.badge} /></div>
											{x.desc && <p className={cx("text-[11px] mt-0.5 leading-relaxed", MUTED)}>{x.desc}</p>}
										</div>
									</div>
									<Price price={x.price} old={x.oldPrice} />
								</label>
							);
						})}
					</div>
				)}

				{/* тотал */}
				<div className="mt-7 border-t border-white/10 pt-4 space-y-1.5">
					{rows.map(([l, v], i) => <div key={i} className={cx("flex justify-between gap-3 text-xs", MUTED)}><span>{l}:</span><span className="whitespace-nowrap">{EUR(v)}</span></div>)}
					{hasBudget && (
						<>
							<div className="flex justify-between text-xs font-semibold text-gray-100 border-t border-white/10 pt-2"><span>{T.agency}:</span><span>{EUR(agency)}</span></div>
							<div className={cx("flex justify-between text-xs", MUTED)}><span>{T.budget}:</span><span>{EUR(budgetSum)}</span></div>
						</>
					)}
					<div className="flex justify-between items-baseline text-sm font-semibold text-gray-100 border-t border-white/10 pt-3">
						<span>{T.grand}:</span>
						<span className={cx("font-display font-black text-xl", ACCENT)} data-testid="grand-total">{EUR(agency + budgetSum)}</span>
					</div>
					{oneTimeSum > 0 && <div className={cx("flex justify-between text-xs", MUTED)}><span>{T.oneTime}:</span><span>{EUR(oneTimeSum)}</span></div>}
				</div>

				{(o.infoNotes ?? []).length > 0 && (
					<div className="mt-5 space-y-2">
						{o.infoNotes!.map((n, i) => <div key={i} className={cx("p-3 text-[11px] leading-relaxed", BOX, MUTED)}>ⓘ {n}</div>)}
					</div>
				)}
				{o.commitment && <p className={cx("text-[11px] text-center mt-4", MUTED)}>{o.commitment}</p>}
				{o.validUntil && !locked && <p className="text-[11px] text-center mt-1 text-gray-500">Валидно до {o.validUntil}</p>}
			</div>

			{token && (
				<OfferAccept
					token={token}
					selection={selection}
					grand={agency + budgetSum}
					clientName={o.client?.name ?? o.brandTitle}
					contactName={o.client?.contact}
					contactEmail={o.client?.email}
					contactPhone={o.client?.phone}
					accepted={accepted}
				/>
			)}

			<footer className={cx("relative text-center text-xs mt-10 pt-6 border-t border-white/10", MUTED)}>
				{o.footerLine ?? `© ${new Date().getFullYear()} Digital Effect`}
				<p className="mt-1"><a href="https://digitaleffect.bg" className={cx("hover:underline", ACCENT)}>Digital Effect</a> · Силистра · <a href="mailto:contacts@digitaleffect.bg" className="hover:underline">contacts@digitaleffect.bg</a></p>
			</footer>
		</div>
	);
}
