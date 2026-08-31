import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Политика за поверителност — Digital Effect",
	robots: { index: false, follow: true },
};

// ⚠ Чернова за преглед от Емил/юрист преди публикуване. Покрива формите на
//    сайта (контакт + /hello). Датата и адресът са за попълване.
export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-dark-obsidian text-gray-200">
			<div className="max-w-2xl mx-auto px-4 py-14">
				<Link href="/" className="font-display font-black tracking-tight text-lg">Digital<span className="text-brand-orange-l">Effect</span></Link>
				<h1 className="font-display font-black text-3xl tracking-tight mt-8 mb-2">Политика за поверителност</h1>
				<p className="text-gray-500 text-sm mb-8">Последна промяна: 30.08.2026 г.</p>

				<div className="space-y-6 text-[15px] leading-relaxed text-gray-300">
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Кой обработва данните</h2>
						<p>Digital Effect, гр. Силистра, имейл: contacts@digitaleffect.bg. Ние сме администратор на личните данни, които ни предоставяте през този сайт.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Какви данни събираме</h2>
						<p>Чрез контактната форма: име, имейл и съобщение. Чрез анкетата на /hello: име, телефон и/или имейл, име и бранш на бизнеса, и отговорите Ви за онлайн присъствието, целите и бюджета. Записваме и технически данни — IP адрес, браузър, страница източник и време за попълване — за защита от злоупотреби.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Защо ги обработваме</h2>
						<p>За да отговорим на запитването Ви и да подготвим предложение за Вашия бизнес. Отговорите от анкетата се оценяват, за да преценим кой от нашите подходи е подходящ за Вас и с какъв приоритет да се свържем. Тази оценка е вътрешна, служи само за организация на нашата работа и не поражда правни последици за Вас. Основание: легитимен интерес (чл. 6, ал. 1, б. „е“ от GDPR) и предприемане на стъпки преди сключване на договор по Ваше искане (б. „б“).</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Кой има достъп</h2>
						<p>Само екипът на Digital Effect. Използваме доставчици на техническа инфраструктура (хостинг, изпращане на имейли), които обработват данните от наше име по договор. Не продаваме и не предоставяме данните на трети страни за техни цели.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Колко време ги пазим</h2>
						<p>Запитвания и отговори от анкетата — до 24 месеца от получаването им, освен ако не започнем работа заедно, при което данните стават част от клиентското досие. Можете да поискате изтриване по-рано.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Вашите права</h2>
						<p>Имате право на достъп, коригиране, изтриване, ограничаване на обработването, възражение и преносимост. Пишете на contacts@digitaleffect.bg. Имате право и на жалба до Комисията за защита на личните данни (cpdp.bg).</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">Бисквитки</h2>
						<p>Сайтът не използва рекламни или проследяващи бисквитки. Технически необходимите данни за работата на формите не се съхраняват в браузъра Ви.</p>
					</section>
				</div>
			</div>
		</main>
	);
}
