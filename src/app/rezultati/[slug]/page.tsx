// ── /rezultati/<slug> — един кейс ─────────────────────────────────────────────
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Breadcrumbs, JsonLd } from "@/components/ui/bits";
import CtaBand from "@/components/ui/CtaBand";
import Button from "@/components/ui/Button";
import { CASES, caseBySlug } from "@/data/cases";
import { pageMeta } from "@/lib/meta";
import { ORG_ID, webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";
import { getSiteContent, pagePath } from "@/lib/content";

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;
export const generateStaticParams = () => CASES.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const c = caseBySlug((await params).slug);
	if (!c) return {};
	return pageMeta({ title: `${c.client} — ${c.category} | Кейс на Digital Effect`, description: c.short, path: `/rezultati/${c.slug}`, ogTitle: c.client, eyebrow: c.category });
}

export default async function CasePage({ params }: { params: Params }) {
	const c = caseBySlug((await params).slug);
	if (!c) notFound();
	const content = await getSiteContent();
	const svc = c.services.map((href) => ({ href, p: content.pages.find((p) => pagePath(p) === href) })).filter((x) => x.p);
	const i = CASES.findIndex((x) => x.slug === c.slug);
	const next = CASES[(i + 1) % CASES.length];
	const url = `${SITE.url}/rezultati/${c.slug}`;
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[
				webPageSchema({ url, name: `${c.client} — кейс`, description: c.short }),
				{ "@context": "https://schema.org", "@type": "CreativeWork", name: `${c.client} — ${c.category}`, about: c.category, abstract: c.short, creator: { "@id": ORG_ID }, dateCreated: c.year, url, image: `${SITE.url}${c.image}`, ...(c.url ? { sameAs: c.url } : {}) },
			]} />
			<section data-stage="3" className="relative pb-10 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Резултати", href: "/rezultati" }, { name: c.client, href: `/rezultati/${c.slug}` }]} />
					<span className="eyebrow fade-up" style={{ ["--d" as string]: "0.05s" }}>{c.category} · {c.year}</span>
					<h1 className="display t-hero mt-6"><span className="rise"><span>{c.client}</span></span></h1>
					<p className="lead fade-up mt-7 max-w-3xl" style={{ ["--d" as string]: "0.3s" }}>{c.short}</p>
					{c.url && <div className="fade-up mt-8" style={{ ["--d" as string]: "0.45s" }}><Button href={c.url} variant="line" arrow="up" external>Виж сайта</Button></div>}
				</div>
			</section>
			<section className="relative pb-16">
				<div className="wrap">
					<div data-reveal className="card relative aspect-[16/9] overflow-hidden">
						<Image src={c.image} alt={`${c.client} — ${c.category}`} fill priority sizes="100vw" className="object-cover object-top" />
					</div>
				</div>
			</section>
			{c.results.length > 0 && (
				<section className="relative pb-16">
					<div className="wrap">
						<dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] bg-white/[0.07] ring-1 ring-white/[0.07] md:grid-cols-4">
							{c.results.map((r) => (
								<div key={r.label} data-reveal className="bg-[#0a0b0d] p-6 md:p-8">
									<dd className="font-display text-[clamp(34px,4vw,60px)] font-black tracking-[-0.03em] text-gradient">{r.value}</dd>
									<dt className="mt-1 text-[14px] text-[var(--muted)]">{r.label}</dt>
								</div>
							))}
						</dl>
					</div>
				</section>
			)}
			<section className="section relative !pt-6">
				<div className="wrap grid gap-12 lg:grid-cols-2">
					<div data-reveal>
						<h2 className="eyebrow">Задачата</h2>
						<p className="mt-5 text-[clamp(20px,2vw,28px)] leading-snug text-[var(--text)]">{c.challenge}</p>
					</div>
					<div data-reveal>
						<h2 className="eyebrow">Какво направихме</h2>
						<ul className="mt-5 space-y-3">{c.solution.map((s) => <li key={s} className="flex gap-3 text-[17px] text-[var(--text)]/85"><Check size={19} className="mt-1 flex-shrink-0 text-[#f26522]" />{s}</li>)}</ul>
						{svc.length > 0 && <div className="mt-8 flex flex-wrap gap-2">{svc.map((x) => <Link key={x.href} href={x.href} className="chip hover:!text-white">{x.p!.data.title}<ArrowUpRight size={12} /></Link>)}</div>}
					</div>
				</div>
				{c.quote && (
					<figure data-reveal className="wrap mt-16">
						<blockquote className="font-display text-[clamp(24px,2.8vw,40px)] font-extrabold leading-tight tracking-[-0.02em]">„{c.quote.text}“</blockquote>
						<figcaption className="mt-4 text-[15px] text-[var(--muted)]">{c.quote.author}, {c.quote.role}</figcaption>
					</figure>
				)}
			</section>
			<section className="relative pb-10">
				<div className="wrap">
					<Link href={`/rezultati/${next.slug}`} className="group flex items-center justify-between border-y border-white/[0.08] py-8" data-cursor="Следващ">
						<span className="text-[13px] uppercase tracking-[0.22em] text-[var(--dim)]">Следващ кейс</span>
						<span className="display text-[clamp(30px,5vw,72px)] transition-colors group-hover:text-[#f5813a]">{next.client}</span>
					</Link>
				</div>
			</section>
			<CtaBand title="Искате такъв резултат?" source={`/rezultati/${c.slug}`} />
		</main>
	);
}
