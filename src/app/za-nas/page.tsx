// ── /za-nas — кои сме (E-E-A-T: реален човек, реален град, реална система) ────
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs, JsonLd, SectionHead } from "@/components/ui/bits";
import CtaBand from "@/components/ui/CtaBand";
import Button from "@/components/ui/Button";
import { pageMeta } from "@/lib/meta";
import { webPageSchema, FOUNDER_ID, ORG_ID } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
	title: "За нас — Digital Effect, маркетинг агенция от Силистра",
	description: "Digital Effect е дигитална маркетинг агенция от Силистра, основана от Емил Тупев. Един екип за реклама, социални мрежи, сайтове и AI автоматизация.",
	path: "/za-nas",
	ogTitle: "Един екип. Една цел.",
	eyebrow: "За нас",
});

const VALUES = [
	{ t: "Числа, не обещания", d: "Мерим цена на запитване и оборот — не харесвания и обхват. Ако нещо не работи, го казваме първи." },
	{ t: "Всичко е ваше", d: "Рекламните акаунти, пикселите, профилите, домейнът и кодът са на ваше име. Винаги." },
	{ t: "Един екип", d: "Рекламата, съдържанието, сайтът и автоматизацията се правят заедно — никой не прехвърля вината." },
	{ t: "Собствени системи", d: "Работим с de-os — нашата система за лийдове, оферти, анализ на конкуренцията и съдържание. Затова сме бързи." },
];

export default function About() {
	const url = `${SITE.url}/za-nas`;
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={[
				webPageSchema({ url, name: "За Digital Effect", type: "AboutPage" }),
				{ "@context": "https://schema.org", "@type": "Person", "@id": FOUNDER_ID, name: SITE.founder.name, jobTitle: SITE.founder.role, worksFor: { "@id": ORG_ID }, homeLocation: { "@type": "City", name: SITE.address.city }, knowsAbout: ["дигитален маркетинг", "Meta реклама", "Google Ads", "уеб разработка", "Next.js", "AI автоматизация"], ...(SITE.founder.linkedin ? { sameAs: [SITE.founder.linkedin] } : {}) },
			]} />
			<section data-stage="3" className="relative pb-16 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "За нас", href: "/za-nas" }]} />
					<h1 className="display t-1 max-w-[13ch]"><span className="rise"><span>Един екип. <span className="text-gradient">Една цел.</span></span></span></h1>
					<p className="lead fade-up mt-7 max-w-2xl" style={{ ["--d" as string]: "0.3s" }}>Digital Effect е дигитална маркетинг агенция от Силистра. Правим реклама, социални мрежи, сайтове и AI автоматизация за бизнеси от цяла България — и отговаряме за едно число: колко клиента ви носи всичко това.</p>
				</div>
			</section>
			<section className="relative pb-20">
				<div className="wrap grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
					<div data-reveal className="card relative aspect-[4/5] overflow-hidden">
						{SITE.founder.image ? (
							<Image src={SITE.founder.image} alt={SITE.founder.name} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
						) : (
							<div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_40%_35%,rgba(242,101,34,.35),transparent_60%)]">
								<span className="text-center text-[13px] uppercase tracking-[0.2em] text-[var(--dim)]">[Снимка на Емил]<br />public/team/emil.webp</span>
							</div>
						)}
					</div>
					<div id="founder" data-reveal>
						<span className="eyebrow">Основател</span>
						<h2 className="display t-2 mt-5">{SITE.founder.name}</h2>
						<p className="mt-6 text-[17px] leading-relaxed text-[var(--muted)]">[ЗА ПОПЪЛВАНЕ — 3–4 изречения от първо лице: откъде идваш, защо Digital Effect, какво правиш различно. Реалните детайли са това, което Google и AI търсачките ценят (опит, експертиза, доверие).]</p>
						<p className="mt-4 text-[17px] leading-relaxed text-[var(--muted)]">Строим собствени инструменти (de-os, Competitor Radar, Smart Reach), защото искаме да виждаме пазара с числа — и да ги покажем и на клиентите си.</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<Button href="/kontakti">Да поговорим</Button>
							{SITE.founder.linkedin && <Button href={SITE.founder.linkedin} variant="line" arrow="up" external>LinkedIn</Button>}
						</div>
					</div>
				</div>
			</section>
			<section className="section relative">
				<div className="wrap">
					<SectionHead eyebrow="Как работим" title={<>Четири правила, <span className="text-gradient">без изключения</span></>} />
					<div className="mt-14 grid gap-4 md:grid-cols-2">
						{VALUES.map((v, i) => (
							<article key={v.t} data-reveal style={{ ["--d" as string]: `${i * 0.06}s` }} className="card p-7">
								<span className="font-display text-[13px] font-black tabular text-[#f26522]">0{i + 1}</span>
								<h3 className="mt-4 font-display text-[24px] font-extrabold">{v.t}</h3>
								<p className="mt-2 text-[16px] leading-relaxed text-[var(--muted)]">{v.d}</p>
							</article>
						))}
					</div>
				</div>
			</section>
			<CtaBand source="/za-nas" />
		</main>
	);
}
