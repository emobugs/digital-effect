"use client";

import { SITE, PILLARS } from "@/lib/constants";

import { easeIn, motion } from "framer-motion";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Hero() {
	const container = useRef<HTMLElement>(null);
	useGSAP(
		() => {
			gsap.from(".hero-item", {
				opacity: 0,
				y: 36,
				duration: 0.6,
				stagger: 0.2,
				ease: "power2.out",
			});
		},
		{ scope: container },
	);
	return (
		<section
			ref={container}
			id="hero"
			className="relative min-h-vh min-h-dvh flex flex-col items-center justify-center text-center px-10 overflow-hidden"
		>
			<div className="pt-[76px]"></div>
			{/* Badge */}
			<div className="hero-item inline-flex items-center gap-2 px-5 py-2 mb-12 rounded-full border border-[#f26522]/35 bg-[#f26522]/07 animate-pulse md:animate-none">
				<span className="hidden md:block w-[7px] h-[7px] rounded-full bg-[#f26522] animate-pulse" />
				<span className="text-[11px] font-medium tracking-[2px] uppercase text-[#f26522]">
					Дигитален Маркетинг за Реален Растеж
				</span>
			</div>

			{/* HEADLINE */}
			<h1
				className="hero-item text-center font-display font-black uppercase leading-[0.93] tracking-[-3px]"
				style={{ fontSize: "clamp(44px, 8.5vw, 118px)" }}
			>
				Изграждаме
				<br />
				<span className="text-gradient">Дигитален</span>
				<br />
				Ефект
			</h1>

			{/* SUBTITLE */}
			<p className="hero-item max-w-[500px] text-base font-light text-white/50 leading-[1.75] mt-8 mb-12">
				Не просто публикации — изграждаме система. Стратегия, съдържание и резултати за
				малки и средни бизнеси.
			</p>

			{/* BUTTONS */}
			<div
				className="hero-item flex gap-4 justify-center flex-wrap"
				style={{ animationDelay: "300ms" }}
			>
				<a href="#packages" className="btn-primary">
					Виж Пакетите
				</a>
				<a href="#cta" className="btn-ghost">
					Свържи се с нас
				</a>
			</div>

			{/* Pillars */}
			<div className="hero-item grid grid-cols-2 md:grid-cols-4 gap-14 justify-center flex-wrap mt-16">
				{PILLARS.map(({ label, icon: Icon }) => (
					<div
						key={label}
						className="text-center flex flex-col items-center justify-center pt-3 gap-2"
					>
						<Icon className="w-7 md:w-10  text-[#f26522]" />
						<span className="text-[12px] font-medium tracking-[1.5px] uppercase text-white/60">
							{label}
						</span>
					</div>
				))}
			</div>

			{/* SCROLL INDICATOR */}
			<div
				className="hidden absolute bottom-10 left-1/2 -translate-x-1/2 md:flex flex-col items-center gap-2 text-white/25 text-[10px] tracking-[3px] uppercase"
				style={{ animationDelay: "500ms" }}
			>
				<motion.div
					animate={{ scaleY: [0, 1, 0] }}
					transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
					className="w-px h-12 bg-gradient-to-b from-[#f26522] to-transparent origin-top"
				/>
				<p className="">Разгледай</p>
			</div>
		</section>
	);
}
