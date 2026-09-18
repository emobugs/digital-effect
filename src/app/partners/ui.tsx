"use client";

// ── Общи UI атоми за /partners, /partners/me, /partners/terms ───────────────
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageFrame from "@/components/layout/PageFrame";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
export const INPUT = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-gray-100 placeholder:text-gray-600 outline-none transition focus:border-brand-orange-l/50 focus:shadow-[0_0_0_3px_rgba(242,101,34,0.12)]";
export const BTN = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] hover:shadow-[0_0_34px_rgba(242,101,34,.4)] transition disabled:opacity-50 disabled:shadow-none";
export const BTN_GHOST = "inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-[15px] text-gray-200 border border-white/15 hover:border-white/30 transition";

export function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
	const pathname = usePathname();
	const tabs = [["/partners", "Програма"], ["/partners/me", "Кабинет"], ["/partners/terms", "Условия"]] as const;
	return (
		<PageFrame>
			<div className={cx("relative w-full mx-auto px-4 py-8 sm:py-14", wide ? "max-w-3xl" : "max-w-2xl")}>
				<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
					<div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[70px] opacity-60" style={{ background: "radial-gradient(circle, rgba(242,101,34,.16) 0%, transparent 65%)" }} />
					<div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blur-[70px] opacity-60" style={{ background: "radial-gradient(circle, rgba(245,156,26,.12) 0%, transparent 65%)" }} />
				</div>
				{pathname?.startsWith("/partners") && (
					<nav className="relative flex gap-1 mb-6 rounded-full bg-white/5 p-1 w-fit">
						{tabs.map(([href, label]) => (
							<Link key={href} href={href} className={cx("px-4 py-1.5 rounded-full text-xs font-semibold transition", pathname === href ? "bg-brand-grad text-white" : "text-white/50 hover:text-white/80")}>{label}</Link>
						))}
					</nav>
				)}
				<div className="relative space-y-6">{children}</div>
			</div>
		</PageFrame>
	);
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
	return <div className={cx("rounded-2xl border border-white/10 bg-dark-surface/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,.6)]", className)}>{children}</div>;
}

export function Kicker({ children }: { children: React.ReactNode }) {
	return <div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-brand-orange-l mb-3">{children}</div>;
}

export function H2({ children }: { children: React.ReactNode }) {
	return <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight mb-3">{children}</h2>;
}

export function Note({ children }: { children: React.ReactNode }) {
	return <p className="text-gray-400 text-[15px] leading-relaxed">{children}</p>;
}
