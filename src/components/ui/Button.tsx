// ── Бутоните: магнитни, с оранжево запълване от точката на влизане ─────────
// Server component — поведението идва от motion/Effects (--mx/--my, [data-magnetic]).
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type Props = {
	href: string;
	children: React.ReactNode;
	variant?: "orange" | "line";
	size?: "md" | "sm";
	arrow?: "right" | "up" | "none";
	className?: string;
	external?: boolean;
	cursor?: string;
};

export default function Button({ href, children, variant = "orange", size = "md", arrow = "right", className = "", external, cursor }: Props) {
	const Icon = arrow === "up" ? ArrowUpRight : ArrowRight;
	const cls = `btn-x ${variant === "orange" ? "btn-orange" : "btn-line"} ${size === "sm" ? "btn-sm" : ""} ${className}`;
	const inner = (
		<>
			<span className="btn-fill" aria-hidden />
			<span className="relative">{children}</span>
			{arrow !== "none" && (
				<span className="btn-arrow" aria-hidden>
					<span><Icon size={18} strokeWidth={2} /></span>
					<span><Icon size={18} strokeWidth={2} /></span>
				</span>
			)}
		</>
	);
	if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:"))
		return <a href={href} className={cls} data-magnetic="0.22" data-cursor={cursor} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>{inner}</a>;
	return <Link href={href} className={cls} data-magnetic="0.22" data-cursor={cursor}>{inner}</Link>;
}
