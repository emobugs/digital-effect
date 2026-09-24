// ── /znanie — статиите ────────────────────────────────────────────────────────
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs, JsonLd } from "@/components/ui/bits";
import CtaBand from "@/components/ui/CtaBand";
import { ARTICLES } from "@/data/articles";
import { pageMeta } from "@/lib/meta";
import { webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
	title: "Знание — колко струва реклама, сайт, SEO | Digital Effect",
	description: "Отговори на въпросите, които бизнесите ни задават: колко струва рекламата във Facebook и Google, колко струва сайт, какво да проверите преди да платите.",
	path: "/znanie",
	ogTitle: "Знание",
});

export default function Knowledge() {
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={webPageSchema({ url: `${SITE.url}/znanie`, name: "Знание", type: "CollectionPage" })} />
			<section data-stage="3" className="relative pb-10 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Знание", href: "/znanie" }]} />
					<h1 className="display t-1 max-w-[14ch]"><span className="rise"><span>Отговорите, <span className="text-gradient">без мъгла</span></span></span></h1>
					<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>Въпросите, които ни задават най-често — с числа.</p>
				</div>
			</section>
			<section className="relative pb-24">
				<div className="wrap grid gap-4 md:grid-cols-2">
					{ARTICLES.map((a) => (
						<Link key={a.slug} href={`/znanie/${a.slug}`} data-reveal className="card card-spot group flex min-h-[300px] flex-col justify-between p-7 md:p-9">
							<div className="flex items-center justify-between text-[13px] text-[var(--dim)]"><time dateTime={a.updated}>{new Date(a.updated).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" })}</time><span>{a.readingMin} мин</span></div>
							<div>
								<h2 className="font-display text-[clamp(24px,2.4vw,34px)] font-black leading-tight tracking-[-0.02em]">{a.title}</h2>
								<p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{a.description}</p>
								<span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold">Прочети <ArrowUpRight size={16} /></span>
							</div>
						</Link>
					))}
				</div>
			</section>
			<CtaBand source="/znanie" />
		</main>
	);
}
