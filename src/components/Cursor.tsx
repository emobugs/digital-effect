"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Cursor() {
	const dot = useRef<HTMLDivElement>(null);
	const ring = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const d = dot.current;
		const r = ring.current;
		if (!d || !r) return;

		// Hide default cursor on desktop only
		const isMobile = window.matchMedia("(max-width: 767px)").matches;
		if (isMobile) return;

		document.body.style.cursor = "none";

		const onMove = (e: MouseEvent) => {
			// Dot — instant
			gsap.set(d, { x: e.clientX, y: e.clientY });
			// Ring — lagged
			gsap.to(r, { x: e.clientX, y: e.clientY, duration: 0.18, ease: "power2.out" });
		};

		const onEnter = () => {
			gsap.to(r, {
				scale: 2.2,
				borderColor: "rgba(242,101,34,0.6)",
				duration: 0.25,
				ease: "power2.out",
			});
			gsap.to(d, { scale: 0, duration: 0.2 });
		};

		const onLeave = () => {
			gsap.to(r, {
				scale: 1,
				borderColor: "rgba(242,101,34,0.4)",
				duration: 0.25,
				ease: "power2.out",
			});
			gsap.to(d, { scale: 1, duration: 0.2 });
		};

		const onLeaveWindow = () => gsap.to([d, r], { opacity: 0, duration: 0.2 });
		const onEnterWindow = () => gsap.to([d, r], { opacity: 1, duration: 0.2 });

		window.addEventListener("mousemove", onMove);
		document.documentElement.addEventListener("mouseleave", onLeaveWindow);
		document.documentElement.addEventListener("mouseenter", onEnterWindow);

		const attachHover = () => {
			document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
				el.addEventListener("mouseenter", onEnter);
				el.addEventListener("mouseleave", onLeave);
			});
		};
		attachHover();

		return () => {
			document.body.style.cursor = "";
			window.removeEventListener("mousemove", onMove);
			document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
			document.documentElement.removeEventListener("mouseenter", onEnterWindow);
			document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
				el.removeEventListener("mouseenter", onEnter);
				el.removeEventListener("mouseleave", onLeave);
			});
		};
	}, []);

	return (
		<>
			{/* Dot — instant */}
			<div
				ref={dot}
				className="fixed top-0 left-0 z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 hidden md:block"
			>
				<div className="w-[6px] h-[6px] rounded-full bg-[#f26522]" />
			</div>

			{/* Ring — lagged */}
			<div
				ref={ring}
				className="fixed top-0 left-0 z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2 hidden md:block"
			>
				<div className="w-[36px] h-[36px] rounded-full border border-[#f26522]/40" />
			</div>
		</>
	);
}
