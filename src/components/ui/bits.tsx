// ── Малки градивни елементи (server components) ─────────────────────────────
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { SITE } from "@/lib/site";

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <span className={`eyebrow ${className}`}>{children}</span>;
}

/** JSON-LD — структурираните данни за Google и AI търсачките. */
export function JsonLd({ data }: { data: object | object[] }) {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
	const all = [{ name: "Начало", href: "/" }, ...items];
	return (
		<>
			<nav aria-label="Навигационна пътека" className="mb-8 text-[13px] text-[var(--dim)]">
				<ol className="flex flex-wrap items-center gap-1.5">
					{all.map((it, i) => (
						<li key={it.href} className="flex items-center gap-1.5">
							{i > 0 && <ChevronRight size={13} className="opacity-50" aria-hidden />}
							{i === all.length - 1 ? <span aria-current="page" className="text-[var(--muted)]">{it.name}</span> : <Link href={it.href} className="hover:text-white transition-colors">{it.name}</Link>}
						</li>
					))}
				</ol>
			</nav>
			<JsonLd data={{
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE.url}${it.href === "/" ? "" : it.href}` })),
			}} />
		</>
	);
}

/** ЧЗВ — <details>, за да е в HTML-а и без JS; FAQPage schema за AI търсачките. */
export function Faq({ items, withSchema = true, className = "" }: { items: { q: string; a: string }[]; withSchema?: boolean; className?: string }) {
	if (!items?.length) return null;
	return (
		<div className={className}>
			<div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
				{items.map((f, i) => (
					<details key={i} className="group py-1" {...(i === 0 ? { open: true } : {})}>
						<summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
							<h3 className="font-display text-[clamp(17px,1.5vw,21px)] font-bold leading-snug tracking-[-0.01em] text-[var(--text)] transition-colors group-hover:text-[#f5813a]">{f.q}</h3>
							<span className="mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-white/15 transition-transform duration-500 group-open:rotate-45 group-open:border-[#f26522] group-open:text-[#f26522]"><Plus size={16} /></span>
						</summary>
						<p className="max-w-3xl pb-6 pr-12 text-[16px] leading-[1.75] text-[var(--muted)]">{f.a}</p>
					</details>
				))}
			</div>
			{withSchema && <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />}
		</div>
	);
}

/** „Накратко“ — абзацът, който AI търсачките цитират. */
export function Summary({ text, updated }: { text?: string; updated?: string | null }) {
	if (!text) return null;
	return (
		<aside className="card relative max-w-4xl p-6 md:p-8" aria-label="Накратко">
			<div className="mb-3 flex items-center justify-between gap-4">
				<span className="eyebrow">Накратко</span>
				{updated && <time dateTime={updated} className="text-[12px] text-[var(--dim)]">Обновено {new Date(updated).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" })}</time>}
			</div>
			<p className="text-[17px] leading-[1.75] text-[var(--text)]/90 md:text-[18px]">{text}</p>
		</aside>
	);
}

export function SectionHead({ eyebrow, title, text, align = "left", className = "" }: { eyebrow?: string; title: React.ReactNode; text?: React.ReactNode; align?: "left" | "center"; className?: string }) {
	return (
		<div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-4xl ${className}`}>
			{eyebrow && <div data-reveal className="mb-6"><Eyebrow>{eyebrow}</Eyebrow></div>}
			<h2 data-reveal style={{ ["--d" as string]: "0.05s" }} className="display t-2 text-balance">{title}</h2>
			{text && <p data-reveal style={{ ["--d" as string]: "0.12s" }} className={`lead mt-6 max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>{text}</p>}
		</div>
	);
}
