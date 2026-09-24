"use client";

// ── Долният док на телефона — в зоната на палеца, винаги видим ──────────────
// Услуги · Цени · Обади се (ако има телефон; иначе Контакт) · Оферта.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Tag, Phone, Send, Mail } from "lucide-react";
import { SITE, telHref } from "@/lib/site";

export default function MobileDock() {
	const pathname = usePathname();
	const [show, setShow] = useState(false);
	useEffect(() => {
		const on = () => setShow(window.scrollY > 320);
		on();
		window.addEventListener("scroll", on, { passive: true });
		return () => window.removeEventListener("scroll", on);
	}, []);
	if (/^\/(oferta|hello)/.test(pathname || "")) return null;
	const items = [
		{ href: "/uslugi", label: "Услуги", Icon: LayoutGrid },
		{ href: "/ceni", label: "Цени", Icon: Tag },
		SITE.phone ? { href: telHref(SITE.phone), label: "Обади се", Icon: Phone } : { href: "/kontakti", label: "Контакт", Icon: Mail },
	];
	return (
		<nav aria-label="Бърз достъп" className={`fixed inset-x-3 bottom-3 z-40 transition-transform duration-500 lg:hidden ${show ? "translate-y-0" : "translate-y-[140%]"}`} style={{ transitionTimingFunction: "var(--ease-out)", paddingBottom: "env(safe-area-inset-bottom)" }}>
			<div className="flex items-center gap-1 rounded-full bg-[#111216]/90 p-1.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,.8)] ring-1 ring-white/10 backdrop-blur-xl">
				{items.map(({ href, label, Icon }) => (
					<Link key={label} href={href} className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-medium ${pathname?.startsWith(href) ? "text-white" : "text-white/60"}`}>
						<Icon size={18} />{label}
					</Link>
				))}
				<Link href="/hello" className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[#e8450a] to-[#f26522] px-5 py-3 text-[13px] font-semibold text-white">
					<Send size={16} />Оферта
				</Link>
			</div>
		</nav>
	);
}
