// ── /uslugi — всички услуги, индустрии и градове на едно място ─────────────────
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs, JsonLd, SectionHead } from "@/components/ui/bits";
import { GrowthCard } from "@/components/ui/PriceCard";
import CtaBand from "@/components/ui/CtaBand";
import { getSiteContent, pagePath } from "@/lib/content";
import { getCatalog, byIds, byCategory, priceParts } from "@/lib/services";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = pageMeta({
	title: "Услуги — реклама, социални мрежи, сайтове, AI | Digital Effect",
	description: "Facebook, Instagram и Google реклама, управление на социални мрежи, изработка на сайтове и AI автоматизация. Всички услуги и цени на Digital Effect.",
	path: "/uslugi",
	ogTitle: "Услуги",
});

export default async function Services() {
	const [c, catalog] = await Promise.all([getSiteContent(), getCatalog(false)]);
	const services = c.pages.filter((p) => p.type === "service" && !p.slug.includes("/") && p.slug !== "growth-partner").sort((a, b) => a.sort - b.sort);
	const subs = c.pages.filter((p) => p.type === "service" && p.slug.includes("/"));
	const industries = c.pages.filter((p) => p.type === "industry").sort((a, b) => a.sort - b.sort);
	const cities = c.pages.filter((p) => p.type === "city" && p.data.indexable !== false).sort((a, b) => a.sort - b.sort);
	const gp = byCategory(catalog, "growth")[0];
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[
				webPageSchema({ url: `${SITE.url}/uslugi`, name: "Услуги на Digital Effect", type: "CollectionPage" }),
				{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: [...services, ...subs].map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE.url}${pagePath(p)}`, name: p.data.title })) },
			]} />
			<section data-stage="3" className="relative pb-10 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Услуги", href: "/uslugi" }]} />
					<h1 className="display t-1 max-w-[14ch]"><span className="rise"><span>Всичко, което носи <span className="text-gradient">клиенти</span></span></span></h1>
					<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>Четири части на една система. Вземете една — или цялата.</p>
				</div>
			</section>

			<section className="relative pb-10">
				<div className="wrap grid gap-4 md:grid-cols-2">
					{services.map((p, i) => {
						const s = byIds(catalog, p.data.serviceIds || [])[0];
						const pr = s ? priceParts(s) : null;
						const children = subs.filter((x) => x.slug.startsWith(`${p.slug}/`));
						return (
							<article key={p.slug} data-reveal style={{ ["--d" as string]: `${i * 0.06}s` }} className="card card-spot flex min-h-[320px] flex-col justify-between p-7 md:p-9">
								<div>
									<div className="flex items-center justify-between"><span className="font-display text-[13px] font-black tabular text-[#f26522]">0{i + 1}</span>{pr && <span className="chip">{pr.prefix} {pr.value} {pr.suffix}</span>}</div>
									<h2 className="display mt-6 text-[clamp(30px,3vw,44px)]"><Link href={pagePath(p)} className="after:absolute after:inset-0">{p.data.title}</Link></h2>
									<p className="mt-3 max-w-md text-[16px] leading-relaxed text-[var(--muted)]">{p.data.lead}</p>
								</div>
								<div className="relative z-10 mt-8 flex flex-wrap gap-2">
									{children.map((ch) => <Link key={ch.slug} href={pagePath(ch)} className="chip transition-colors hover:!text-white">{ch.data.title}<ArrowUpRight size={12} /></Link>)}
									<span className="ml-auto inline-flex items-center gap-2 text-[14px] font-semibold">Виж <ArrowUpRight size={16} /></span>
								</div>
							</article>
						);
					})}
				</div>
			</section>

			{gp && <section className="relative py-10"><div className="wrap"><div data-reveal><GrowthCard s={gp} /></div><div className="mt-4"><Link href="/uslugi/growth-partner" className="chip hover:!text-white">Какво включва Growth Partner<ArrowUpRight size={12} /></Link></div></div></section>}

			<section id="industry" className="section relative scroll-mt-24">
				<div className="wrap">
					<SectionHead eyebrow="За кого" title={<>Познаваме <span className="text-gradient">вашия бранш</span></>} />
					<div className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						{industries.map((p) => (
							<Link key={p.slug} href={pagePath(p)} data-reveal className="card card-spot group flex min-h-[170px] flex-col justify-between p-6">
								<span className="font-display text-[20px] font-extrabold">{p.data.title}</span>
								<span className="text-[14px] text-[var(--muted)]">{p.data.h1}</span>
							</Link>
						))}
					</div>
					{cities.length > 0 && (
						<div id="city" className="mt-10 flex flex-wrap items-center gap-2 scroll-mt-24">
							<span className="mr-2 text-[13px] text-[var(--dim)]">Градове:</span>
							{cities.map((p) => <Link key={p.slug} href={pagePath(p)} className="chip hover:!text-white">{p.data.title}</Link>)}
						</div>
					)}
				</div>
			</section>
			<CtaBand source="/uslugi" />
		</main>
	);
}
