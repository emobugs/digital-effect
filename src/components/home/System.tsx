// ── „Системата“ — етап 1: ядрото се разтваря, всеки модул излиза напред ──────
// Четири блока по един екран; 3D сцената осветява модула според прогреса
// (local 0–0.25 реклама, 0.25–0.5 социални мрежи…). Вляво — лепкав индекс.
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { byCategory, priceParts, type PublicCatalog, type ServiceCategory } from "@/lib/services";
import SystemIndex from "./SystemIndex";

const BLOCKS: { n: string; cat: ServiceCategory; title: string; line: string; points: string[]; href: string }[] = [
	{ n: "01", cat: "reklama", title: "Реклама", line: "Хората, които търсят вас — и тези, които още не знаят, че ви търсят.", points: ["Facebook, Instagram и Google", "Проследено всяко запитване — цена в евро", "6 криейтива месечно, седмичен отчет"], href: "/uslugi/reklama" },
	{ n: "02", cat: "smm", title: "Социални мрежи", line: "Профил, който изглежда като бизнес и продава като бизнес.", points: ["8, 12 или 16 публикации месечно", "Stories, Reels и отговори на коментарите", "Синхронизирано с рекламата"], href: "/uslugi/socialni-mrezhi" },
	{ n: "03", cat: "web", title: "Сайтове", line: "Мястото, където интересът става запитване.", points: ["Индивидуален дизайн, бърз на телефон", "Текстове, които продават", "SEO и структурирани данни за Google и AI"], href: "/uslugi/izrabotka-na-sait" },
	{ n: "04", cat: "ai", title: "AI и автоматизация", line: "Никое запитване не остава без отговор — дори в 23:00.", points: ["AI асистент, обучен върху вашия бизнес", "Всички лийдове на едно място (CRM)", "Автоматизации, които връщат часове"], href: "/uslugi/ai-avtomatizacia" },
];

export default function System({ catalog }: { catalog: PublicCatalog }) {
	return (
		<section id="sistemata" data-stage="1" className="relative">
			<div className="wrap relative grid lg:grid-cols-2">
				<div className="pointer-events-none sticky top-0 hidden h-[100svh] flex-col justify-between py-28 lg:flex">
					<div>
						<span className="eyebrow">Системата</span>
						<h2 className="display t-2 mt-6 max-w-[11ch]">Една система. Четири части.</h2>
					</div>
					<SystemIndex labels={BLOCKS.map((b) => b.title)} />
				</div>

				<div>
					<div className="pt-24 lg:hidden">
						<span className="eyebrow">Системата</span>
						<h2 className="display t-2 mt-5">Една система. Четири части.</h2>
					</div>
					{BLOCKS.map((b) => {
						const svc = byCategory(catalog, b.cat)[0];
						const p = svc ? priceParts(svc) : null;
						return (
							<article key={b.n} className="flex min-h-[92svh] items-end pb-16 pt-[46svh] lg:items-center lg:pb-0 lg:pt-0">
								<div data-reveal className="card w-full max-w-[520px] bg-[#07080a]/70 p-7 backdrop-blur-md md:p-9">
									<div className="mb-6 flex items-center justify-between">
										<span className="font-display text-[13px] font-black tabular text-[#f26522]">{b.n} / 04</span>
										{p && <span className="chip">{p.prefix} {p.value} {p.suffix}</span>}
									</div>
									<h3 className="display t-3 !text-[clamp(30px,3.4vw,48px)]">{b.title}</h3>
									<p className="lead mt-4 !text-[18px]">{b.line}</p>
									<ul className="mt-7 space-y-3">
										{b.points.map((x) => (
											<li key={x} className="flex gap-3 text-[15px] text-[var(--text)]/85"><Check size={17} className="mt-0.5 flex-shrink-0 text-[#f26522]" />{x}</li>
										))}
									</ul>
									<Link href={b.href} className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold text-white">
										<span className="border-b border-[#f26522]/60 pb-0.5 transition-colors group-hover:border-white">Как точно работи</span>
										<ArrowUpRight size={17} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
									</Link>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
