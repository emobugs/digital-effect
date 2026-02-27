"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Search, Lightbulb, Rocket, TrendingUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
	{
		num: "01",
		phase: "Стъпка 01",
		title: "Консултация & Одит",
		text: "Безплатна среща, анализ на бизнеса, конкуренцията и текущото онлайн присъствие. Разбираме целите ти преди да предложим каквото и да е.",
		Icon: Search,
	},
	{
		num: "02",
		phase: "Стъпка 02",
		title: "Стратегия & Предложение",
		text: "Изграждаме персонализиран план — кои услуги, какви цели, какъв бюджет. Никакви шаблони, само решения съобразени с твоя бизнес.",
		Icon: Lightbulb,
	},
	{
		num: "03",
		phase: "Стъпка 03",
		title: "Изпълнение & Изграждане",
		text: "Стартираме — реклами, уеб, автоматизация или управление на мрежи. Прозрачна комуникация и редовни обновления по целия път.",
		Icon: Rocket,
	},
	{
		num: "04",
		phase: "Стъпка 04",
		title: "Оптимизация & Растеж",
		text: "Месечни отчети, A/B тестове, подобрения. Системата се учи и расте с бизнеса ти — непрекъснат напредък към целите.",
		Icon: TrendingUp,
	},
];

export default function Process() {
	const container = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const mm = gsap.matchMedia();

			// Header аним
			gsap.fromTo(
				".process-head",
				{ opacity: 0, y: 40 },
				{
					opacity: 1,
					y: 0,
					duration: 0.7,
					ease: "power2.out",
					scrollTrigger: {
						trigger: ".process-head",
						start: "top 85%",
					},
				},
			);

			// ── МОБИЛЕН — всяка стъпка индивидуално ──
			mm.add("(max-width: 767px)", () => {
				gsap.utils.toArray<HTMLElement>(".step-item").forEach((step) => {
					gsap.fromTo(
						step,
						{ opacity: 0, y: 50 },
						{
							opacity: 1,
							y: 0,
							duration: 0.65,
							ease: "power2.out",
							scrollTrigger: { trigger: step, start: "top 85%" },
						},
					);
					gsap.fromTo(
						step.querySelectorAll(".step-inner"),
						{ opacity: 0, x: -20 },
						{
							opacity: 1,
							x: 0,
							duration: 0.45,
							stagger: 0.1,
							ease: "power2.out",
							scrollTrigger: { trigger: step, start: "top 80%" },
						},
					);
				});
			});

			// ── ДЕСКТОП — линия + стъпки smooth ──
			mm.add("(min-width: 768px)", () => {
				const steps = gsap.utils.toArray<HTMLElement>(".step-item");

				gsap.set(steps, { opacity: 0, y: 30 });
				gsap.set(".connector-line", { scaleX: 0, transformOrigin: "left center" });

				const tl = gsap.timeline({
					scrollTrigger: {
						trigger: ".steps-grid",
						start: "top 70%",
					},
				});

				// Линията и стъпките вървят заедно
				tl.to(".connector-line", { scaleX: 1, duration: 2.2, ease: "power1.inOut" })
					.to(
						steps,
						{ opacity: 1, y: 0, duration: 0.6, stagger: 0.6, ease: "power2.out" },
						0,
					)
					.fromTo(
						".step-inner",
						{ opacity: 0, x: -20 },
						{ opacity: 1, x: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" },
						0.3,
					);
			});
		},
		{ scope: container },
	);

	return (
		<section ref={container} id="process" className="py-24 px-4 md:px-16">
			{/* HEADER */}
			<div className="process-head text-center md:text-left mb-16 md:mb-20">
				<span className="section-label">Как работим</span>
				<h2 className="section-title">
					От Старт
					<br />
					<span className="text-gradient">до Резултат</span>
				</h2>
			</div>

			{/* STEPS */}
			<div className="steps-grid max-w-7xl mx-auto grid md:grid-cols-4 gap-0 relative">
				{/* Connecting line — desktop only */}
				{/* Track */}
				<div className="hidden md:block absolute top-[28px] left-[5.5%] right-[20%] h-[2px] bg-white/[0.05]" />
				{/* Animated fill */}
				<div className="connector-line hidden md:block absolute top-[28px] left-[5.5%] right-[20%] h-[2px] bg-gradient-to-r from-[#c0300a] via-[#f26522] to-[#f59c1a] scale-x-0" />

				{STEPS.map((step, i) => {
					const { Icon } = step;
					return (
						<div
							key={step.num}
							className="step-item relative flex flex-col md:items-start items-center text-center md:text-left px-6 py-8 md:py-0"
						>
							{/* Dot + icon */}
							<div className="step-inner relative z-10 mb-6">
								<div className="w-14 h-14 rounded-full border border-white/[0.1] bg-dark-charcoal flex items-center justify-center relative group-hover:border-[#f26522]/40 transition-colors duration-300">
									<Icon className="w-5 h-5 text-[#f26522]" />
									{/* Number badge */}
									<div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#e8450a] to-[#f26522] flex items-center justify-center">
										<span className="text-[8px] font-black text-white leading-none">
											{i + 1}
										</span>
									</div>
								</div>
							</div>

							{/* Phase label */}
							<p className="step-inner text-[10px] font-semibold tracking-[3px] uppercase text-[#f26522]/60 mb-2">
								{step.phase}
							</p>

							{/* Title */}
							<h3 className="step-inner font-display font-black text-[18px] leading-snug mb-3">
								{step.title}
							</h3>

							{/* Text */}
							<p className="step-inner text-[13px] text-white/45 leading-relaxed">
								{step.text}
							</p>

							{/* Mobile connector linne */}
							{i < STEPS.length - 1 && (
								<div className="md:hidden w-[1px] h-8 bg-gradient-to-b from-white/[0.08] to-transparent mx-auto mt-6" />
							)}
						</div>
					);
				})}
			</div>
		</section>
	);
}
