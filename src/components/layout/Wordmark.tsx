"use client";

// ── Голямото „DIGITAL EFFECT“ във footer-а ───────────────────────────────────
// Контурен текст; под мишката се „разгаря“ в оранжево (маска с радиален градиент).
// Без JS — просто контур. Декоративно: aria-hidden.
import { useRef } from "react";

export default function Wordmark() {
	const ref = useRef<HTMLDivElement>(null);
	const move = (e: React.PointerEvent) => {
		const el = ref.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		el.style.setProperty("--wx", `${e.clientX - r.left}px`);
		el.style.setProperty("--wy", `${e.clientY - r.top}px`);
		el.style.setProperty("--wr", "320px");
	};
	const leave = () => ref.current?.style.setProperty("--wr", "0px");
	return (
		<div ref={ref} onPointerMove={move} onPointerLeave={leave} aria-hidden className="relative mt-16 select-none px-[var(--gutter)]" data-cursor="Ефект">
			<div className="display text-outline whitespace-nowrap text-center" style={{ fontSize: "min(220px, calc((100vw - 2 * var(--gutter)) / 8.35))", lineHeight: 0.85 }}>DIGITAL EFFECT</div>
			<div
				className="display text-gradient pointer-events-none absolute inset-0 whitespace-nowrap px-[var(--gutter)] text-center"
				style={{
					fontSize: "min(220px, calc((100vw - 2 * var(--gutter)) / 8.35))",
					lineHeight: 0.85,
					WebkitMaskImage: "radial-gradient(var(--wr, 0px) circle at var(--wx, 50%) var(--wy, 50%), #000 30%, transparent 70%)",
					maskImage: "radial-gradient(var(--wr, 0px) circle at var(--wx, 50%) var(--wy, 50%), #000 30%, transparent 70%)",
					transition: "--wr .4s",
				}}
			>
				DIGITAL EFFECT
			</div>
		</div>
	);
}
