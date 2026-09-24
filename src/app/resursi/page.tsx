// ── /resursi — безплатните инструменти (от de-os → „Безплатни ресурси“) ───────
import type { Metadata } from "next";
import { Breadcrumbs, JsonLd } from "@/components/ui/bits";
import { ResourcesStrip } from "@/components/home/Sections";
import CtaBand from "@/components/ui/CtaBand";
import { getSiteContent } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = pageMeta({
	title: "Безплатни маркетинг инструменти — Competitor Radar и още | Digital Effect",
	description: "Безплатни инструменти за бизнеси: вижте кой от конкурентите рекламира, какво рекламират и къде сте вие. Competitor Radar, рекламен шпионин, одит на сайта.",
	path: "/resursi",
	ogTitle: "Безплатни инструменти",
	eyebrow: "Ресурси",
});

export default async function Resources() {
	const c = await getSiteContent();
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={webPageSchema({ url: `${SITE.url}/resursi`, name: "Безплатни ресурси", type: "CollectionPage" })} />
			<section data-stage="3" className="relative pb-0 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Ресурси", href: "/resursi" }]} />
					<h1 className="display t-1 max-w-[14ch]"><span className="rise"><span>Инструменти, <span className="text-gradient">които ползваме и ние</span></span></span></h1>
					<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>Безплатни, без обаждане. Един е активен днес, останалите пускаме един по един — запишете се и ще сте първи.</p>
				</div>
			</section>
			<div className="-mt-10"><ResourcesStrip resources={c.resources} title={false} /></div>
			<CtaBand source="/resursi" />
		</main>
	);
}
