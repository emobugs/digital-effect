"use client";

import { STATS } from "@/lib/constants";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function StatCell({
	target,
	suffix,
	label,
	sub,
}: {
	target: number;
	suffix: string;
	label: string;
	sub: string;
}) {
	const [value, setValue] = useState(0);
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref, { once: true, margin: "-100px" });

	useEffect(() => {
		if (!inView) return;
		const controls = animate(0, target, {
			duration: 1.8,
			ease: "easeOut",
			onUpdate: (v) => setValue(Math.round(v)),
		});
		return () => controls.stop();
	}, [inView, target]);

	const container = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.4, // всяко дете с 0.1s delay
			},
		},
	};

	const item = {
		hidden: { opacity: 0, y: 24 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	return (
		<motion.div
			ref={ref}
			variants={container}
			className="relative bg-dark-surface md:px-11 md:py-19 p-8 overflow-hidden group"
		>
			{/* Gradient top line — анимира се при влизане във viewport */}
			<motion.div
				variants={item}
				className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#c0300a] via-[#e8450a] to-[#f26522] scale-x-0 group-[.visible]:scale-x-100 origin-left transition-transform duration-700"
			/>

			<div
				className="font-display font-black text-gradient leading-none"
				style={{ fontSize: "clamp(30px, 4.5vw, 66px)" }}
			>
				{value}
				{suffix}
			</div>
			<div className="text-[13px] text-white/50 mt-3 leading-relaxed">
				{label}
				<br />
				<span className="text-white/30">{sub}</span>
			</div>
		</motion.div>
	);
}

export default function Stats() {
	return (
		<section
			id="stats"
			className="relative z-10 border-t border-b border-white/[0.06] bg-dark-surface"
		>
			<div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
				{STATS.map((stat) => (
					<StatCell
						key={stat.label}
						target={stat.target}
						suffix={stat.suffix}
						label={stat.label}
						sub={stat.sub}
					/>
				))}
			</div>
		</section>
	);
}
