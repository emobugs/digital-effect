// ── /znanie/<slug> — статия: отговорът първо, после подробностите ─────────────
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs, Faq, JsonLd, Summary } from "@/components/ui/bits";
import CtaBand from "@/components/ui/CtaBand";
import { ARTICLES, articleBySlug } from "@/data/articles";
import { pageMeta } from "@/lib/meta";
import { ORG_ID, FOUNDER_ID } from "@/lib/schema";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const a = articleBySlug((await params).slug);
	if (!a) return {};
	return pageMeta({ title: `${a.title} | Digital Effect`, description: a.description, path: `/znanie/${a.slug}`, ogTitle: a.title, eyebrow: "Знание", type: "article", published: a.published, modified: a.updated });
}

export default async function ArticlePage({ params }: { params: Params }) {
	const a = articleBySlug((await params).slug);
	if (!a) notFound();
	const url = `${SITE.url}/znanie/${a.slug}`;
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={{
				"@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: a.title, description: a.description, url, mainEntityOfPage: url,
				datePublished: a.published, dateModified: a.updated, inLanguage: "bg-BG", image: `${SITE.url}/og?t=${encodeURIComponent(a.title)}`,
				author: { "@id": FOUNDER_ID, "@type": "Person", name: SITE.founder.name }, publisher: { "@id": ORG_ID },
			}} />
			<article>
				<header data-stage="3" className="relative pb-10 pt-36">
					<div className="wrap max-w-4xl">
						<Breadcrumbs items={[{ name: "Знание", href: "/znanie" }, { name: a.title, href: `/znanie/${a.slug}` }]} />
						<h1 className="display t-2"><span className="rise"><span>{a.title}</span></span></h1>
						<p className="fade-up mt-6 text-[14px] text-[var(--dim)]" style={{ ["--d" as string]: "0.3s" }}>
							<span>{SITE.founder.name}, Digital Effect</span> · <time dateTime={a.updated}>обновено {new Date(a.updated).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" })}</time> · {a.readingMin} мин
						</p>
					</div>
				</header>
				<div className="wrap max-w-4xl pb-16">
					<Summary text={a.answer} />
					<div className="prose-de mt-6">
						{a.blocks.map((b, i) => {
							if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
							if (b.type === "p") return <p key={i}>{b.text}</p>;
							if (b.type === "list") return <ul key={i}>{b.items.map((x) => <li key={x}>{x}</li>)}</ul>;
							if (b.type === "note") return <p key={i} className="card !text-[var(--text)] p-5">{b.text}</p>;
							return (
								<div key={i} className="my-6 overflow-x-auto rounded-2xl ring-1 ring-white/[0.08]">
									<table className="w-full min-w-[480px] text-left text-[15px]">
										<thead className="bg-white/[0.03] text-[12px] uppercase tracking-[0.14em] text-[var(--dim)]"><tr>{b.head.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead>
										<tbody>{b.rows.map((r, j) => <tr key={j} className="border-t border-white/[0.06]">{r.map((c, k) => <td key={k} className={`px-5 py-3 ${k ? "tabular" : ""}`}>{c}</td>)}</tr>)}</tbody>
									</table>
								</div>
							);
						})}
					</div>
					{a.faq.length > 0 && <div className="mt-14"><h2 className="mb-4 font-display text-[28px] font-black">Често питат</h2><Faq items={a.faq} /></div>}
					<div className="mt-12 flex flex-wrap gap-2">{a.related.map((r) => <Link key={r.href} href={r.href} className="chip hover:!text-white">{r.label}<ArrowUpRight size={12} /></Link>)}</div>
				</div>
			</article>
			<CtaBand source={`/znanie/${a.slug}`} />
		</main>
	);
}
