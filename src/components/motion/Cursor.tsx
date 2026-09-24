"use client";

// ── Курсорът: точка + пръстен, който „усеща“ интерактивните елементи ────────
// Само при мишка (pointer: fine) и без prefers-reduced-motion. Над линк/бутон
// пръстенът се разширява; над [data-cursor="Текст"] показва думата вътре.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Cursor() {
	const dot = useRef<HTMLDivElement>(null);
	const ring = useRef<HTMLDivElement>(null);
	const label = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)").matches;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!fine || reduce || !dot.current || !ring.current) return;
		document.documentElement.classList.add("has-cursor");
		const d = dot.current, r = ring.current;
		gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });
		const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
		const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
		const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3" });
		const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3" });
		let shown = false;
		const move = (e: PointerEvent) => {
			if (!shown) { gsap.to([d, r], { opacity: 1, duration: 0.3 }); shown = true; }
			dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
			const t = e.target as HTMLElement;
			const tagged = t.closest?.("[data-cursor]") as HTMLElement | null;
			const interactive = t.closest?.("a, button, [role='button'], input, textarea, select, label, summary");
			const text = tagged?.dataset.cursor || "";
			if (label.current && label.current.textContent !== text) label.current.textContent = text;
			gsap.to(r, { width: text ? 96 : interactive ? 58 : 34, height: text ? 96 : interactive ? 58 : 34, backgroundColor: text ? "rgba(242,101,34,0.92)" : "rgba(242,101,34,0)", duration: 0.35, ease: "power3.out", overwrite: "auto" });
			gsap.to(d, { scale: interactive || text ? 0 : 1, duration: 0.25, overwrite: "auto" });
		};
		const leave = () => { gsap.to([d, r], { opacity: 0, duration: 0.3 }); shown = false; };
		const down = () => gsap.to(r, { scale: 0.8, duration: 0.2 });
		const up = () => gsap.to(r, { scale: 1, duration: 0.3 });
		window.addEventListener("pointermove", move, { passive: true });
		document.addEventListener("pointerleave", leave);
		window.addEventListener("pointerdown", down);
		window.addEventListener("pointerup", up);
		return () => {
			document.documentElement.classList.remove("has-cursor");
			window.removeEventListener("pointermove", move);
			document.removeEventListener("pointerleave", leave);
			window.removeEventListener("pointerdown", down);
			window.removeEventListener("pointerup", up);
		};
	}, []);

	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 z-[80] hidden md:block">
			<div ref={dot} style={{ opacity: 0 }} className="fixed left-0 top-0 h-[6px] w-[6px] rounded-full bg-[#f26522]" />
			<div ref={ring} style={{ opacity: 0 }} className="fixed left-0 top-0 grid h-[34px] w-[34px] place-items-center rounded-full border border-[#f26522]/70 mix-blend-normal">
				<span ref={label} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white" />
			</div>
		</div>
	);
}
