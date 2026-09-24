"use client";

// ── Навигацията ──────────────────────────────────────────────────────────────
// Desktop: лого · Услуги (мега меню с 4-те модула + Growth Partner) · Цени ·
// Резултати · Ресурси · За нас · „Вземи оферта“ (винаги видимо).
// Скрива се при скрол надолу, връща се при скрол нагоре. Hover върху модул в
// менюто осветява същия модул в 3D ядрото (sceneBus.highlight).
// Телефон: бутон „Меню“ → цял екран; долен док в зоната на палеца (MobileDock).
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Megaphone, MessagesSquare, MonitorSmartphone, Sparkles, Layers } from "lucide-react";
import { NAV } from "@/lib/site";
import { sceneBus, type Module } from "@/components/scene/bus";

const ICONS = { ads: Megaphone, smm: MessagesSquare, web: MonitorSmartphone, ai: Sparkles } as const;

export default function Navbar() {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [mega, setMega] = useState(false);
	const [open, setOpen] = useState(false);
	const lastY = useRef(0);
	const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY;
			setScrolled(y > 24);
			setHidden(y > 240 && y > lastY.current + 4 && !mega);
			if (y < lastY.current - 4) setHidden(false);
			lastY.current = y;
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [mega]);

	// затваряне при навигация (setState при рендер вместо ефект — препоръката на React)
	const [path, setPath] = useState(pathname);
	if (path !== pathname) { setPath(pathname); setOpen(false); setMega(false); }
	useEffect(() => { document.documentElement.style.overflow = open ? "hidden" : ""; }, [open]);

	const openMega = () => { if (closeT.current) clearTimeout(closeT.current); setMega(true); };
	const closeMega = () => { closeT.current = setTimeout(() => { setMega(false); sceneBus.set({ highlight: null }); }, 160); };
	const active = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

	return (
		<>
			<header
				className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,backdrop-filter] duration-500 ${hidden ? "-translate-y-full" : "translate-y-0"} ${scrolled || mega ? "bg-[#07080a]/75 backdrop-blur-xl" : "bg-transparent"}`}
				style={{ transitionTimingFunction: "var(--ease-out)" }}
			>
				<div className={`wrap flex h-[72px] items-center justify-between gap-6 border-b transition-colors duration-500 ${scrolled || mega ? "border-white/[0.07]" : "border-transparent"}`}>
					<Link href="/" className="relative z-10 flex items-center gap-3" aria-label="Digital Effect — начало">
						<Image src="/logo.webp" alt="Digital Effect" width={183} height={176} priority className="h-10 w-auto" />
					</Link>

					<nav aria-label="Основна навигация" className="hidden items-center gap-1 lg:flex">
						<div onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
							<Link href="/uslugi" aria-expanded={mega} onFocus={openMega}
								className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${active("/uslugi") || mega ? "text-white" : "text-white/65 hover:text-white"}`}>
								Услуги
							</Link>
						</div>
						{NAV.main.map((l) => (
							<Link key={l.href} href={l.href} className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${active(l.href) ? "text-white" : "text-white/65 hover:text-white"}`}>
								{l.label}
							</Link>
						))}
					</nav>

					<div className="flex items-center gap-2">
						<Link href={NAV.cta.href} data-magnetic="0.2" className="btn-x btn-orange btn-sm hidden sm:inline-flex">
							<span className="btn-fill" aria-hidden />
							<span className="relative">{NAV.cta.label}</span>
						</Link>
						<button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu"
							className="relative z-10 flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-white ring-1 ring-white/15 lg:hidden">
							<span className="relative block h-3 w-4">
								<span className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-500 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
								<span className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-500 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
							</span>
							{open ? "Затвори" : "Меню"}
						</button>
					</div>
				</div>

				{/* Мега меню */}
				<div onMouseEnter={openMega} onMouseLeave={closeMega}
					className={`absolute inset-x-0 top-full hidden origin-top overflow-hidden border-b border-white/[0.07] bg-[#07080a]/92 backdrop-blur-xl transition-all duration-500 lg:block ${mega ? "visible max-h-[420px] opacity-100" : "invisible max-h-0 opacity-0"}`}
					style={{ transitionTimingFunction: "var(--ease-out)" }}>
					<div className="wrap grid grid-cols-[repeat(4,1fr)_1.25fr] gap-3 py-6">
						{NAV.services.map((s, i) => {
							const Icon = ICONS[s.module as keyof typeof ICONS];
							return (
								<Link key={s.href} href={s.href}
									onMouseEnter={() => sceneBus.set({ highlight: s.module as Module })}
									className="card card-spot group flex min-h-[170px] flex-col justify-between p-5 transition-transform duration-500 hover:-translate-y-1"
									style={{ transitionDelay: mega ? `${i * 40}ms` : "0ms" }}>
									<span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f26522]/12 text-[#f5813a] ring-1 ring-[#f26522]/30"><Icon size={19} /></span>
									<span>
										<span className="flex items-center justify-between font-display text-[18px] font-extrabold tracking-[-0.01em]">{s.label}<ArrowUpRight size={16} className="opacity-0 transition-all duration-500 group-hover:translate-x-0.5 group-hover:opacity-100" /></span>
										<span className="mt-1 block text-[13px] leading-snug text-[var(--muted)]">{s.text}</span>
									</span>
								</Link>
							);
						})}
						<Link href="/uslugi/growth-partner" className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[18px] p-5"
							style={{ background: "linear-gradient(140deg, #2d1060 0%, #140a26 55%, #0c0d10 100%)", boxShadow: "inset 0 0 0 1px rgba(107,59,214,.45)" }}>
							<span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white"><Layers size={19} /></span>
							<span>
								<span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9b3ff]">Цялата система</span>
								<span className="mt-1 flex items-center justify-between font-display text-[20px] font-black">Growth Partner<ArrowUpRight size={16} /></span>
								<span className="mt-1 block text-[13px] text-white/60">Реклама + SMM + сайт + AI — един екип, един план.</span>
							</span>
						</Link>
					</div>
				</div>
			</header>

			{/* Мобилно меню */}
			<div id="mobile-menu" className={`fixed inset-0 z-40 bg-[#07080a] transition-[clip-path] duration-700 lg:hidden ${open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"}`} style={{ transitionTimingFunction: "var(--ease-in-out)" }}>
				<div className="wrap flex h-full flex-col justify-between pb-28 pt-[96px]">
					<nav aria-label="Мобилна навигация" className="flex flex-col">
						<span className="eyebrow mb-4">Услуги</span>
						{NAV.services.map((s, i) => (
							<Link key={s.href} href={s.href} className="border-b border-white/[0.07] py-3 font-display text-[28px] font-black tracking-[-0.02em]" style={{ transition: "opacity .6s, transform .6s", transitionDelay: open ? `${120 + i * 50}ms` : "0ms", opacity: open ? 1 : 0, transform: open ? "none" : "translateY(20px)" }}>{s.label}</Link>
						))}
						<Link href="/uslugi/growth-partner" className="border-b border-white/[0.07] py-3 font-display text-[28px] font-black tracking-[-0.02em] text-[#c9b3ff]">Growth Partner</Link>
						<div className="mt-6 grid grid-cols-2 gap-2">
							{NAV.main.map((l) => (
								<Link key={l.href} href={l.href} className="rounded-2xl px-4 py-3 text-[16px] font-medium ring-1 ring-white/10">{l.label}</Link>
							))}
						</div>
					</nav>
					<Link href={NAV.cta.href} className="btn-x btn-orange w-full"><span className="btn-fill" aria-hidden /><span className="relative">{NAV.cta.label} — 2 минути</span></Link>
				</div>
			</div>
		</>
	);
}
