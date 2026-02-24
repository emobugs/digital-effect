"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowRight, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PACKAGES = [
	{
		name: "Старт",
		tagline: "За малки бизнеси",
		price: "200",
		priceLabel: "€ / месец",
		badge: null,
		gradient: "from-[#c0300a] via-[#e8450a] to-[#f59c1a]",
		description:
			"Идеален за местни магазини и стартиращи бизнеси, които искат последователно онлайн присъствие без голям бюджет.",
		features: [
			"2 платформи (FB + IG)",
			"12 публикации / месец",
			"Копирайтинг + дизайн",
			"1 Reels видео / месец",
			"Месечен отчет",
			"Базова стратегия",
		],
	},
	{
		name: "Растеж",
		tagline: "За активни бизнеси",
		price: "420",
		priceLabel: "€ / месец",
		badge: "Най-популярен",
		gradient: "from-[#e8450a] via-[#f26522] to-[#f59c1a]",
		description:
			"Пълен пакет с реклама И базова автоматизация. Конкурентите таксуват тези услуги поотделно за ~600–700 €.",
		features: [
			"3 платформи (FB + IG + TikTok)",
			"20 публикации / месец",
			"2 Reels видеа / месец",
			"Community management",
			"Meta Ads управление",
			"Базова автоматизация",
			"Двуседмичен отчет",
		],
	},
	{
		name: "Система",
		tagline: "За амбициозен растеж",
		price: "715",
		priceLabel: "€ / месец",
		badge: null,
		gradient: "from-[#c0300a] via-[#e8450a] to-[#f26522]",
		description:
			"За бизнеси, които искат система — не просто публикации. Автоматизирани процеси, които работят докато ти спиш.",
		features: [
			"Всичко от Растеж +",
			"Пълна автоматизация + чатбот",
			"CRM интеграция",
			"4 видеа / месец",
			"Meta Ads + Google Ads",
			"A/B тестове на реклами",
			"Седмичен отчет",
			"Приоритетна поддръжка (до 4ч.)",
		],
	},
	{
		name: "Автоматизация",
		tagline: "Самостоятелна услуга",
		price: null,
		priceLabel: "По запитване",
		badge: "Ново",
		gradient: "from-[#0f0f1a] via-[#1a0a2e] to-[#2d1060]",
		description:
			"Само автоматизацията — без SMM абонамент. Чатботове, AI агенти, email sequences и workflow автоматизация за бизнеси, които искат да работят по-умно.",
		features: [
			"AI чатбот за сайт / Messenger",
			"Автоматични email sequences",
			"CRM setup и интеграция",
			"Lead capture автоматизация",
			"Workflow автоматизация (n8n / Make)",
			"Месечна поддръжка и оптимизация",
			"Onboarding и обучение",
		],
	},
];

function FlipCard({ pkg }: { pkg: (typeof PACKAGES)[0] }) {
	const [flipped, setFlipped] = useState(false);
	const isAuto = pkg.name === "Автоматизация";

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
					{pkg.badge && (
						<div
							className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-[10px] font-bold tracking-[2px] uppercase text-white whitespace-nowrap ${
								isAuto
									? "bg-gradient-to-r from-violet-600 to-purple-500"
									: "bg-gradient-to-r from-[#e8450a] to-[#f26522]"
							}`}
						>
							{pkg.badge}
						</div>
					)}

					{/* Gradient image area */}
					<div
						className={`relative h-[200px] bg-gradient-to-br ${pkg.gradient} flex-shrink-0`}
					>
						<div
							className="absolute inset-0 opacity-25"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
							}}
						/>

						{/* Automation icon */}
						{isAuto && (
							<div className="absolute inset-0 flex items-center justify-center opacity-20">
								<Zap className="w-24 h-24 text-white" />
							</div>
						)}

						{/* Price */}
						<div className="absolute bottom-0 right-0 bg-black/40 backdrop-blur-sm px-3 py-2">
							{pkg.price ? (
								<>
									<div className="font-display font-black text-white leading-none text-[16px]">
										€{pkg.price}
									</div>
									<div className="text-white/60 text-[11px] tracking-[1px]">
										/ месец
									</div>
								</>
							) : (
								<div className="font-display font-bold text-white text-[10px] tracking-[1px]">
									По запитване
								</div>
							)}
						</div>

						{/* Name */}
						<div className="absolute bottom-0 left-0 px-4 py-4">
							<p className="text-white/50 text-[10px] font-semibold tracking-[3px] uppercase">
								{pkg.tagline}
							</p>
							<h3 className="font-display font-black text-white text-[22px] leading-normal">
								{pkg.name}
							</h3>
						</div>
					</div>

					{/* Features */}
					<div
						className={`flex-1 px-7 py-6 flex flex-col justify-between ${isAuto ? "bg-[#0d0a1a]" : "bg-dark-charcoal"}`}
					>
						<ul className="flex flex-col gap-3">
							{pkg.features.map((f) => (
								<li
									key={f}
									className="flex items-center gap-3 text-[13px] text-white/65"
								>
									<Check
										className={`w-3.5 h-3.5 flex-shrink-0 ${isAuto ? "text-violet-400" : "text-[#f26522]"}`}
									/>
									{f}
								</li>
							))}
							{pkg.features.length > 6 && (
								<li
									className={`text-[12px] font-medium mt-1 ${isAuto ? "text-violet-400" : "text-[#f26522]"}`}
								>
									{/* +{pkg.features.length - 7} още → */}
								</li>
							)}
						</ul>
						<div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] text-white/25 tracking-[1px] text-center">
							Задръж за повече информация
						</div>
					</div>
				</div>

				{/* ── BACK ── */}
				<div
					className={`absolute inset-0 flex flex-col overflow-hidden border ${isAuto ? "border-violet-500/20 bg-[#0d0a1a]" : "border-[#f26522]/20 bg-dark-charcoal"}`}
					style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
				>
					<div
						className={`h-[3px] bg-gradient-to-r ${isAuto ? "from-violet-700 via-purple-500 to-violet-400" : pkg.gradient}`}
					/>

					<div className="flex-1 px-8 py-7 flex flex-col">
						<p
							className={`text-[10px] font-semibold tracking-[3px] uppercase mb-1 ${isAuto ? "text-violet-400" : "text-[#f26522]"}`}
						>
							{pkg.tagline}
						</p>
						<h3 className="font-display font-black text-[24px] mb-3">{pkg.name}</h3>
						<p className="text-[13px] text-white/55 leading-relaxed mb-5">
							{pkg.description}
						</p>

						<div className="h-px bg-white/[0.06] mb-5" />

						<ul className="flex flex-col gap-2.5 flex-1">
							{pkg.features.slice(0, 5).map((f) => (
								<li
									key={f}
									className="flex items-center gap-3 text-[13px] text-white/75"
								>
									<div
										className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
											isAuto
												? "bg-violet-500/10 border border-violet-500/30"
												: "bg-[#f26522]/10 border border-[#f26522]/30"
										}`}
									>
										<Check
											className={`w-2 h-2 ${isAuto ? "text-violet-400" : "text-[#f26522]"}`}
										/>
									</div>
									{f}
								</li>
							))}
							{pkg.features.length > 5 && (
								<li
									className={`text-[12px] font-medium mt-1 ${isAuto ? "text-violet-400" : "text-[#f26522]"}`}
								>
									+{pkg.features.length - 5} още →
								</li>
							)}
						</ul>

						<div className="mt-5 pt-5 border-t border-white/[0.06]">
							<div className="flex items-baseline gap-1 mb-4">
								{pkg.price ? (
									<>
										<span className="font-display font-black text-gradient text-[34px] leading-none">
											€{pkg.price}
										</span>
										<span className="text-white/40 text-[12px]">/ месец</span>
									</>
								) : (
									<span
										className={`font-display font-bold text-[10px] ${isAuto ? "text-violet-400" : "text-gradient"}`}
									>
										По запитване
									</span>
								)}
							</div>
							<a
								href="#cta"
								onClick={(e) => e.stopPropagation()}
								className={`w-full text-center flex items-center justify-center gap-2 py-[14px] px-6 font-display text-[11px] font-bold tracking-[2px] uppercase text-white rounded-[4px] transition-all duration-300 hover:-translate-y-0.5 ${
									isAuto
										? "bg-gradient-to-r from-violet-700 to-purple-600 hover:shadow-[0_20px_50px_rgba(124,58,237,0.4)]"
										: "bg-gradient-to-r from-[#e8450a] to-[#f26522] hover:shadow-[0_20px_50px_rgba(232,69,10,0.4)]"
								}`}
							>
								{pkg.price ? "Избери пакета" : "Запитване"}
								<ArrowRight className="w-4 h-4" />
							</a>
							<p className="text-[10px] text-white/25 text-center mt-3">
								{pkg.price
									? "Мин. 3 месеца · Без скрити такси"
									: "Безплатна консултация · Без ангажимент"}
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
				stagger: 0.2,
				ease: "power2.out",
				scrollTrigger: {
					trigger: ".pkg-grid",
					start: "top 60%",
				},
			});
		},
		{ scope: container },
	);

	return (
		<section ref={container} id="packages" className="py-16 px-16 bg-dark-charcoal">
			{/* HEADER */}
			<div className="text-center mb-20">
				<span className="section-label">Прозрачно ценообразуване</span>
				<h2 className="section-title">
					Избери своя
					<br />
					<span className="text-gradient">Пакет</span>
				</h2>
				<p className="text-[15px] text-white/50 max-w-md mx-auto mt-5 leading-relaxed">
					Три месечни пакета или самостоятелна автоматизация. Рекламният бюджет е отделен
					от нашата такса.
				</p>
			</div>

			{/* 4 FLIP CARDS — 3 + 1 layout */}
			<div className="pkg-grid max-w-7xl mx-auto">
				<div className="grid grid-cols-4 gap-6 mb-6">
					{PACKAGES.map((pkg) => (
						<FlipCard key={pkg.name} pkg={pkg} />
					))}
				</div>
			</div>

			{/* CUSTOM CTA BANNER */}
			<div className="pkg-card max-w-7xl mx-auto mt-12 relative border border-white/[0.07] bg-dark-surface overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c0300a] via-[#e8450a] to-[#f26522]" />
				<div className="flex items-center justify-between px-12 py-9 gap-10">
					<div>
						<p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#f26522] mb-1">
							Нещо по-голямо?
						</p>
						<h3 className="font-display font-black text-[20px] mb-1">Custom Проект</h3>
						<p className="text-[14px] text-white/45 leading-relaxed">
							Уебсайт, пълен rebrand, enterprise ретейнер или комбинация от услуги —
							обсъждаме конкретните ти нужди.
						</p>
					</div>
					<a
						href="#cta"
						className="btn-primary whitespace-nowrap flex items-center gap-2"
					>
						Безплатна консултация
						<ArrowRight className="w-4 h-4" />
					</a>
				</div>
			</div>
		</section>
	);
}
