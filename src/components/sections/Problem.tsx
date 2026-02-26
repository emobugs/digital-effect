"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { X, Check } from "lucide-react";
import { PROBLEMS, SOLUTIONS } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Problem() {
	const container = useRef<HTMLElement>(null);

	const mm = gsap.matchMedia();

	useGSAP(
		() => {
			gsap.from(".prob-left", {
				opacity: 0,
				x: -40,
				duration: 0.7,
				ease: "power2.out",
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
				},
			});

			gsap.from(".prob-right", {
				opacity: 0,
				x: 40,
				duration: 1,
				delay: 1.6,
				ease: "power2.out",
				scrollTrigger: {
					trigger: container.current,
					start: "top 75%",
				},
			});

			gsap.from(".prob-item", {
				opacity: 0,
				x: -20,
				duration: 0.8,
				stagger: 0.25,
				ease: "power2.out",
				scrollTrigger: {
					trigger: ".prob-items",
					start: "top 75%",
				},
			});

			// gsap.from(".sol-item", {
			// 	opacity: 0,
			// 	x: 20,
			// 	duration: 0.8,
			// 	stagger: 0.25,
			// 	ease: "power2.out",
			// 	delay: 1.5,
			// 	scrollTrigger: {
			// 		trigger: ".sol-items",
			// 		start: "top 75%",
			// 	},
			// });
			mm.add("(max-width: 767px)", () => {
				// Мобилен — всяка карта индивидуално
				gsap.from(".sol-item", {
					opacity: 0,
					x: 20,
					duration: 0.8,
					stagger: 0.25,
					ease: "power2.out",
					delay: 0.5,
					scrollTrigger: {
						trigger: ".sol-items",
						start: "top 75%",
					},
				});
			});
			mm.add("(min-width: 768px)", () => {
				// Мобилен — всяка карта индивидуално
				gsap.from(".sol-item", {
					opacity: 0,
					x: 20,
					duration: 0.8,
					stagger: 0.25,
					ease: "power2.out",
					delay: 1.5,
					scrollTrigger: {
						trigger: ".sol-items",
						start: "top 75%",
					},
				});
			});
		},
		{ scope: container },
	);

	return (
		<section
			ref={container}
			id="problem"
			className="py-8 md:py-36 px-8 md:px-16 bg-dark-surface"
		>
			<div className="grid lg:grid-cols-2 gap-24 items-center">
				{/* LEFT — Проблеми */}
				<div className="prob-left">
					<span className="section-label md:text-left text-center">Познаваш ли ги?</span>
					<h2 className="section-title mb-8 md:text-left text-center">
						Проблемите,
						<br />
						които <span className="text-gradient">спират</span>
						<br />
						бизнеса ти
					</h2>
					<p className="text-[15px] text-white/50 leading-relaxed mb-8 md:text-left text-center">
						Много бизнеси губят клиенти и пари заради липса на стратегия онлайн.
					</p>

					<div className="prob-items flex flex-col">
						{PROBLEMS.map((problem) => (
							<div
								key={problem}
								className="prob-item flex items-start gap-4 py-4 border-b border-white/[0.06] last:border-0"
							>
								<div className="w-5 h-5 rounded-full bg-[#f26522]/10 border border-[#f26522]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
									<X className="w-2.5 h-2.5 text-[#f26522]" />
								</div>
								<p className="text-[14px] text-white/50 leading-relaxed">
									{problem}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* RIGHT — Решения */}
				<div className="prob-right">
					<div className="relative bg-dark-charcoal border border-white/[0.07] rounded-sm p-4 md:p-12 overflow-hidden">
						{/* Top gradient line */}
						<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c0300a] via-[#e8450a] to-[#f26522]" />

						<p className="text-[11px] font-semibold tracking-[3px] uppercase text-[#f26522] mb-3">
							Digital Effect решава това
						</p>
						<h3 className="font-display font-bold md:text-2xl text-lg max-sm:text-center mb-6 leading-snug">
							Изграждаме система,
							<br />
							не просто публикации
						</h3>

						<div className="h-px bg-white/[0.07] mb-8" />

						<div className="sol-items flex flex-col gap-5">
							{SOLUTIONS.map((solution) => (
								<div key={solution} className="sol-item flex items-start gap-4">
									<div className="w-5 h-5 rounded-full bg-[#22f291]/10 border border-[#22f291]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
										<Check className="w-2.5 h-2.5 text-[#22f291]" />
									</div>
									<p className="text-[14px] text-white/80 leading-relaxed">
										{solution}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
