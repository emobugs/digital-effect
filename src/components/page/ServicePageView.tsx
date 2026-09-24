// ═══════════════════════════════════════════════════════════════════════════
// Шаблонът на страница за услуга / индустрия / град — пълни се от de-os.
// Ред: hero → Накратко → ползи → цени (+ калкулатор) → „те / ние“ → процес →
// кейс → безплатен ресурс → ЧЗВ → свързани → контакт. 3D: модулът на
// страницата излиза напред (data-scene-focus).
// ═══════════════════════════════════════════════════════════════════════════
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, Wallet, FileBarChart2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Breadcrumbs, Faq, Summary, SectionHead, JsonLd } from "@/components/ui/bits";
import { ServicePrice } from "@/components/ui/PriceCard";
import { WaitlistForm } from "@/components/ui/Forms";
import CtaBand from "@/components/ui/CtaBand";
import AdsFeeCalc from "./AdsFeeCalc";
import { byIds, priceParts, type PublicCatalog } from "@/lib/services";
import { pagePath, type SitePage, type SiteContent } from "@/lib/content";
import { caseBySlug } from "@/data/cases";
import { serviceSchema, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

const SERVICE_PATH: Record<string, string> = {
	meta_ads: "/uslugi/reklama/facebook-instagram", google_ads: "/uslugi/reklama/google-ads", smm: "/uslugi/socialni-mrezhi",
	web_landing: "/uslugi/izrabotka-na-sait", website: "/uslugi/izrabotka-na-sait", web_custom: "/uslugi/izrabotka-na-sait", web_advanced: "/uslugi/izrabotka-na-sait",
	site_support: "/uslugi/izrabotka-na-sait/poddrazhka", ai_chatbot: "/uslugi/ai-avtomatizacia/chatbot", automation: "/uslugi/ai-avtomatizacia",
	crm_automation: "/uslugi/ai-avtomatizacia", ai_agent: "/uslugi/ai-avtomatizacia", automation_support: "/uslugi/ai-avtomatizacia", growth_partner: "/uslugi/growth-partner",
};

export default function ServicePageView({ page, catalog, content, crumbs }: { page: SitePage; catalog: PublicCatalog; content: SiteContent; crumbs: { name: string; href: string }[] }) {
	const d = page.data;
	const path = pagePath(page);
	const url = `${SITE.url}${path}`;
	const services = byIds(catalog, d.serviceIds || []);
	const lead = services[0];
	const ads = services.find((s) => s.kind === "fee_budget" && s.pctTiers?.length);
	const kase = caseBySlug(d.caseSlug);
	const res = d.resourceSlug ? content.resources.find((r) => r.slug === d.resourceSlug) : null;
	const related = (d.related || []).map((href) => ({ href, page: content.pages.find((p) => pagePath(p) === href) })).filter((r) => r.page || r.href === "/ceni");
	const p = lead ? priceParts(lead) : null;
	const isOwnPage = (id: string) => SERVICE_PATH[id] === path;

	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[
				webPageSchema({ url, name: d.seoTitle || d.h1, description: d.metaDescription, updated: page.updatedAt }),
				serviceSchema({ name: d.title, description: d.summary || d.lead, url, serviceType: d.title, services, areaServed: d.city }),
			]} />

			{/* ── Hero ─────────────────────────────────────────── */}
			<section data-stage="0" data-scene-focus={d.module || "growth"} className="relative flex min-h-[92svh] flex-col justify-end pb-14 pt-32">
				<div className="wrap">
					<Breadcrumbs items={crumbs} />
					{d.eyebrow && <div className="fade-up mb-6" style={{ ["--d" as string]: "0.05s" }}><span className="eyebrow">{d.eyebrow}</span></div>}
					<h1 className="display t-1 max-w-[16ch] text-balance">
						<span className="rise"><span style={{ ["--i" as string]: 0 }}>{d.h1}</span></span>
					</h1>
					{d.lead && <p className="lead fade-up mt-7 max-w-[58ch]" style={{ ["--d" as string]: "0.35s" }}>{d.lead}</p>}
					<div className="fade-up mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "0.5s" }}>
						<Button href="/hello">Вземи оферта за 2 минути</Button>
						{services.length > 0 && <Button href="#ceni" variant="line" arrow="none">{p ? `${p.prefix} ${p.value} ${p.suffix}`.trim() : "Цени"}</Button>}
					</div>
					<ul className="fade-up mt-10 flex flex-wrap gap-2" style={{ ["--d" as string]: "0.65s" }}>
						{ads && <li className="chip"><ShieldCheck size={14} className="text-[#f26522]" />Първи месец без риск</li>}
						{ads && <li className="chip"><Wallet size={14} className="text-[#f26522]" />Бюджетът е ваш</li>}
						<li className="chip"><FileBarChart2 size={14} className="text-[#f26522]" />Отчет на човешки език</li>
					</ul>
				</div>
			</section>

			<div data-stage="1">
				{/* ── Накратко ─────────────────────────────────── */}
				{d.summary && <section className="relative pb-6 pt-10"><div className="wrap"><Summary text={d.summary} updated={page.updatedAt} /></div></section>}

				{/* ── Ползи ───────────────────────────────────── */}
				{!!d.benefits?.length && (
					<section className="section relative">
						<div className="wrap">
							<SectionHead eyebrow="Какво получавате" title={<>Ползите, <span className="text-gradient">в числа</span></>} />
							<div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{d.benefits.map((b, i) => (
									<article key={b.title} data-reveal style={{ ["--d" as string]: `${i * 0.06}s` }} className="card card-spot flex min-h-[260px] flex-col justify-between p-6">
										{b.stat && <span className="font-display text-[clamp(26px,2.4vw,34px)] font-black tracking-[-0.02em] text-gradient">{b.stat}</span>}
										<div>
											<h3 className="font-display text-[19px] font-extrabold leading-snug">{b.title}</h3>
											<p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{b.text}</p>
										</div>
									</article>
								))}
							</div>
						</div>
					</section>
				)}

				{/* ── Цени ────────────────────────────────────── */}
				{services.length > 0 && (
					<section id="ceni" className="section relative scroll-mt-24">
						<div className="wrap">
							<SectionHead eyebrow="Цени" title={<>Колко струва — <span className="text-gradient">без уговорки</span></>} text="Цените идват директно от ценоразписа ни — същите са в офертата и в договора." />
							<div className={`mt-14 grid gap-4 ${services.length === 1 ? "lg:grid-cols-[1fr_1fr]" : services.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
								{services.map((s) => <div key={s.id} data-reveal><ServicePrice s={s} href={isOwnPage(s.id) ? undefined : SERVICE_PATH[s.id]} /></div>)}
								{ads && services.length === 1 && <div data-reveal><AdsFeeCalc fixed={ads.price.fixed ?? 150} tiers={ads.pctTiers!} min={ads.budget?.min} max={ads.budget?.max} setup={ads.setup} /></div>}
							</div>
							{ads && services.length > 1 && <div data-reveal className="mt-4 max-w-3xl"><AdsFeeCalc fixed={ads.price.fixed ?? 150} tiers={ads.pctTiers!} min={ads.budget?.min} max={ads.budget?.max} setup={ads.setup} /></div>}
							{ads && catalog.pilot?.text && <p data-reveal className="mt-6 flex max-w-3xl gap-3 text-[15px] text-[var(--muted)]"><ShieldCheck size={20} className="flex-shrink-0 text-[#f26522]" /><span><strong className="text-white">{catalog.pilot.headline}.</strong> {catalog.pilot.text}</span></p>}
						</div>
					</section>
				)}

				{/* ── Те / ние ────────────────────────────────── */}
				{!!d.compare?.length && (
					<section className="section relative">
						<div className="wrap">
							<SectionHead eyebrow="Разликата" title={<>Какво правим <span className="text-gradient">по-добре</span></>} />
							<div className="mt-14 overflow-hidden rounded-[22px] ring-1 ring-white/[0.08]">
								<div className="hidden grid-cols-[200px_1fr_1fr] bg-white/[0.03] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--dim)] md:grid">
									<span /><span>{d.compareLabels?.them || "Типично"}</span><span className="text-[#f5813a]">{d.compareLabels?.us || "Digital Effect"}</span>
								</div>
								{d.compare.map((r, i) => (
									<div key={r.topic} data-reveal style={{ ["--d" as string]: `${i * 0.05}s` }} className="grid gap-2 border-t border-white/[0.06] bg-[#07080a]/60 px-6 py-5 backdrop-blur-sm md:grid-cols-[200px_1fr_1fr] md:gap-6">
										<span className="font-display text-[17px] font-extrabold">{r.topic}</span>
										<span className="text-[15px] text-[var(--dim)]"><span className="mr-2 text-[11px] uppercase tracking-[0.14em] md:hidden">{d.compareLabels?.them || "Типично"}:</span>{r.them}</span>
										<span className="text-[15px] text-[var(--text)]"><span className="mr-2 text-[11px] uppercase tracking-[0.14em] text-[#f5813a] md:hidden">{d.compareLabels?.us || "Ние"}:</span>{r.us}</span>
									</div>
								))}
							</div>
						</div>
					</section>
				)}

				{/* ── Процес ─────────────────────────────────── */}
				{!!d.process?.length && (
					<section className="section relative">
						<div className="wrap">
							<SectionHead eyebrow="Как работим" title={<>Стъпка <span className="text-gradient">по стъпка</span></>} />
							<ol className="relative mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
								{d.process.map((st, i) => (
									<li key={st.title} data-reveal style={{ ["--d" as string]: `${i * 0.07}s` }} className="card p-6">
										<div className="flex items-center justify-between"><span className="chip chip-orange">{st.when || `Стъпка ${i + 1}`}</span><span className="font-display text-[13px] font-black tabular text-[var(--dim)]">0{i + 1}</span></div>
										<h3 className="mt-6 font-display text-[20px] font-extrabold">{st.title}</h3>
										<p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{st.text}</p>
									</li>
								))}
							</ol>
						</div>
					</section>
				)}

				{/* ── Кейс ───────────────────────────────────── */}
				{kase && (
					<section className="section relative">
						<div className="wrap">
							<Link href={`/rezultati/${kase.slug}`} data-reveal data-cursor="Виж" className="card group grid overflow-hidden md:grid-cols-[1.2fr_1fr]">
								<div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[380px]">
									<Image src={kase.image} alt={`${kase.client} — ${kase.category}`} fill sizes="(max-width:768px) 100vw, 55vw" className="object-cover object-top transition-transform duration-[1.4s] group-hover:scale-[1.04]" />
								</div>
								<div className="flex flex-col justify-between gap-8 p-7 md:p-10">
									<div>
										<span className="eyebrow">Кейс</span>
										<h2 className="display mt-5 text-[clamp(32px,3.4vw,50px)]">{kase.client}</h2>
										<p className="mt-4 text-[16px] leading-relaxed text-[var(--muted)]">{kase.short}</p>
									</div>
									{kase.results.length > 0 && (
										<dl className="grid grid-cols-2 gap-4">{kase.results.slice(0, 4).map((r) => <div key={r.label}><dd className="font-display text-[30px] font-black text-gradient">{r.value}</dd><dt className="text-[12px] text-[var(--dim)]">{r.label}</dt></div>)}</dl>
									)}
									<span className="inline-flex items-center gap-2 text-[15px] font-semibold">Целият кейс <ArrowUpRight size={17} /></span>
								</div>
							</Link>
						</div>
					</section>
				)}

				{/* ── Безплатен ресурс ───────────────────────── */}
				{res && (
					<section className="relative py-10">
						<div className="wrap">
							<div data-reveal className="grid gap-8 overflow-hidden rounded-[24px] p-7 md:grid-cols-[1fr_1fr] md:p-10" style={{ background: "radial-gradient(80% 120% at 0% 0%, rgba(242,101,34,.22), transparent 55%), #0c0d10", boxShadow: "inset 0 0 0 1px rgba(242,101,34,.25)" }}>
								<div>
									<span className="chip chip-orange">{res.data.code} · Безплатно{res.status === "soon" ? " · скоро" : ""}</span>
									<h2 className="mt-5 font-display text-[clamp(26px,2.8vw,40px)] font-black tracking-[-0.02em]">{res.data.title}</h2>
									<p className="mt-3 text-[16px] leading-relaxed text-[var(--muted)]">{res.data.description}</p>
									{res.data.outcome && <p className="mt-4 text-[14px] text-[#ffd2b8]">Получавате: {res.data.outcome}</p>}
								</div>
								<div className="flex items-center">
									{res.status === "live" && res.data.href ? <Button href={res.data.href}>{res.data.cta || "Отвори"}</Button> : <div className="w-full"><WaitlistForm resource={res.slug} title={res.data.title} /></div>}
								</div>
							</div>
						</div>
					</section>
				)}

				{/* ── ЧЗВ ────────────────────────────────────── */}
				{!!d.faq?.length && (
					<section className="section relative">
						<div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
							<SectionHead eyebrow="Въпроси" title={<>Често <span className="text-gradient">питат</span></>} />
							<Faq items={d.faq} />
						</div>
					</section>
				)}

				{/* ── Свързани ───────────────────────────────── */}
				{related.length > 0 && (
					<section className="relative pb-6">
						<div className="wrap">
							<h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--dim)]">Свързани</h2>
							<div className="flex flex-wrap gap-2">
								{related.map((r) => (
									<Link key={r.href} href={r.href} className="chip !py-2.5 !text-[14px] transition-colors hover:!text-white">{r.page?.data.title || "Цени"}<ArrowUpRight size={14} /></Link>
								))}
							</div>
						</div>
					</section>
				)}

				<CtaBand source={path} />
			</div>
		</main>
	);
}
