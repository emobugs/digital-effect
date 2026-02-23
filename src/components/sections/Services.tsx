"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Share2, Video, Monitor, Zap, BarChart2, Megaphone, ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ICONS = {
	social: Share2,
	video: Video,
	web: Monitor,
	automation: Zap,
	chart: BarChart2,
	ads: Megaphone,
};

export default function Services() {
	const container = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			gsap.from(".svc-card", {
				opacity: 0,
				y: 40,
				duration: 0.6,
				stagger: 0.08,
				ease: "power2.out",
				scrollTrigger: {
					trigger: ".svc-grid",
					start: "top 80%",
				},
			});
		},
		{ scope: container },
	);

	return (
		<section ref={container} id="services" className="p-16 px-8 md:px-16">
			{/* HEADER */}
			<div className="md:flex md:items-end md:justify-between mb-[18] gap-10">
				<div className="text-center">
					<span className="section-label md:text-left">Какво правим</span>
					<h2 className="section-title mb-6 md:text-left">
						Нашите
						<br />
						<span className="text-gradient">Услуги</span>
					</h2>
				</div>
				<p className="max-w-sm text-[15px] text-white/50 leading-relaxed text-center md:text-left">
					Управление на социални мрежи, видео съдържание и дигитална стратегия <br />-
					всичко под един покрив.
				</p>
			</div>

			{/* GRID */}
			<div className="svc-grid grid md:grid-cols-3 border border-white/[0.07]">
				{SERVICES.map((svc) => {
					const Icon = ICONS[svc.icon as keyof typeof ICONS];
					return (
						<div
							key={svc.num}
							className="svc-card relative p-10 border border-white/[0.07] group overflow-hidden cursor-default"
						>
							{/* Bottom gradient line on hover */}
							<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c0300a] via-[#e8450a] to-[#f26522] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />

							<div className="w-12 h-12 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center mb-7 group-hover:border-[#f26522]/30 group-hover:bg-[#f26522]/[0.07] transition-all duration-300">
								<Icon className="w-5 h-5 text-[#f26522]" />
							</div>

							<p className="text-[11px] font-bold text-white/25 tracking-[2px] mb-3">
								{svc.num}
							</p>
							<h3 className="font-display font-bold text-[18px] mb-3 group-hover:text-[#f26522] transition-colors duration-300">
								{svc.title}
							</h3>
							<p className="text-[14px] text-white/50 leading-relaxed">
								{svc.description}
							</p>

							{/* Arrow */}
							{/* <div className="absolute bottom-8 right-8 w-9 h-9 rounded-full border border-white/[0.07] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 border-[#f26522]/30">
								<ArrowUpRight className="w-4 h-4 text-[#f26522]" />
							</div> */}
						</div>
					);
				})}
			</div>
		</section>
	);
}
