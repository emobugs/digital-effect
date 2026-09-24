// ── /rezultati — кейсовете ───────────────────────────────────────────────────
import type { Metadata } from "next";
import { Breadcrumbs, JsonLd } from "@/components/ui/bits";
import CaseStack from "@/components/home/CaseStack";
import CtaBand from "@/components/ui/CtaBand";
import { CASES } from "@/data/cases";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
	title: "Резултати и кейсове — реклама, сайтове, автоматизация | Digital Effect",
	description: "Реални проекти на Digital Effect: Meta реклама за AromaSecret, хотелски сайт с резервации за Hotel Danube, Robert Key — първи в Google, Northpart, MIGAMA.",
	path: "/rezultati",
	ogTitle: "Числа, не обещания",
	eyebrow: "Резултати",
});

export default function Results() {
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[
				webPageSchema({ url: `${SITE.url}/rezultati`, name: "Резултати на Digital Effect", type: "CollectionPage" }),
				{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: CASES.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE.url}/rezultati/${c.slug}`, name: c.client })) },
			]} />
			<section data-stage="3" className="relative pb-14 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Резултати", href: "/rezultati" }]} />
					<h1 className="display t-1 max-w-[12ch]"><span className="rise"><span>Числа, <span className="text-gradient">не обещания</span></span></span></h1>
					<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>Проекти, в които сме отговаряли за резултата — от реклама до сайт с резервации.</p>
				</div>
			</section>
			<section className="relative pb-24"><div className="wrap"><CaseStack cases={CASES} /></div></section>
			<CtaBand title="Искате такъв резултат?" source="/rezultati" />
		</main>
	);
}
