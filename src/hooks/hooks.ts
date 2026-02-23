"use client";

import { useEffect, useRef, useState } from "react";

// ─── useNavScroll ─────────────────────────────────────────────
export function useNavScroll(threshold = 50) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handler = () => setScrolled(window.scrollY > threshold);
		window.addEventListener("scroll", handler, { passive: true });
		return () => window.removeEventListener("scroll", handler);
	}, [threshold]);

	return scrolled;
}

// ─── useScrollReveal ──────────────────────────────────────────
export function useScrollReveal(threshold = 0.1) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					el.classList.add("visible");
					observer.unobserve(el);
				}
			},
			{ threshold, rootMargin: "0px 0px -40px 0px" },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);

	return ref;
}

// ─── useCounter ───────────────────────────────────────────────
export function useCounter(target: number, duration = 1800) {
	const [value, setValue] = useState(0);
	const [started, setStarted] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	// Наблюдава елемента — стартира при влизане във viewport
	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					setStarted(true);
					el.classList.add("visible");
					observer.unobserve(el);
				}
			},
			{ threshold: 0.3 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [started]);

	// Анимира числото от 0 до target
	useEffect(() => {
		if (!started) return;

		const startTime = performance.now();
		const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

		const tick = (now: number) => {
			const progress = Math.min((now - startTime) / duration, 1);
			setValue(Math.round(easeOut(progress) * target));
			if (progress < 1) requestAnimationFrame(tick);
		};

		requestAnimationFrame(tick);
	}, [started, target, duration]);

	return { value, ref };
}
