"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PACKAGES = [
	{
		name: "Старт",
		tagline: "За малки бизнеси",
		price: "230",
		currency: "€",
		period: "/ месец",
		badge: null,
		gradient: "from-[#c0300a] via-[#e8450a] to-[#f59c1a]",
		features: [
			"2 платформи (FB + IG)",
			"12 публикации / месец",
			"Копирайтинг + дизайн",
			"1 Reels видео / месец",
			"Месечен отчет",
			"Базова стратегия",
		],
		description:
			"Идеален за местни магазини и стартиращи бизнеси, които искат последователно онлайн присъствие без да инвестират голям бюджет.",
	},
	{
		name: "Растеж",
		tagline: "За активни бизнеси",
		price: "435",
		currency: "€",
		period: "/ месец",
		badge: "Най-популярен",
		gradient: "from-[#e8450a] via-[#f26522] to-[#f59c1a]",
		features: [
			"3 платформи (FB + IG + TikTok)",
			"20 публикации / месец",
			"2 Reels видеа / месец",
			"Community management",
			"Meta Ads управление",
			"Базова автоматизация",
			"Двуседмичен отчет + call",
		],
		description:
			"Пълен пакет с реклама И автоматизация. Конкурентите таксуват тези услуги поотделно за ~600–700 €. Ние ги предлагаме заедно.",
	},
	{
		name: "Система",
		tagline: "За амбициозен растеж",
		price: "715",
		currency: "€",
		period: "/ месец",
		badge: null,
		gradient: "from-[#c0300a] via-[#e8450a] to-[#f26522]",
		features: [
			"Всичко от Растеж +",
			"Пълна автоматизация + чатбот",
			"CRM интеграция",
			"4 видеа / месец",
			"Meta Ads + Google Ads",
			"A/B тестове",
			"Седмичен отчет + стратегически call",
			"Приоритетна поддръжка (до 4ч.)",
		],
		description:
			"За бизнеси, които искат система — не просто публикации. Автоматизирани процеси, които работят докато ти спиш.",
	},
];

function FlipCard({ pkg, index }: { pkg: (typeof PACKAGES)[0]; index: number }) {
	const [flipped, setFlipped] = useState(false);

	return (
		<div
			className="pkg-card relative h-[560px] cursor-pointer"
			style={{ perspective: "1200px" }}
			onMouseEnter={() => setFlipped(true)}
			onMouseLeave={() => setFlipped(false)}
			onClick={() => setFlipped((f) => !f)}
		>
			<div
				className="relative w-full h-full transition-transform duration-700"
				style={{
					transformStyle: "preserve-3d",
					transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
				}}
			>
				{/* ── FRONT ── */}
				<div
					className="absolute inset-0 flex flex-col overflow-hidden border border-white/[0.08]"
					style={{ backfaceVisibility: "hidden" }}
				>
					{/* Featured badge */}
					{pkg.badge && (
						<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-gradient-to-r from-[#e8450a] to-[#f26522] text-[10px] font-bold tracking-[2px] uppercase text-white whitespace-nowrap">
							{pkg.badge}
						</div>
					)}

					{/* Gradient image area */}
					<div
						className={`relative h-[200px] bg-gradient-to-br ${pkg.gradient} flex-shrink-0`}
					>
						{/* Noise texture overlay */}
						<div
							className="absolute inset-0 opacity-20"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
							}}
						/>
						{/* Price overlay */}
						<div className="absolute bottom-0 right-0 bg-black/40 backdrop-blur-sm px-6 py-4">
							<div
								className="font-display font-black text-white leading-none"
								style={{ fontSize: "clamp(32px, 3vw, 44px)" }}
							>
								{pkg.currency}
								{pkg.price}
							</div>
							<div className="text-white/60 text-[11px] tracking-[1px]">
								{pkg.period}
							</div>
						</div>
						{/* Name overlay */}
						<div className="absolute bottom-0 left-0 px-6 py-4">
							<p className="text-white/50 text-[10px] font-semibold tracking-[3px] uppercase">
								{pkg.tagline}
							</p>
							<h3 className="font-display font-black text-white text-[22px] leading-tight">
								{pkg.name}
							</h3>
						</div>
					</div>

					{/* Features list */}
					<div className="flex-1 bg-dark-charcoal px-7 py-6 flex flex-col justify-between">
						<ul className="flex flex-col gap-3">
							{pkg.features.slice(0, 5).map((f) => (
								<li
									key={f}
									className="flex items-center gap-3 text-[13px] text-white/65"
								>
									<Check className="w-3.5 h-3.5 text-[#f26522] flex-shrink-0" />
									{f}
								</li>
							))}
							{pkg.features.length > 5 && (
								<li className="text-[12px] text-[#f26522] font-medium mt-1">
									+{pkg.features.length - 5} още →
								</li>
							)}
						</ul>

						<div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] text-white/30 tracking-[1px] text-center">
							Задръж за повече информация
						</div>
					</div>
				</div>

				{/* ── BACK ── */}
				<div
					className="absolute inset-0 flex flex-col bg-dark-charcoal border border-[#f26522]/20 overflow-hidden"
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
					}}
				>
					{/* Top accent */}
					<div className={`h-[3px] bg-gradient-to-r ${pkg.gradient}`} />

					<div className="flex-1 px-8 py-7 flex flex-col">
						<p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#f26522] mb-1">
							{pkg.tagline}
						</p>
						<h3 className="font-display font-black text-[24px] mb-3">{pkg.name}</h3>
						<p className="text-[13px] text-white/55 leading-relaxed mb-6">
							{pkg.description}
						</p>

						<div className="h-px bg-white/[0.06] mb-5" />

						{/* All features */}
						<ul className="flex flex-col gap-2.5 flex-1">
							{pkg.features.map((f) => (
								<li
									key={f}
									className="flex items-center gap-3 text-[13px] text-white/75"
								>
									<div className="w-4 h-4 rounded-full bg-[#f26522]/10 border border-[#f26522]/30 flex items-center justify-center flex-shrink-0">
										<Check className="w-2 h-2 text-[#f26522]" />
									</div>
									{f}
								</li>
							))}
						</ul>

						{/* Price + CTA */}
						<div className="mt-6 pt-5 border-t border-white/[0.06]">
							<div className="flex items-baseline gap-1 mb-4">
								<span className="font-display font-black text-gradient text-[34px] leading-none">
									{pkg.currency}
									{pkg.price}
								</span>
								<span className="text-white/40 text-[12px]">{pkg.period}</span>
							</div>
							<a
								href="#cta"
								className="btn-primary w-full text-center flex items-center justify-center gap-2"
								onClick={(e) => e.stopPropagation()}
							>
								Избери пакета
								<ArrowRight className="w-4 h-4" />
							</a>
							<p className="text-[10px] text-white/25 text-center mt-3 tracking-[0.5px]">
								Мин. 3 месеца · Без скрити такси
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Packages() {
	const container = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			gsap.from(".pkg-card", {
				opacity: 0,
				y: 50,
				duration: 0.7,
				stagger: 0.12,
				ease: "power2.out",
				scrollTrigger: {
					trigger: ".pkg-grid",
					start: "top 80%",
				},
			});
		},
		{ scope: container },
	);

	return (
		<section ref={container} id="packages" className="py-36 px-16 bg-dark-charcoal">
			{/* HEADER */}
			<div className="text-center mb-20">
				<span className="section-label">Прозрачно ценообразуване</span>
				<h2 className="section-title">
					Избери своя
					<br />
					<span className="text-gradient">Пакет</span>
				</h2>
				<p className="text-[15px] text-white/50 max-w-md mx-auto mt-5 leading-relaxed">
					Три нива на услуга, съобразени с целите на твоя бизнес. Без скрити такси.
					Рекламният бюджет е отделен.
				</p>
			</div>

			{/* 3 FLIP CARDS */}
			<div className="pkg-grid grid grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
				{PACKAGES.map((pkg, i) => (
					<FlipCard key={pkg.name} pkg={pkg} index={i} />
				))}
			</div>

			{/* CUSTOM CARD */}
			<div className="pkg-card max-w-5xl mx-auto relative border border-white/[0.07] bg-dark-surface overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c0300a] via-[#e8450a] to-[#f26522]" />
				<div className="flex items-center justify-between px-12 py-10 gap-10">
					<div className="flex items-start gap-5">
						<div className="w-12 h-12 rounded-xl bg-[#f26522]/10 border border-[#f26522]/25 flex items-center justify-center flex-shrink-0">
							<Sparkles className="w-5 h-5 text-[#f26522]" />
						</div>
						<div>
							<p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#f26522] mb-1">
								Персонализирано решение
							</p>
							<h3 className="font-display font-black text-[22px] mb-2">
								Custom Проект
							</h3>
							<p className="text-[14px] text-white/50 leading-relaxed max-w-lg">
								Уебсайт, AI чатбот, пълен rebrand или enterprise ретейнер. Обсъждаме
								конкретните ти нужди и изграждаме оферта.
							</p>
						</div>
					</div>
					<div className="flex flex-col items-end gap-3 flex-shrink-0">
						<div className="text-right">
							<p className="text-[11px] text-white/30 tracking-[1px] uppercase mb-1">
								Консултация
							</p>
							<p className="font-display font-black text-gradient text-[28px] leading-none">
								Безплатна
							</p>
						</div>
						<a
							href="#cta"
							className="btn-primary whitespace-nowrap flex items-center gap-2"
						>
							Свържи се с нас
							<ArrowRight className="w-4 h-4" />
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
