"use client";

const ITEMS = [
	"Web Design",
	"Analytics",
	"Facebook",
	"Automation",
	"Instagram",
	"Reels",
	"TikTok",
	"Stories",
	"Meta Ads",
	"Branding",
	"Strategy",
	"GOOGLE Ads",
];

export default function Marquee() {
	const doubled = [...ITEMS, ...ITEMS];

	return (
		<div className="relative border-t border-b border-white/[0.07] py-5 overflow-hidden">
			{/* Fade edges */}
			<div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-dark-obsidian to-transparent" />
			<div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-dark-obsidian to-transparent" />

			<div className="flex animate-marquee whitespace-nowrap">
				{doubled.map((item, i) => (
					<span
						key={i}
						className="inline-flex items-center gap-4 mx-10 text-[11px] font-bold tracking-[4px] uppercase text-white/25 hover:text-white/70 transition-colors duration-300"
					>
						{item}
						<span className="w-1 h-1 rounded-full bg-[#f26522]/50" />
					</span>
				))}
			</div>
		</div>
	);
}
