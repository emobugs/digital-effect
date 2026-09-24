// ═══════════════════════════════════════════════════════════════════════════
// Начална страница — „Ядрото“.
// Етапите на 3D сцената: 0 hero → 1 системата (разтваряне) → 2 пътят на
// клиента (модулите в линия) → 3 фон за останалото. Цените — от de-os.
// ═══════════════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Ticker from "@/components/home/Ticker";
import System from "@/components/home/System";
import Journey from "@/components/home/Journey";
import CaseStack from "@/components/home/CaseStack";
import Configurator from "@/components/home/Configurator";
import { PricingTeaser, Guarantee, Difference, ResourcesStrip, Process } from "@/components/home/Sections";
import CtaBand from "@/components/ui/CtaBand";
import { Faq, SectionHead, JsonLd } from "@/components/ui/bits";
import Button from "@/components/ui/Button";
import { getCatalog, configPrices } from "@/lib/services";
import { getSiteContent } from "@/lib/content";
import { CASES } from "@/data/cases";
import { webPageSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
	title: "Digital Effect — дигитална маркетинг агенция | Реклама, сайтове, AI",
	description: "Facebook, Instagram и Google реклама, социални мрежи, сайтове и AI автоматизация като една система, която носи запитвания. Цените са на сайта. Първи месец без риск.",
	alternates: { canonical: "/" },
};

const FAQ = [
	{ q: "Какво прави Digital Effect?", a: "Дигитална маркетинг агенция от Силистра: реклама във Facebook, Instagram и Google, управление на социални мрежи, изработка на сайтове и AI автоматизация (чатботове, CRM, автоматизации) за бизнеси в цяла България." },
	{ q: "Колко струва работата с вас?", a: "Рекламата е от €170/мес. (€150 + стъпаловиден % от бюджета), социалните мрежи — от €199/мес., сайтовете — от €449 еднократно, AI чатбот — от €290. Цялата система (Growth Partner) е €790/мес. Всички цени са на страницата „Цени“." },
	{ q: "Работите ли само с бизнеси от Силистра?", a: "Не. Седалището ни е в Силистра, но работим с клиенти от цяла България — Русе, Добрич, Варна, София — и онлайн." },
	{ q: "Какво става, ако няма резултат?", a: "Първият месец е пилотен. Договаряме един измерим критерий преди старта; ако не го постигнем за 30 дни, не плащате таксата ни за месеца." },
	{ q: "На чие име са рекламните акаунти?", a: "На ваше. Рекламният акаунт, пикселът, аудиториите и профилите остават ваша собственост, а бюджетът се плаща директно към Meta и Google от вашата карта." },
	{ q: "Колко бързо започвате?", a: "Обикновено до 5 работни дни след разговора — толкова отнема setup-ът на кампаниите и проследяването." },
];

export default async function Home() {
	const [catalog, content] = await Promise.all([getCatalog(false), getSiteContent()]);
	const resources = content.resources.filter((r) => r.data.homepage).slice(0, 4);
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={webPageSchema({ url: SITE.url, name: "Digital Effect — дигитална маркетинг агенция", description: SITE.description })} />
			<Hero catalog={catalog} />
			<Ticker />
			<System catalog={catalog} />
			<Journey />

			<section data-stage="3" className="section relative">
				<div className="wrap">
					<div className="flex flex-wrap items-end justify-between gap-6">
						<SectionHead eyebrow="Резултати" title={<>Числа, <span className="text-gradient">не обещания</span></>} />
						<div data-reveal><Button href="/rezultati" variant="line">Всички кейсове</Button></div>
					</div>
					<div className="mt-14"><CaseStack cases={CASES.slice(0, 4)} /></div>
				</div>
			</section>

			<Configurator prices={configPrices(catalog)} />
			<PricingTeaser catalog={catalog} />
			<Guarantee headline={catalog.pilot?.headline} text={catalog.pilot?.text} />
			<Difference />
			<ResourcesStrip resources={resources} />
			<Process />

			<section data-stage="3" className="section relative">
				<div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
					<SectionHead eyebrow="Въпроси" title={<>Честно <span className="text-gradient">питани</span></>} />
					<Faq items={FAQ} />
				</div>
			</section>

			<CtaBand source="home" />
		</main>
	);
}
