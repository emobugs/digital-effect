"use client";

// Лепкавият индекс 01–04 вляво от „Системата“ — следи същия прогрес като 3D сцената.
import { useEffect, useState } from "react";
import { sceneBus } from "@/components/scene/bus";

export default function SystemIndex({ labels }: { labels: string[] }) {
	const [i, setI] = useState(0);
	useEffect(() => {
		const f = () => { if (sceneBus.stage === 1) setI(Math.min(labels.length - 1, Math.floor(sceneBus.local * labels.length))); };
		sceneBus.listeners.add(f);
		return () => { sceneBus.listeners.delete(f); };
	}, [labels.length]);
	return (
		<ol className="space-y-3">
			{labels.map((l, k) => (
				<li key={l} className="flex items-center gap-4">
					<span className={`h-px transition-all duration-700 ${k === i ? "w-12 bg-[#f26522]" : "w-5 bg-white/20"}`} />
					<span className={`font-display text-[15px] font-extrabold transition-colors duration-500 ${k === i ? "text-white" : "text-white/30"}`}>{l}</span>
				</li>
			))}
		</ol>
	);
}
