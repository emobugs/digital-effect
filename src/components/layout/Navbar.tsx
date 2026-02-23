"use client";

import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		setScrolled(latest > 50);
	});

	return (
		<motion.nav
			className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        px-16 h-[76px]
        border-b border-white/[0.07]`}
			animate={{
				backgroundColor: scrolled ? "rgba(7, 8, 10, 0.92)" : "rgba(7, 8, 10, 0.30)",
				backdropFilter: "blur(20px)",
			}}
			transition={{ duration: 0.3 }}
		>
			{/* ЛОГО */}
			<Link href="/">
				<Image
					src="/logo.png"
					alt={SITE.name}
					width={140}
					height={52}
					className="h-[52px] w-auto object-contain"
					priority
				/>
			</Link>

			{/* НАВЛИНКОВЕ */}
			<ul className="flex gap-9 list-none">
				{NAV_LINKS.map((link) => (
					<li key={link.href}>
						<a
							href={link.href}
							className="
                text-white/50 text-[12px] font-medium
                tracking-[2px] uppercase
                transition-colors duration-300
                hover:text-white
              "
						>
							{link.label}
						</a>
					</li>
				))}
			</ul>

			{/* CTA БУТОН */}
			<a href="#cta" className="btn-primary">
				Свържи се с нас
			</a>
		</motion.nav>
	);
}
