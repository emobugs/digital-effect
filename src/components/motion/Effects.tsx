"use client";

// ── Глобалните движения: плавен скрол, разкриване, прожектор, магнит ─────────
// Един компонент в root layout-а вместо ефекти по всяка секция:
//   Lenis (плавен скрол) ↔ GSAP ScrollTrigger на един ticker
//   [data-reveal]       — появяване при влизане в екрана (--d = закъснение)
//   .card-spot          — прожектор под мишката (--sx/--sy)
//   .btn-x              — оранжевото запълване тръгва от точката на влизане (--mx/--my)
//   [data-magnetic]     — елементът леко се притегля към курсора
// prefers-reduced-motion → без Lenis и без магнит; съдържанието е видимо веднага.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

export default function Effects() {
	const pathname = usePathname();

	/* Плавен скрол — веднъж за цялата сесия */
	useEffect(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) return;
		lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 });
		lenis.on("scroll", ScrollTrigger.update);
		const tick = (time: number) => lenis?.raf(time * 1000);
		gsap.ticker.add(tick);
		gsap.ticker.lagSmoothing(0);
		// котви (#…) през Lenis
		const onClick = (e: MouseEvent) => {
			const a = (e.target as HTMLElement).closest?.("a[href^='#'], a[href^='/#']") as HTMLAnchorElement | null;
			if (!a) return;
			const hash = a.getAttribute("href")!.replace(/^\//, "");
			if (a.getAttribute("href")!.startsWith("/#") && window.location.pathname !== "/") return;
			const el = document.querySelector(hash);
			if (!el) return;
			e.preventDefault();
			lenis?.scrollTo(el as HTMLElement, { offset: -80 });
			history.replaceState(null, "", hash);
		};
		document.addEventListener("click", onClick);
		return () => { document.removeEventListener("click", onClick); gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; };
	}, []);

	/* Нова страница → нагоре + преизчисляване */
	useEffect(() => {
		if (!window.location.hash) lenis?.scrollTo(0, { immediate: true });
		const t = setTimeout(() => ScrollTrigger.refresh(), 250);
		return () => clearTimeout(t);
	}, [pathname]);

	/* Разкриване при скрол */
	useEffect(() => {
		const io = new IntersectionObserver(
			(entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
		);
		const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
		scan();
		const mo = new MutationObserver(scan);
		mo.observe(document.body, { childList: true, subtree: true });
		return () => { io.disconnect(); mo.disconnect(); };
	}, [pathname]);

	/* Прожектор, запълване на бутоните, магнит */
	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)").matches;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const onMove = (e: PointerEvent) => {
			const t = e.target as HTMLElement;
			const card = t.closest?.(".card-spot") as HTMLElement | null;
			if (card) {
				const r = card.getBoundingClientRect();
				card.style.setProperty("--sx", `${e.clientX - r.left}px`);
				card.style.setProperty("--sy", `${e.clientY - r.top}px`);
			}
			const btn = t.closest?.(".btn-x") as HTMLElement | null;
			if (btn) {
				const r = btn.getBoundingClientRect();
				btn.style.setProperty("--mx", `${e.clientX - r.left}px`);
				btn.style.setProperty("--my", `${e.clientY - r.top}px`);
			}
		};
		document.addEventListener("pointermove", onMove, { passive: true });

		const mags: { el: HTMLElement; move: (e: PointerEvent) => void; leave: () => void }[] = [];
		if (fine && !reduce) {
			document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
				const strength = Number(el.dataset.magnetic) || 0.28;
				const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
				const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
				const move = (e: PointerEvent) => {
					const r = el.getBoundingClientRect();
					xTo((e.clientX - (r.left + r.width / 2)) * strength);
					yTo((e.clientY - (r.top + r.height / 2)) * strength);
				};
				const leave = () => { xTo(0); yTo(0); };
				el.addEventListener("pointermove", move);
				el.addEventListener("pointerleave", leave);
				mags.push({ el, move, leave });
			});
		}
		return () => {
			document.removeEventListener("pointermove", onMove);
			mags.forEach(({ el, move, leave }) => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
		};
	}, [pathname]);

	return null;
}
