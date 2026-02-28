"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, ChevronUp, ChevronDown } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PROJECTS = [
	{
		num: "01",
		name: "Northpart",
		category: "Уеб дизайн & Разработка",
		tags: ["Next.js", "GSAP", "Tailwind", "Branding", "SEO", "Многоезичен"],
		description:
			"Корпоративен уебсайт за дистрибутор на EV и соларни батерийни решения. Модерен дизайн съобразен с B2B аудитория и технически продукти.",
		url: "https://northpart.com",
		image: "/projects/northpart.png",
		year: "2025",
	},
	{
		num: "02",
		name: "Robert Key",
		category: "Уеб дизайн & Разработка",
		tags: ["React", "SEO", "Local Business", "Leads"],
		description:
			"Landing page за авариен ключар в Силистра. Фокус върху бърза конверсия — телефонен номер на видно място, SEO оптимизация за локално търсене.",
		url: "https://robertkey.vercel.app",
		image: "/projects/robertkey.png",
		year: "2025",
	},
	{
		num: "03",
		name: "AromaSecret",
		category: "Meta Ads & Социални Мрежи",
		tags: ["Meta Ads", "Reach", "Engagement"],
		description:
			"Рекламни кампании за магазин за парфюми. $1.07K инвестиция, 303K reach и 1.68M impressions с CPM от само $0.64.",
		url: null,
		image: null,
		year: "2025",
		stats: [
			{ label: "Reach", value: "303K" },
			{ label: "Impressions", value: "1.68M" },
			{ label: "CPM", value: "$0.64" },
		],
	},
];

export default function Projects() {
	const container = useRef<HTMLElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(0);

	const goTo = (next: number) => {
		const el = imageRef.current;
		if (!el) return;

		gsap.to(el, {
			opacity: 0,
			y: 10,
			duration: 0.25,
			ease: "power2.in",
			onComplete: () => {
				setActive(next);
				gsap.fromTo(
					el,
					{ opacity: 0, y: -10 },
					{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
				);
			},
		});
	};

	const prev = () => goTo((active - 1 + PROJECTS.length) % PROJECTS.length);
	const next = () => goTo((active + 1) % PROJECTS.length);

	useGSAP(
		() => {
			gsap.fromTo(
				".projects-head",
				{ opacity: 0, y: 40 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: "power2.out",
					scrollTrigger: { trigger: ".projects-head", start: "top 85%" },
				},
			);
			gsap.fromTo(
				".projects-body",
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: "power2.out",
					scrollTrigger: { trigger: ".projects-body", start: "top 85%" },
				},
			);
		},
		{ scope: container },
	);

	const project = PROJECTS[active];

	return (
		<section ref={container} id="projects" className="py-24 px-4 md:px-16 bg-dark-charcoal">
			{/* HEADER */}
			<div className="projects-head mb-6 md:mb-12 max-sm:text-center">
				<span className="section-label">Нашата работа</span>
				<h2 className="section-title">
					Избрани
					<br />
					<span className="text-gradient">Проекти</span>
				</h2>
			</div>

			{/* BODY */}
			<div className="projects-body max-w-7xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-12 md:gap-20 items-center">
				{/* LEFT — info */}
				<div className="flex flex-col gap-8">
					{/* Dots navigation */}
					<div className="flex gap-2">
						{PROJECTS.map((_, i) => (
							<button
								key={i}
								onClick={() => goTo(i)}
								className={` rounded-full transition-all duration-300 ${
									i === active
										? "w-3 bg-gradient-to-r from-[#e8450a] to-[#f26522]"
										: "w-3 bg-white/20"
								}`}
							/>
						))}
					</div>

					{/* Project info */}
					<div className="flex flex-col items-center md:items-start justify-between min-h-[320px]">
						<p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#f26522] mb-1">
							{project.category} · {project.year}
						</p>
						<h3 className="font-display font-black text-[32px] md:text-[40px] leading-tight mb-4">
							{project.name}
						</h3>
						<p className="text-[14px] text-white/50 leading-relaxed mb-6 text-center md:text-left">
							{project.description}
						</p>
						{project.stats && (
							<div className="grid grid-cols-3 gap-4 py-4 border-y border-white/[0.06]">
								{project.stats.map((s) => (
									<div key={s.label}>
										<div className="font-display font-black text-[22px] text-gradient leading-none mb-1">
											{s.value}
										</div>
										<div className="text-[10px] text-white/35 tracking-[1.5px] uppercase">
											{s.label}
										</div>
									</div>
								))}
							</div>
						)}

						{/* Tags */}
						<div className="flex flex-wrap gap-2 mb-8">
							{project.tags.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1 rounded-full border border-white/[0.08] text-[11px] text-white/40 tracking-[0.5px]"
								>
									{tag}
								</span>
							))}
						</div>

						{/* CTA */}
						{project.url ? (
							<a
								href={project.url}
								target="_blank"
								rel="noopener noreferrer"
								className="btn-primary inline-flex items-center gap-2"
							>
								Виж проекта
								<ArrowUpRight className="w-4 h-4" />
							</a>
						) : (
							<a href="#cta" className="btn-ghost inline-flex items-center gap-2">
								Стани следващ клиент
								<ArrowRight className="w-4 h-4" />
							</a>
						)}
					</div>

					{/* Arrow navigation */}
					<div className="flex gap-3 mt-2">
						<button
							onClick={prev}
							className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:border-[#f26522]/40 hover:text-[#f26522] transition-all duration-300"
						>
							<ChevronUp className="w-4 h-4" />
						</button>
						<button
							onClick={next}
							className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:border-[#f26522]/40 hover:text-[#f26522] transition-all duration-300"
						>
							<ChevronDown className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* RIGHT — image card */}
				<div ref={imageRef} className="relative">
					<div className="relative rounded-[4px] overflow-hidden border border-white/[0.07] aspect-[4/3] bg-dark-surface">
						{PROJECTS.map((p, i) => (
							<div
								key={p.num}
								className={`absolute inset-0 transition-none ${i === active ? "block" : "hidden"}`}
							>
								{p.image ? (
									<img
										src={p.image}
										alt={p.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex flex-col items-center justify-center gap-4">
										<div className="w-16 h-16 rounded-full border border-white/[0.07] flex items-center justify-center">
											<span className="font-display font-black text-[24px] text-white/10">
												{p.num}
											</span>
										</div>
										<p className="text-[12px] text-white/20 tracking-[2px] uppercase">
											Очаквайте скоро
										</p>
									</div>
								)}
							</div>
						))}
						{/* overlay линк */}
						{project.url && (
							<a
								href={project.url}
								target="_blank"
								rel="noopener noreferrer"
								className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/[0.1] px-4 py-2 rounded-full text-[12px] text-white/70 hover:text-white transition-all duration-300 z-10"
							>
								{project.name}
								<ArrowUpRight className="w-3 h-3" />
							</a>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
