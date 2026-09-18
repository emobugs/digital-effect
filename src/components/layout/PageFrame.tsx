"use client";

// ── Обвивка за вътрешните страници (/hello, /partners/*, /radar, /privacy) ──
// Същите Navbar и Footer като началната, за да има навигация и път назад
// отвсякъде. Navbar-ът е fixed 76px → отместваме съдържанието. Без Lenis —
// тези страници са форми, native скролът е по-предвидим.
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/sections/Footer";

export default function PageFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return (
		<>
			<Navbar />
			<main className={`min-h-screen bg-dark-obsidian text-gray-100 pt-[76px] ${className}`}>{children}</main>
			<Footer />
		</>
	);
}
