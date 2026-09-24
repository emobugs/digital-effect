// ── /ceni — целият ценоразпис от de-os + калкулатор на таксата за реклама ─────
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { Breadcrumbs, Faq, JsonLd, SectionHead } from "@/components/ui/bits";
import { ServicePrice, GrowthCard } from "@/components/ui/PriceCard";
import AdsFeeCalc from "@/components/page/AdsFeeCalc";
import CtaBand from "@/components/ui/CtaBand";
import Button from "@/components/ui/Button";
import { getCatalog, byCategory, CATEGORY_META, type ServiceCategory } from "@/lib/services";
import { tierRows, feeFor } from "@/lib/fees";
import { pageMeta } from "@/lib/meta";
import { offerOf, webPageSchema, ORG_ID } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = pageMeta({
	title: "Цени — реклама от €170, сайт от €449, SMM от €199 | Digital Effect",
	description: "Всички цени на Digital Effect: управление на Facebook и Google реклама, социални мрежи, изработка и поддръжка на сайт, AI чатботове и автоматизации. Калкулатор на таксата.",
	path: "/ceni",
	ogTitle: "Цените са на сайта. Всичките.",
	eyebrow: "Цени",
});

const ORDER: ServiceCategory[] = ["reklama", "smm", "web", "ai"];

export default async function Prices() {
	const catalog = await getCatalog(false);
	const gp = byCategory(catalog, "growth")[0];
	const ads = byCategory(catalog, "reklama").find((s) => s.pctTiers?.length);
	const example = ads ? [500, 1000, 2000, 5000].map((b) => [b, feeFor({ fixed: ads.price.fixed ?? 150, pctTiers: ads.pctTiers }, b)]) : [];
	const faq = [
		...(ads ? [{ q: "Как се смята таксата за реклама?", a: `€${ads.price.fixed ?? 150} фиксирано + процент само върху съответната част от бюджета: ${tierRows(ads.pctTiers).map((r) => `${r.range} — ${r.pct}%`).join("; ")}. Например ${example.map(([b, f]) => `€${b} бюджет → €${f} такса`).join(", ")}.` }] : []),
		{ q: "Бюджетът за реклама включен ли е?", a: "Не. Бюджетът се плаща директно на Meta или Google от вашата карта и остава видим в рекламния акаунт. Ние фактурираме само таксата си." },
		{ q: "Има ли ДДС?", a: "[ЗА ПОПЪЛВАНЕ] Цените са без ДДС / фирмата не е регистрирана по ДДС — уточни с счетоводителя." },
		{ q: "Какъв е минималният срок?", a: "Първият месец може да е пилотен — без дългосрочно обвързване. Стандартният договор е с минимален срок 3 месеца, после с 30-дневно предизвестие." },
		{ q: "Мога ли да комбинирам услуги?", a: "Да — при комбинация на реклама и социални мрежи офертата предлага отстъпка, а Growth Partner събира цялата система в един месечен план." },
	];
	const all = [gp, ...ORDER.flatMap((c) => byCategory(catalog, c))].filter(Boolean);
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[
				webPageSchema({ url: `${SITE.url}/ceni`, name: "Цени на Digital Effect" }),
				{ "@context": "https://schema.org", "@type": "OfferCatalog", name: "Ценоразпис на Digital Effect", url: `${SITE.url}/ceni`, provider: { "@id": ORG_ID }, itemListElement: all.map((s) => offerOf(s!, `${SITE.url}/ceni`)).filter(Boolean) },
			]} />
			<section data-stage="3" className="relative pb-6 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Цени", href: "/ceni" }]} />
					<h1 className="display t-1 max-w-[14ch]"><span className="rise"><span>Цените са на сайта. <span className="text-gradient">Всичките.</span></span></span></h1>
					<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>Същите числа са в офертата и в договора — идват от едно място. Рекламният бюджет е отделно и се плаща директно на платформите.</p>
					<nav aria-label="Категории" className="fade-up mt-8 flex flex-wrap gap-2" style={{ ["--d" as string]: "0.45s" }}>
						{gp && <a href="#growth" className="chip chip-orange">Growth Partner</a>}
						{ORDER.map((c) => <a key={c} href={`#${c}`} className="chip hover:!text-white">{CATEGORY_META[c].label}</a>)}
					</nav>
				</div>
			</section>

			{gp && <section id="growth" className="relative scroll-mt-24 py-10"><div className="wrap"><div data-reveal><GrowthCard s={gp} /></div></div></section>}

			{catalog.pilot?.text && (
				<section className="relative py-4"><div className="wrap"><p data-reveal className="card flex gap-4 p-6 text-[16px] text-[var(--muted)]"><ShieldCheck size={24} className="flex-shrink-0 text-[#f26522]" /><span><strong className="text-white">{catalog.pilot.headline}.</strong> {catalog.pilot.text}</span></p></div></section>
			)}

			{ORDER.map((c) => {
				const list = byCategory(catalog, c);
				if (!list.length) return null;
				return (
					<section key={c} id={c} className="section relative scroll-mt-24 !pb-6">
						<div className="wrap">
							<div className="flex flex-wrap items-end justify-between gap-4">
								<SectionHead title={CATEGORY_META[c].label} />
								<Link href={CATEGORY_META[c].href} className="chip hover:!text-white">Какво включва<ArrowUpRight size={12} /></Link>
							</div>
							<div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{list.map((s) => <div key={s.id} data-reveal><ServicePrice s={s} /></div>)}
								{c === "reklama" && ads && <div data-reveal><AdsFeeCalc fixed={ads.price.fixed ?? 150} tiers={ads.pctTiers!} min={ads.budget?.min} max={ads.budget?.max} setup={ads.setup} /></div>}
							</div>
						</div>
					</section>
				);
			})}

			<section className="section relative">
				<div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<SectionHead eyebrow="Въпроси" title={<>За цените</>} />
						<div className="mt-8"><Button href="/hello">Вземи точна оферта</Button></div>
					</div>
					<Faq items={faq.filter((f) => !f.a.startsWith("[ЗА ПОПЪЛВАНЕ]"))} />
				</div>
			</section>
			<CtaBand source="/ceni" />
		</main>
	);
}
