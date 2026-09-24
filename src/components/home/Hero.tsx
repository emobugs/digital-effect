// ── Hero: „Всяко евро да работи.“ — ядрото вдясно, текстът долу вляво ───────
// Етап 0 на 3D сцената. H1 изгрява с CSS (LCP не чака JS).
import Link from "next/link";
import Button from "@/components/ui/Button";
import { byCategory, priceParts, type PublicCatalog } from "@/lib/services";

const MODS = [
	{ n: "01", label: "Реклама", href: "/uslugi/reklama", cat: "reklama" },
	{ n: "02", label: "Социални мрежи", href: "/uslugi/socialni-mrezhi", cat: "smm" },
	{ n: "03", label: "Сайтове", href: "/uslugi/izrabotka-na-sait", cat: "web" },
	{ n: "04", label: "AI и автоматизация", href: "/uslugi/ai-avtomatizacia", cat: "ai" },
] as const;

export default function Hero({ catalog }: { catalog: PublicCatalog }) {
	return (
		<section data-stage="0" className="relative flex min-h-[100svh] flex-col justify-end pb-10 pt-28 md:pb-14">
			<div className="wrap relative">
				<div className="fade-up mb-8 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "0.1s" }}>
					<span className="chip chip-orange"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f26522]" />Дигитална маркетинг агенция</span>
				</div>

				<h1 className="display t-hero max-w-[13ch] text-balance">
					<span className="rise"><span style={{ ["--i" as string]: 0 }}>Всяко евро</span></span>
					<span className="rise"><span style={{ ["--i" as string]: 1 }} className="text-gradient">да работи.</span></span>
				</h1>

				<div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,560px)_1fr]">
					<div>
						<p className="lead fade-up max-w-[34ch] md:max-w-[46ch]" style={{ ["--d" as string]: "0.45s" }}>
							Реклама, социални мрежи, сайтове и AI автоматизация — като една система, която носи <strong className="font-semibold text-[var(--text)]">запитвания, не харесвания</strong>.
						</p>
						<div className="fade-up mt-8 flex flex-wrap gap-3" style={{ ["--d" as string]: "0.6s" }}>
							<Button href="#sglobi" cursor="Старт">Искам повече клиенти</Button>
							<Button href="#sistemata" variant="line" arrow="none">Как работи системата</Button>
						</div>
						<p className="fade-up mt-5 text-[13px] text-[var(--dim)]" style={{ ["--d" as string]: "0.75s" }}>
							Първи месец без риск: без резултат по договорения критерий — без такса.
						</p>
					</div>

					<ul className="fade-up hidden grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.06] backdrop-blur-sm md:grid xl:grid-cols-4" style={{ ["--d" as string]: "0.85s" }}>
						{MODS.map((m) => {
							const s = byCategory(catalog, m.cat)[0];
							const p = s ? priceParts(s) : null;
							return (
								<li key={m.n}>
									<Link href={m.href} className="group flex h-full flex-col justify-between gap-6 bg-[#07080a]/70 p-4 transition-colors hover:bg-[#101116]/90">
										<span className="text-[11px] tabular text-[var(--dim)]">{m.n}</span>
										<span>
											<span className="block font-display text-[15px] font-extrabold leading-tight tracking-[-0.01em] group-hover:text-[#f5813a]">{m.label}</span>
											{p && <span className="mt-1 block text-[12px] text-[var(--muted)]">{p.prefix} {p.value}</span>}
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
			<div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[var(--dim)] md:flex">
				<span className="scroll-cue" />
			</div>
		</section>
	);
}
