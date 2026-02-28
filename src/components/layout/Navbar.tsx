"use client";

import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		setScrolled(latest > 50);
	});

	const close = () => setOpen(false);

	return (
		<>
			<motion.nav
				className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-16 h-[76px] border-b border-white/[0.07]"
				animate={{
					backgroundColor: scrolled ? "rgba(7, 8, 10, 0.92)" : "rgba(7, 8, 10, 0.30)",
					backdropFilter: "blur(20px)",
				}}
				transition={{ duration: 0.3 }}
			>
				{/* ЛОГО */}
				<Link href="#hero">
					<Image
						src="/logo.png"
						alt={SITE.name}
						width={140}
						height={52}
						className="h-[52px] w-auto object-contain"
						priority
					/>
				</Link>

				{/* ДЕСКТОП — навлинкове */}
				<ul className="hidden md:flex gap-9 list-none">
					{NAV_LINKS.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								className="text-white/50 text-[12px] font-medium tracking-[2px] uppercase transition-colors duration-300 hover:text-white"
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>

				{/* ДЕСКТОП — CTA */}
				<a href="#cta" className="btn-primary hidden md:inline-flex">
					Свържи се с нас
				</a>

				{/* МОБИЛЕН — хамбургер */}
				<button
					onClick={() => setOpen((o) => !o)}
					className="md:hidden w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-300"
				>
					{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
				</button>
			</motion.nav>

			{/* МОБИЛЕН — drawer */}
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="fixed top-[76px] left-0 right-0 z-40 bg-[rgba(7,8,10,0.97)] backdrop-blur-xl border-b border-white/[0.07] md:hidden"
					>
						<ul className="flex flex-col px-6 py-6 gap-1">
							{NAV_LINKS.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										onClick={close}
										className="flex items-center h-12 text-white/60 text-[13px] font-medium tracking-[2px] uppercase hover:text-white transition-colors duration-300 border-b border-white/[0.04] last:border-0"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
						<div className="px-6 pb-8">
							<a
								href="#cta"
								onClick={close}
								className="btn-primary w-full flex items-center justify-center"
							>
								Свържи се с нас
							</a>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
