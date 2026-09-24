"use client";

// ═══════════════════════════════════════════════════════════════════════════
// „Сглоби си ефекта“ — три въпроса от бита вместо ценова таблица.
//   1. С какво се занимавате?  2. Колко нови клиенти искате?  3. Колко ви носи един?
// → препоръчани модули, ориентировъчен бюджет, месечна такса (от ценоразписа),
//   очакван оборот и бутон „Изпратете ми плана“ → лийд в de-os (/api/hello).
// Цените идват от de-os (props); цена на запитване и конверсия по ниша са
// ОРИЕНТИРОВЪЧНИ средни стойности (виж BENCH) — калибрирай ги с реални данни.
// ═══════════════════════════════════════════════════════════════════════════
import { useMemo, useState } from "react";
import { Hotel, HardHat, ShoppingBag, Stethoscope, Sparkles, UtensilsCrossed, Wrench, Building2, Factory, CircleEllipsis, Check, Loader2, ArrowRight } from "lucide-react";
import { feeFor, fmtNum, type PctTier } from "@/lib/fees";
import { resolvePartnerCode } from "@/lib/partner-ref";

export interface ConfigPrices {
	adsFixed: number;
	pctTiers: PctTier[];
	setupMin: number;
	setupMax: number;
	smmGrowth: number;
	smmScale: number;
	landing: number;
	website: number;
	custom: number;
	advanced: number;
	chatbot: number;
	growthPartner: number;
	growthCompare: number;
}

type Ind = { id: string; label: string; hello: string; Icon: typeof Hotel; cpl: number; close: number; ads: "meta" | "google"; smm: boolean; web: "landing" | "website" | "custom" | "advanced"; ai: boolean };

/** Ориентировъчни стойности за България (€ на запитване, % затворени). [ЗА КАЛИБРИРАНЕ] */
const BENCH: Ind[] = [
	{ id: "hotel", label: "Хотел / къща за гости", hello: "Друго", Icon: Hotel, cpl: 5, close: 0.35, ads: "meta", smm: true, web: "advanced", ai: true },
	{ id: "build", label: "Строителство и ремонти", hello: "Строителство и ремонти", Icon: HardHat, cpl: 18, close: 0.2, ads: "google", smm: false, web: "website", ai: false },
	{ id: "shop", label: "Онлайн магазин", hello: "Онлайн магазин", Icon: ShoppingBag, cpl: 10, close: 1, ads: "meta", smm: true, web: "custom", ai: false },
	{ id: "med", label: "Клиника / стоматология", hello: "Медицина и стоматология", Icon: Stethoscope, cpl: 12, close: 0.4, ads: "google", smm: true, web: "website", ai: true },
	{ id: "beauty", label: "Красота и здраве", hello: "Красота и здраве", Icon: Sparkles, cpl: 6, close: 0.4, ads: "meta", smm: true, web: "landing", ai: false },
	{ id: "food", label: "Ресторант / кафе", hello: "Ресторант / кафе / бар", Icon: UtensilsCrossed, cpl: 3, close: 0.5, ads: "meta", smm: true, web: "landing", ai: false },
	{ id: "home", label: "Услуги за дома", hello: "Услуги за дома", Icon: Wrench, cpl: 9, close: 0.35, ads: "google", smm: false, web: "landing", ai: false },
	{ id: "estate", label: "Недвижими имоти", hello: "Недвижими имоти", Icon: Building2, cpl: 20, close: 0.08, ads: "meta", smm: true, web: "website", ai: true },
	{ id: "b2b", label: "Производство / B2B", hello: "Производство", Icon: Factory, cpl: 30, close: 0.15, ads: "google", smm: false, web: "website", ai: false },
	{ id: "other", label: "Друго", hello: "Друго", Icon: CircleEllipsis, cpl: 10, close: 0.25, ads: "meta", smm: true, web: "website", ai: false },
];

const VALUES = [30, 50, 80, 120, 200, 300, 500, 800, 1200, 2000, 3500, 5000, 8000, 12000];
const valueBucket = (v: number) => (v < 50 ? "До 50 €" : v <= 200 ? "50 – 200 €" : v <= 1000 ? "200 – 1 000 €" : "Над 1 000 €");
const budgetBucket = (v: number) => (v < 250 ? "До 250 €" : v <= 500 ? "250 – 500 €" : v <= 1000 ? "500 – 1 000 €" : v <= 2500 ? "1 000 – 2 500 €" : "Над 2 500 €");
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export default function Configurator({ prices }: { prices: ConfigPrices }) {
	const [ind, setInd] = useState<Ind | null>(null);
	const [clients, setClients] = useState(20);
	const [vIdx, setVIdx] = useState(5);
	const [hasSite, setHasSite] = useState(true);
	const [form, setForm] = useState({ contactName: "", email: "", phone: "", website: "" });
	const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
	const [err, setErr] = useState("");
	const value = VALUES[vIdx];

	const plan = useMemo(() => {
		if (!ind) return null;
		const leads = Math.ceil(clients / ind.close);
		const budget = clamp(Math.round((leads * ind.cpl) / 50) * 50, 200, 20000);
		const both = budget >= 1500;
		const fee = (b: number) => feeFor({ fixed: prices.adsFixed, pctTiers: prices.pctTiers }, b);
		const adsFee = both ? fee(Math.round(budget * 0.55)) + fee(Math.round(budget * 0.45)) : fee(budget);
		const items: { id: string; label: string; price: number; monthly: boolean; note?: string }[] = [];
		const adName = both ? "Meta + Google реклама" : ind.ads === "meta" ? "Meta реклама (Facebook + Instagram)" : "Google реклама";
		items.push({ id: both ? "meta_ads" : ind.ads === "meta" ? "meta_ads" : "google_ads", label: adName, price: adsFee, monthly: true, note: `при бюджет ~€${fmtNum(budget)}/мес.` });
		if (both) items.push({ id: ind.ads === "meta" ? "google_ads" : "meta_ads", label: "", price: 0, monthly: true });
		if (ind.smm) items.push({ id: "smm", label: clients >= 50 ? "Социални мрежи — Scale" : "Социални мрежи — Growth", price: clients >= 50 ? prices.smmScale : prices.smmGrowth, monthly: true });
		if (!hasSite || ind.web === "advanced" || ind.web === "custom") {
			const w = ind.web;
			const map = { landing: ["web_landing", "Landing страница", prices.landing], website: ["website", "Бизнес сайт", prices.website], custom: ["web_custom", "Custom сайт / магазин", prices.custom], advanced: ["web_advanced", "Многоезичен сайт с резервации", prices.advanced] } as const;
			const [id, label, price] = map[w];
			items.push({ id, label: hasSite ? `${label} (подобрение/нов)` : label, price, monthly: false });
		}
		if (ind.ai || clients >= 40) items.push({ id: "ai_chatbot", label: "AI асистент за запитвания", price: prices.chatbot, monthly: false });
		const monthly = items.filter((x) => x.monthly).reduce((s, x) => s + x.price, 0);
		const once = items.filter((x) => !x.monthly).reduce((s, x) => s + x.price, 0);
		const revenue = clients * value;
		const cost = monthly + budget;
		const gp = ind.smm && monthly >= prices.growthPartner * 0.85;
		return { leads, budget, ids: Array.from(new Set(items.map((x) => x.id))), items: items.filter((x) => x.label), monthly, once, revenue, cost, roi: revenue / Math.max(1, cost), gp, both };
	}, [ind, clients, value, hasSite, prices]);

	const send = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!plan || !ind) return;
		if (!form.contactName.trim() || (!form.email.trim() && !form.phone.trim())) { setErr("Име и имейл или телефон."); return; }
		setState("sending"); setErr("");
		const summary = `Конфигуратор: ${ind.label}; ${clients} нови клиента/мес.; ~€${value} на клиент; ${hasSite ? "има сайт" : "няма сайт"}. Препоръка: ${plan.items.map((i) => i.label).join(", ")}. Бюджет ~€${plan.budget}/мес., такса ~€${plan.monthly}/мес., еднократно ~€${plan.once}.`;
		try {
			const r = await fetch("/api/hello", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					name: form.contactName,
					industry: ind.hello,
					industryOther: ind.hello === "Друго" ? ind.label : "",
					clientValue: valueBucket(value),
					budget: budgetBucket(plan.budget),
					goal: summary,
					services: plan.ids,
					servicesAdvise: false,
					partnerCode: resolvePartnerCode() || undefined,
					meta: { source: "configurator", path: "/", plan: { ...plan, industry: ind.id, clients, value } },
				}),
			});
			if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Грешка");
			setState("done");
		} catch (x) {
			setState("error");
			setErr(x instanceof Error ? x.message : "Грешка при изпращане");
		}
	};

	return (
		<section id="sglobi" data-stage="3" className="section relative">
			<div className="wrap">
				<div className="max-w-3xl">
					<span data-reveal className="eyebrow">Сглоби си ефекта</span>
					<h2 data-reveal style={{ ["--d" as string]: "0.05s" }} className="display t-2 mt-5 text-balance">Три въпроса. Точен план. <span className="text-gradient">С цените.</span></h2>
					<p data-reveal style={{ ["--d" as string]: "0.1s" }} className="lead mt-5 max-w-2xl">Без таблици и жаргон: кажете ни какъв е бизнесът и колко клиента искате — показваме какво бихме направили, колко струва и какво може да върне.</p>
				</div>

				<div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
					<div className="card p-6 md:p-8">
						<fieldset>
							<legend className="mb-4 flex items-center gap-3 text-[15px] font-semibold"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#f26522] text-[13px] font-black text-white">1</span>С какво се занимавате?</legend>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
								{BENCH.map((b) => (
									<button key={b.id} type="button" onClick={() => setInd(b)} aria-pressed={ind?.id === b.id}
										className={`flex min-h-[92px] flex-col items-start justify-between gap-2 rounded-2xl p-3 text-left text-[13px] font-medium leading-snug ring-1 transition-all duration-300 ${ind?.id === b.id ? "bg-[#f26522]/15 text-white ring-[#f26522]" : "bg-white/[0.02] text-white/70 ring-white/10 hover:bg-white/[0.05] hover:text-white"}`}>
										<b.Icon size={20} className={ind?.id === b.id ? "text-[#f5813a]" : "text-white/40"} />{b.label}
									</button>
								))}
							</div>
						</fieldset>

						<div className="mt-9">
							<label htmlFor="cfg-clients" className="flex items-center justify-between gap-3 text-[15px] font-semibold">
								<span className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#f26522] text-[13px] font-black text-white">2</span>Колко нови клиента искате на месец?</span>
								<span className="font-display text-[26px] font-black tabular text-gradient">{clients}</span>
							</label>
							<input id="cfg-clients" type="range" min={5} max={150} step={5} value={clients} onChange={(e) => setClients(Number(e.target.value))} className="mt-4 w-full accent-[#f26522]" />
						</div>

						<div className="mt-8">
							<label htmlFor="cfg-value" className="flex items-center justify-between gap-3 text-[15px] font-semibold">
								<span className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#f26522] text-[13px] font-black text-white">3</span>Колко ви носи един клиент?</span>
								<span className="font-display text-[26px] font-black tabular text-gradient">€{fmtNum(value)}</span>
							</label>
							<input id="cfg-value" type="range" min={0} max={VALUES.length - 1} step={1} value={vIdx} onChange={(e) => setVIdx(Number(e.target.value))} className="mt-4 w-full accent-[#f26522]" />
						</div>

						<label className="mt-8 flex cursor-pointer items-center gap-3 text-[15px] text-white/80">
							<input type="checkbox" checked={hasSite} onChange={(e) => setHasSite(e.target.checked)} className="h-5 w-5 accent-[#f26522]" />
							Имам работещ сайт
						</label>
					</div>

					<div className="card relative flex flex-col bg-[#0c0d10]/85 p-6 backdrop-blur-md md:p-8" aria-live="polite">
						{!plan ? (
							<div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
								<div className="relative mb-6 h-24 w-24">
									<span className="absolute inset-0 animate-ping rounded-full bg-[#f26522]/20" />
									<span className="absolute inset-4 rounded-full bg-gradient-to-br from-[#f59c1a] to-[#e8450a] shadow-[0_0_60px_10px_rgba(242,101,34,.35)]" />
								</div>
								<p className="max-w-[26ch] text-[16px] text-[var(--muted)]">Изберете бранша — ядрото ще се сглоби от модулите, които ви трябват.</p>
							</div>
						) : (
							<>
								<div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--dim)]">Вашият план</div>
								<ul className="mt-5 space-y-3">
									{plan.items.map((it) => (
										<li key={it.id} className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3">
											<span className="flex gap-3 text-[15px]"><Check size={17} className="mt-0.5 flex-shrink-0 text-[#f26522]" /><span>{it.label}{it.note && <span className="block text-[12px] text-[var(--dim)]">{it.note}</span>}</span></span>
											<span className="whitespace-nowrap text-[15px] font-semibold tabular">€{fmtNum(it.price)}{it.monthly ? <span className="text-[12px] font-normal text-[var(--dim)]">/мес.</span> : <span className="text-[12px] font-normal text-[var(--dim)]"> еднокр.</span>}</span>
										</li>
									))}
								</ul>
								<dl className="mt-6 grid grid-cols-2 gap-4">
									<div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"><dt className="text-[12px] text-[var(--dim)]">Такса към нас</dt><dd className="mt-1 font-display text-[28px] font-black tabular">€{fmtNum(plan.monthly)}<span className="text-[13px] font-medium text-[var(--dim)]">/мес.</span></dd></div>
									<div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"><dt className="text-[12px] text-[var(--dim)]">Рекламен бюджет*</dt><dd className="mt-1 font-display text-[28px] font-black tabular">€{fmtNum(plan.budget)}<span className="text-[13px] font-medium text-[var(--dim)]">/мес.</span></dd></div>
									<div className="col-span-2 rounded-2xl bg-gradient-to-br from-[#f26522]/20 to-transparent p-4 ring-1 ring-[#f26522]/30"><dt className="text-[12px] text-[#ffd2b8]">Оборот от {clients} нови клиента*</dt><dd className="mt-1 font-display text-[32px] font-black tabular">€{fmtNum(plan.revenue)}<span className="ml-2 text-[14px] font-semibold text-[#ffd2b8]">≈ {plan.roi.toFixed(1)}× разхода</span></dd></div>
								</dl>
								{plan.gp && <p className="mt-4 rounded-xl bg-[#2d1060]/50 p-3 text-[13px] text-[#d9ccff] ring-1 ring-[#6b3bd6]/40">Growth Partner покрива реклама + социални мрежи + сайт + AI за €{prices.growthPartner}/мес. (отделно ~€{prices.growthCompare}) — по-изгодно за вашия план.</p>}
								<p className="mt-4 text-[12px] leading-relaxed text-[var(--dim)]">*Ориентировъчно: ~{plan.leads} запитвания при средни за бранша цени. Точните числа казваме след безплатния одит. Setup на рекламата: €{prices.setupMin}–{prices.setupMax} еднократно.</p>

								{state === "done" ? (
									<div className="mt-6 rounded-2xl bg-emerald-500/10 p-5 text-[15px] text-emerald-200 ring-1 ring-emerald-400/30">Планът е изпратен. Ще ви се обадим до 1 работен ден с точните числа.</div>
								) : (
									<form onSubmit={send} className="mt-6 grid gap-2 sm:grid-cols-2">
										<input aria-label="Име" placeholder="Име" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="h-12 rounded-full bg-white/[0.04] px-5 text-[15px] outline-none ring-1 ring-white/10 focus:ring-[#f26522]" />
										<input aria-label="Имейл или телефон" placeholder="Имейл" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-full bg-white/[0.04] px-5 text-[15px] outline-none ring-1 ring-white/10 focus:ring-[#f26522]" />
										<input aria-label="Телефон" placeholder="Телефон (по избор)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-full bg-white/[0.04] px-5 text-[15px] outline-none ring-1 ring-white/10 focus:ring-[#f26522] sm:col-span-2" />
										<input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
										<button type="submit" disabled={state === "sending"} className="btn-x btn-orange sm:col-span-2" data-magnetic="0.15">
											<span className="btn-fill" aria-hidden />
											<span className="relative inline-flex items-center gap-2">{state === "sending" ? <Loader2 size={18} className="animate-spin" /> : null}Изпратете ми плана<ArrowRight size={18} /></span>
										</button>
										{err && <p className="text-[13px] text-red-300 sm:col-span-2">{err}</p>}
									</form>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
