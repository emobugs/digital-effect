// ── Footer: контакти (NAP), всички важни връзки и голямото „EFFECT“ ─────────
// NAP-ът тук трябва да съвпада буква по буква с Google профила.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SITE, NAV, telHref } from "@/lib/site";
import Wordmark from "./Wordmark";

const COLS = [
	{
		title: "Услуги",
		links: [
			{ label: "Facebook и Instagram реклама", href: "/uslugi/reklama/facebook-instagram" },
			{ label: "Google реклама", href: "/uslugi/reklama/google-ads" },
			{ label: "Социални мрежи", href: "/uslugi/socialni-mrezhi" },
			{ label: "Изработка на сайт", href: "/uslugi/izrabotka-na-sait" },
			{ label: "Поддръжка на сайт", href: "/uslugi/izrabotka-na-sait/poddrazhka" },
			{ label: "AI и автоматизация", href: "/uslugi/ai-avtomatizacia" },
			{ label: "AI чатбот", href: "/uslugi/ai-avtomatizacia/chatbot" },
			{ label: "Growth Partner", href: "/uslugi/growth-partner" },
		],
	},
	{
		title: "За кого",
		links: [
			{ label: "Хотели", href: "/za/hoteli" },
			{ label: "Строителни фирми", href: "/za/stroitelni-firmi" },
			{ label: "Онлайн магазини", href: "/za/online-magazini" },
			{ label: "Клиники", href: "/za/kliniki" },
			{ label: "Силистра", href: "/marketing-agencia/silistra" },
		],
	},
	{
		title: "Агенцията",
		links: [
			{ label: "Цени", href: "/ceni" },
			{ label: "Резултати", href: "/rezultati" },
			{ label: "Безплатни ресурси", href: "/resursi" },
			{ label: "Competitor Radar", href: "/radar" },
			{ label: "Знание", href: "/znanie" },
			{ label: "За нас", href: "/za-nas" },
			{ label: "Партньорска програма", href: "/partners" },
			{ label: "Контакти", href: "/kontakti" },
		],
	},
];

export default function Footer() {
	const year = new Date().getFullYear();
	const social = Object.entries(SITE.social).filter(([k, v]) => v && !["googleBusiness", "clutch"].includes(k));
	return (
		<footer className="relative z-10 overflow-hidden border-t border-white/[0.07] bg-[#050506] pb-28 pt-20 lg:pb-10">
			<div className="wrap">
				<div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
					<div>
						<p className="font-display text-[28px] font-black leading-[1.05] tracking-[-0.02em]">Всяко евро<br /><span className="text-gradient">да работи.</span></p>
						<p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--muted)]">{SITE.description}</p>
						<address className="mt-8 space-y-1.5 text-[15px] not-italic text-[var(--text)]/85">
							<div className="font-semibold">{SITE.name}</div>
							<div className="text-[var(--muted)]">{SITE.address.street ? `${SITE.address.street}, ` : ""}{SITE.address.postalCode} {SITE.address.city}, България</div>
							{SITE.phone && <div><a href={telHref(SITE.phone)} className="hover:text-[#f5813a]">{SITE.phone}</a></div>}
							<div><a href={`mailto:${SITE.email}`} className="hover:text-[#f5813a]">{SITE.email}</a></div>
						</address>
						<div className="mt-6 flex flex-wrap gap-2">
							{social.map(([k, v]) => (
								<a key={k} href={v} target="_blank" rel="noopener me" className="chip hover:text-white">{k === "facebook" ? "Facebook" : k === "instagram" ? "Instagram" : k === "linkedin" ? "LinkedIn" : k === "tiktok" ? "TikTok" : "YouTube"}<ArrowUpRight size={12} /></a>
							))}
						</div>
					</div>
					{COLS.map((c) => (
						<div key={c.title}>
							<h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--dim)]">{c.title}</h2>
							<ul className="space-y-2.5">
								{c.links.map((l) => (
									<li key={l.href}><Link href={l.href} className="text-[15px] text-[var(--muted)] transition-colors hover:text-white">{l.label}</Link></li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			<Wordmark />

			<div className="wrap mt-6 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-[13px] text-[var(--dim)] md:flex-row md:items-center md:justify-between">
				<span>© {year} {SITE.legalName}{SITE.eik ? ` · ЕИК ${SITE.eik}` : ""} · {SITE.address.city}</span>
				<span className="flex gap-5">
					<Link href="/privacy" className="hover:text-white">Поверителност</Link>
					<Link href="/partners/terms" className="hover:text-white">Условия за партньори</Link>
					<Link href={NAV.cta.href} className="hover:text-white">Вземи оферта</Link>
				</span>
			</div>
		</footer>
	);
}
