"use client";

// ── Кейсовете като тесте карти: всяка следваща се плъзга върху предишната ──
// CSS sticky върши подреждането; GSAP само смалява и затъмнява картата отдолу.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/data/cases";

gsap.registerPlugin(ScrollTrigger);

export default function CaseStack({ cases }: { cases: CaseStudy[] }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = gsap.context(() => {
			const cards = gsap.utils.toArray<HTMLElement>("[data-case]");
			cards.forEach((card, i) => {
				if (i === cards.length - 1) return;
				gsap.fromTo(card.querySelector("[data-case-inner]"), { scale: 1, filter: "brightness(1)" }, {
					scale: 0.92,
					filter: "brightness(0.45)",
					ease: "none",
					scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 18%", scrub: true },
				});
			});
		}, el);
		return () => ctx.revert();
	}, []);

	return (
		<div ref={ref} className="relative">
			{cases.map((c, i) => (
				<article key={c.slug} data-case className="sticky pb-6" style={{ top: `calc(84px + ${i * 14}px)` }}>
					<div data-case-inner className="card grid origin-top overflow-hidden bg-[#0c0d10] md:grid-cols-[1.25fr_1fr]" style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,.08), 0 40px 120px -40px ${c.accent}55` }}>
						<Link href={`/rezultati/${c.slug}`} className="relative block aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[440px]" data-cursor="Виж">
							<Image src={c.image} alt={`${c.client} — ${c.category}`} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover object-top transition-transform duration-[1.4s] hover:scale-[1.04]" />
							<div className="absolute inset-0 bg-gradient-to-t from-[#0c0d10] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0c0d10]/80" />
						</Link>
						<div className="flex flex-col justify-between gap-8 p-7 md:p-10">
							<div>
								<div className="flex items-center justify-between text-[12px] text-[var(--dim)]">
									<span className="tabular">0{i + 1} — {c.year}</span>
									<span>{c.category}</span>
								</div>
								<h3 className="display mt-5 text-[clamp(32px,3.6vw,54px)]">{c.client}</h3>
								<p className="mt-4 text-[16px] leading-relaxed text-[var(--muted)]">{c.short}</p>
							</div>
							{c.results.length > 0 && (
								<dl className="grid grid-cols-2 gap-x-6 gap-y-5">
									{c.results.slice(0, 4).map((r) => (
										<div key={r.label}>
											<dt className="order-2 text-[12px] text-[var(--dim)]">{r.label}</dt>
											<dd className="font-display text-[clamp(26px,2.6vw,38px)] font-black tracking-[-0.02em] text-gradient">{r.value}</dd>
										</div>
									))}
								</dl>
							)}
							<Link href={`/rezultati/${c.slug}`} className="group inline-flex items-center gap-2 text-[15px] font-semibold">
								<span className="border-b border-[#f26522]/60 pb-0.5 group-hover:border-white">Целият кейс</span>
								<ArrowUpRight size={17} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
							</Link>
						</div>
					</div>
				</article>
			))}
		</div>
	);
}
