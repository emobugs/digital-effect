// ── /resursi/<slug> — един ресурс: активен → линк; „скоро“ → списък за чакане
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs, JsonLd } from "@/components/ui/bits";
import { WaitlistForm } from "@/components/ui/Forms";
import Button from "@/components/ui/Button";
import CtaBand from "@/components/ui/CtaBand";
import { getSiteContent, getResource } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { webPageSchema, ORG_ID } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const revalidate = 300;
export const dynamicParams = true;
type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	return (await getSiteContent()).resources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const r = await getResource((await params).slug);
	if (!r) return {};
	return pageMeta({ title: `${r.data.title} — безплатно | Digital Effect`, description: r.data.short || r.data.description, path: `/resursi/${r.slug}`, ogTitle: r.data.title, eyebrow: `${r.data.code || ""} · Безплатно`, index: r.status === "live" });
}

export default async function ResourcePage({ params }: { params: Params }) {
	const r = await getResource((await params).slug);
	if (!r) notFound();
	const live = r.status === "live" && r.data.href;
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[webPageSchema({ url: `${SITE.url}/resursi/${r.slug}`, name: r.data.title, description: r.data.description }), ...(live ? [{ "@context": "https://schema.org", "@type": "WebApplication", name: r.data.title, applicationCategory: "BusinessApplication", operatingSystem: "Web", url: `${SITE.url}${r.data.href}`, offers: { "@type": "Offer", price: 0, priceCurrency: "EUR" }, provider: { "@id": ORG_ID } }] : [])]} />
			<section data-stage="3" className="relative pb-16 pt-36">
				<div className="wrap grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
					<div>
						<Breadcrumbs items={[{ name: "Ресурси", href: "/resursi" }, { name: r.data.title, href: `/resursi/${r.slug}` }]} />
						<span className="chip chip-orange fade-up">{r.data.code} · {live ? "Активен" : "Скоро"} · Безплатно</span>
						<h1 className="display t-1 mt-6 max-w-[14ch]"><span className="rise"><span>{r.data.title}</span></span></h1>
						<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>{r.data.description}</p>
						<dl className="fade-up mt-8 grid gap-4 sm:grid-cols-2" style={{ ["--d" as string]: "0.45s" }}>
							{r.data.outcome && <div className="card p-5"><dt className="text-[12px] uppercase tracking-[0.18em] text-[var(--dim)]">Получавате</dt><dd className="mt-2 text-[15px]">{r.data.outcome}</dd></div>}
							{r.data.returnReason && r.data.returnReason !== "—" && <div className="card p-5"><dt className="text-[12px] uppercase tracking-[0.18em] text-[var(--dim)]">И после</dt><dd className="mt-2 text-[15px]">{r.data.returnReason}</dd></div>}
						</dl>
					</div>
					<div className="card fade-up bg-[#0c0d10]/85 p-6 backdrop-blur md:p-8" style={{ ["--d" as string]: "0.5s" }}>
						{live ? (
							<div className="space-y-4">
								<p className="text-[16px] text-[var(--muted)]">Работи сега. Без регистрация за първите резултати.</p>
								<Button href={r.data.href!}>{r.data.cta || "Отвори"}</Button>
							</div>
						) : (
							<>
								<h2 className="mb-2 font-display text-[22px] font-extrabold">Запишете се първи</h2>
								<p className="mb-6 text-[15px] text-[var(--muted)]">Пускаме го скоро. Записаните получават достъп преди всички.</p>
								<WaitlistForm resource={r.slug} title={r.data.title} />
							</>
						)}
					</div>
				</div>
				<div className="wrap mt-10"><Link href="/resursi" className="chip hover:!text-white">← Всички ресурси</Link></div>
			</section>
			<CtaBand source={`/resursi/${r.slug}`} />
		</main>
	);
}
