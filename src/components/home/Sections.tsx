// ── Останалите секции на началната страница (server components) ─────────────
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Radar, Eye, CalendarDays, Gauge, MessageSquareText, Clock, BarChart3 } from "lucide-react";
import Button from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/bits";
import { PriceTag, GrowthCard } from "@/components/ui/PriceCard";
import { byCategory, CATEGORY_META, type PublicCatalog, type ServiceCategory } from "@/lib/services";
import type { SiteResource } from "@/lib/content";

/* ── Цени (тийзър) ───────────────────────────────────────────────────────── */
export function PricingTeaser({ catalog }: { catalog: PublicCatalog }) {
	const gp = byCategory(catalog, "growth")[0];
	const cats: ServiceCategory[] = ["reklama", "smm", "web", "ai"];
	return (
		<section data-stage="3" className="section relative">
			<div className="wrap">
				<SectionHead eyebrow="Цени" title={<>Цените са на сайта. <span className="text-gradient">Всичките.</span></>} text="Без „обадете се за оферта“ за всяко нещо. Бюджетът за реклама е отделно и се плаща директно на Meta и Google." />
				{gp && <div data-reveal className="mt-14"><GrowthCard s={gp} /></div>}
				<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{cats.map((c, i) => {
						const s = byCategory(catalog, c)[0];
						if (!s) return null;
						return (
							<Link key={c} href={CATEGORY_META[c].href} data-reveal style={{ ["--d" as string]: `${i * 0.06}s` }} className="card card-spot group flex min-h-[230px] flex-col justify-between p-6">
								<div className="flex items-center justify-between">
									<span className="font-display text-[20px] font-extrabold">{CATEGORY_META[c].label}</span>
									<ArrowUpRight size={18} className="text-white/40 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#f26522]" />
								</div>
								<div>
									<PriceTag s={s} />
									<p className="mt-2 text-[13px] text-[var(--muted)]">{s.short}</p>
								</div>
							</Link>
						);
					})}
				</div>
				<div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
					<Button href="/ceni" variant="line">Всички цени и калкулатор</Button>
				</div>
			</div>
		</section>
	);
}

/* ── Гаранцията ──────────────────────────────────────────────────────────── */
export function Guarantee({ headline, text }: { headline?: string; text?: string }) {
	return (
		<section data-stage="3" className="relative py-10">
			<div className="wrap">
				<div data-reveal className="card flex flex-col gap-6 bg-[#0c0d10]/80 p-7 backdrop-blur md:flex-row md:items-center md:justify-between md:p-10">
					<div className="flex items-start gap-5">
						<span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-[#f26522]/15 text-[#f5813a] ring-1 ring-[#f26522]/35"><ShieldCheck size={26} /></span>
						<div>
							<h2 className="font-display text-[clamp(24px,2.6vw,36px)] font-black tracking-[-0.02em]">{headline || "Първи месец без риск"}</h2>
							<p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-[var(--muted)]">{text || "Договаряме един измерим критерий преди старта. Не го ли постигнем за 30 дни — не плащате таксата ни."}</p>
						</div>
					</div>
					<Button href="/hello">Започваме с пилот</Button>
				</div>
			</div>
		</section>
	);
}

/* ── Различното ─────────────────────────────────────────────────────────── */
const DIFF = [
	["Бюджетът", "Минава през агенцията", "Плащате директно на Meta и Google — виждате всяко евро"],
	["Отчетът", "PDF с „обхват“ веднъж месечно", "Всяка седмица: похарчено, запитвания, цена на запитване"],
	["Рискът", "Договор за 12 месеца", "Пилотен месец: без резултат — без такса"],
	["Екипът", "Реклама тук, сайт там, никой не отговаря", "Реклама, съдържание, сайт и AI — един екип, една цел"],
	["Цените", "„Обадете се за оферта“", "На сайта, с калкулатор"],
	["Акаунтите", "На името на агенцията", "На ваше име — завинаги"],
];
export function Difference() {
	return (
		<section data-stage="3" className="section relative">
			<div className="wrap">
				<SectionHead eyebrow="Разликата" title={<>Какво правим <span className="text-gradient">по-различно</span></>} />
				<div className="mt-14 overflow-hidden rounded-[22px] ring-1 ring-white/[0.08]">
					<div className="hidden grid-cols-[180px_1fr_1fr] bg-white/[0.03] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--dim)] md:grid">
						<span />
						<span>Типична агенция</span>
						<span className="text-[#f5813a]">Digital Effect</span>
					</div>
					{DIFF.map(([t, them, us], i) => (
						<div key={t} data-reveal style={{ ["--d" as string]: `${i * 0.05}s` }} className="grid gap-2 border-t border-white/[0.06] bg-[#07080a]/60 px-6 py-5 backdrop-blur-sm md:grid-cols-[180px_1fr_1fr] md:gap-6">
							<span className="font-display text-[17px] font-extrabold">{t}</span>
							<span className="text-[15px] text-[var(--dim)] line-through decoration-white/20">{them}</span>
							<span className="text-[15px] text-[var(--text)]">{us}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

/* ── Безплатни ресурси ───────────────────────────────────────────────────── */
const RES_ICON: Record<string, typeof Radar> = { radar: Radar, ads: Eye, calendar: CalendarDays, audit: Gauge, chat: MessageSquareText, clock: Clock, index: BarChart3 };
export function ResourcesStrip({ resources, title = true }: { resources: SiteResource[]; title?: boolean }) {
	if (!resources.length) return null;
	return (
		<section data-stage="3" className="section relative">
			<div className="wrap">
				{title && <SectionHead eyebrow="Безплатно" title={<>Инструменти, <span className="text-gradient">които ползваме и ние</span></>} text="Вижте къде сте спрямо конкурентите, преди да похарчите едно евро. Без обаждане, без ангажимент." />}
				<div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{resources.map((r, i) => {
						const Icon = RES_ICON[r.data.visual || ""] || Radar;
						const live = r.status === "live" && r.data.href;
						return (
							<Link key={r.slug} href={live ? r.data.href! : `/resursi/${r.slug}`} data-reveal style={{ ["--d" as string]: `${i * 0.06}s` }} className={`card card-spot group flex min-h-[280px] flex-col justify-between p-6 ${live ? "ring-1 ring-[#f26522]/40" : ""}`}>
								<div className="flex items-center justify-between">
									<span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f26522]/12 text-[#f5813a] ring-1 ring-[#f26522]/30"><Icon size={22} /></span>
									<span className={`chip ${live ? "chip-orange" : ""}`}>{live ? "Активен" : "Скоро"}</span>
								</div>
								<div>
									<span className="font-display text-[12px] font-black tabular text-[var(--dim)]">{r.data.code}</span>
									<h3 className="mt-1 font-display text-[22px] font-extrabold tracking-[-0.015em]">{r.data.title}</h3>
									<p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{r.data.short}</p>
									<span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-white">{live ? r.data.cta || "Отвори" : "Запиши ме първи"}<ArrowUpRight size={16} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}

/* ── Как започваме ───────────────────────────────────────────────────────── */
const STEPS = [
	{ t: "Разговор — 15 минути", d: "Какво продавате, на кого, колко струва един клиент. Без презентации." },
	{ t: "Одит и план", d: "Реклама, профили, сайт, конкуренти. Получавате план с числа и цена." },
	{ t: "Пилотен месец", d: "Един измерим критерий. Постигаме го — продължаваме. Не — не плащате таксата." },
	{ t: "Мащабиране", d: "Бюджетът отива там, където има запитвания. Всяка седмица — отчет." },
];
export function Process() {
	return (
		<section data-stage="3" className="section relative">
			<div className="wrap">
				<SectionHead eyebrow="Как започваме" title={<>Четири стъпки. <span className="text-gradient">Без изненади.</span></>} />
				<ol className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{STEPS.map((s, i) => (
						<li key={s.t} data-reveal style={{ ["--d" as string]: `${i * 0.07}s` }} className="card p-6">
							<span className="font-display text-[56px] font-black leading-none tracking-[-0.04em] text-outline">0{i + 1}</span>
							<h3 className="mt-6 font-display text-[20px] font-extrabold">{s.t}</h3>
							<p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{s.d}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
