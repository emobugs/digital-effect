"use client";

import { ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
	{ label: "Услуги", href: "#services" },
	{ label: "Пакети", href: "#packages" },
	{ label: "Процес", href: "#process" },
	{ label: "Проекти", href: "#projects" },
	{ label: "Контакт", href: "#cta" },
];

const SOCIAL_LINKS = [
	{ label: "Facebook", href: "https://www.facebook.com/digitalleffect/" },
	{ label: "Instagram", href: "https://instagram.com" },
	{ label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-white/[0.06] bg-dark-charcoal px-4 md:px-16 pt-16 pb-8">
			{/* TOP GRID */}
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
				{/* COL 1 — Logo + tagline */}
				<div className="flex flex-col gap-4">
					<a href="#" className="font-display font-black text-[22px] tracking-[-0.5px]">
						Digital<span className="text-gradient">Effect</span>
					</a>
					<p className="text-[13px] text-white/40 leading-relaxed max-w-[220px]">
						Дигитален маркетинг, уеб разработка и автоматизация за бизнеси, които искат
						да растат.
					</p>
				</div>

				{/* COL 2 — Navigation */}
				<div>
					<p className="text-[10px] font-semibold tracking-[3px] uppercase text-white/25 mb-5">
						Навигация
					</p>
					<ul className="flex flex-row gap-3">
						{NAV_LINKS.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									className="text-[13px] text-white/50 hover:text-white transition-colors duration-300"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* COL 3 — Contact + social */}
				<div>
					<p className="text-[10px] font-semibold tracking-[3px] uppercase text-white/25 mb-5">
						Контакт
					</p>
					<div className="flex flex-col gap-3 mb-8">
						<a
							href="mailto:hello@digitaleffect.bg"
							className="text-[13px] text-white/50 hover:text-white transition-colors duration-300"
						>
							hello@digitaleffect.bg
						</a>
						<a
							href="tel:+359888000000"
							className="text-[13px] text-white/50 hover:text-white transition-colors duration-300"
						>
							+359 888 000 000
						</a>
					</div>

					<p className="text-[10px] font-semibold tracking-[3px] uppercase text-white/25 mb-4">
						Социални мрежи
					</p>
					<div className="flex gap-4">
						{SOCIAL_LINKS.map((s) => (
							<a
								key={s.label}
								href={s.href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-[12px] text-white/40 hover:text-[#f26522] transition-colors duration-300"
							>
								{s.label}
								<ArrowUpRight className="w-3 h-3" />
							</a>
						))}
					</div>
				</div>
			</div>

			{/* BOTTOM — divider + copyright */}
			<div className="max-w-7xl mx-auto border-t border-white/[0.05] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
				<p className="text-[11px] text-white/20 tracking-[0.5px]">
					© {year} Digital Effect. Всички права запазени.
				</p>
				<p className="text-[11px] text-white/15 tracking-[0.5px]">
					Проектиран и разработен от Digital Effect
				</p>
			</div>
		</footer>
	);
}
