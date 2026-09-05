import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAM, pct, eur } from "../program";

export const metadata: Metadata = {
	title: "Условия на партньорската програма — Digital Effect",
	robots: { index: false, follow: true },
};

// ⚠ Чернова за преглед от Емил (и счетоводител/юрист) преди публикуване.
export default function PartnersTermsPage() {
	const tiers = [...PROGRAM.tiers].sort((a, b) => a.min - b.min);
	return (
		<main className="min-h-screen bg-dark-obsidian text-gray-200">
			<div className="max-w-2xl mx-auto px-4 py-14">
				<Link href="/" className="font-display font-black tracking-tight text-lg">Digital<span className="text-brand-orange-l">Effect</span></Link>
				<h1 className="font-display font-black text-3xl tracking-tight mt-8 mb-2">Условия на партньорската програма</h1>
				<p className="text-gray-500 text-sm mb-8">Digital Effect Partners · в сила от 04.09.2026 г.</p>

				<div className="space-y-6 text-[15px] leading-relaxed text-gray-300">
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">1. Какво е програмата</h2>
						<p>Digital Effect Partners е реферална програма: партньорът препоръчва Digital Effect на бизнеси, а Digital Effect изплаща на партньора процент от приходите си от клиентите, които той е довел. Партньорът не е служител, търговски представител или подизпълнител на Digital Effect и не поема ангажименти от наше име.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">2. Кой е „доведен клиент“</h2>
						<p>Бизнес, който (а) е попълнил анкетата на digitaleffect.bg/hello през линка или QR-а с кода на партньора, или (б) е представен от партньора лично и е записан от Digital Effect към него до {PROGRAM.manualLeadDays} дни от първия контакт. Клиентът трябва да е нов за Digital Effect — бизнес, с който вече сме в контакт или сме работили, не се брои. При два кода за един клиент важи първият.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">3. Комисионна при месечни договори</h2>
						<p>Базата е месечната стойност на договора с клиента без ДДС и без рекламния бюджет (сумите за Meta, Google и други платформи не са приход на Digital Effect). Процентът зависи от броя активни клиенти на партньора през съответния месец: {tiers.map((t, i) => `${t.min}${i === tiers.length - 1 ? "+" : ""} → ${pct(t.rate)}`).join(", ")}. Нивото се определя всеки месец наново и важи за всички активни клиенти на партньора. Комисионна се дължи само за месеци, в които клиентът реално е платил. Срокът е {PROGRAM.months} месеца от първото плащане на всеки клиент.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">4. Комисионна при еднократни проекти</h2>
						<p>За еднократни проекти (сайт, брандинг, автоматизация) комисионната е еднократна и зависи от стойността на проекта без ДДС: {PROGRAM.projectTiers.map((t, i, arr) => (t.max == null ? `над ${eur(arr[i - 1].max!)} → ${pct(t.rate)}` : `до ${eur(t.max)} → ${pct(t.rate)}`)).join(", ")}. Дължи се след получено плащане от клиента.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">5. Партньор, довел партньор</h2>
						<p>Ако партньор А доведе партньор Б (регистрация през линка на А), А получава {pct(PROGRAM.level2Rate)} от базата на всеки клиент, доведен от Б, за същия срок. Това е едно ниво: А не получава нищо от клиентите на партньори, доведени от Б. Комисионната на Б не се намалява.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">6. Изплащане</h2>
						<p>Начисляваме в началото на всеки месец за предходния и изплащаме до {PROGRAM.payoutDay}-то число, когато натрупаната сума е поне {eur(PROGRAM.minPayout)}; по-малки суми се прехвърлят към следващия месец. Изплащането е по банков път срещу документ (фактура от фирмата на партньора или договор с физическо лице — според статута му) или, по избор на партньора, като кредит срещу услуга на Digital Effect за самия него с {pct(PROGRAM.creditBonus)} бонус върху сумата. Партньор, който е и клиент на Digital Effect, по подразбиране получава кредит; може да избере банков превод по всяко време от кабинета си.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">7. Кога спира комисионната</h2>
						<p>Когато клиентът прекрати договора си, спре да плаща или изтекат {PROGRAM.months}-те месеца. Ако клиентът поднови след пауза, срокът не започва отначало. Партньор, който подвежда клиенти, обещава от името на Digital Effect или регистрира фиктивни бизнеси, се изключва от програмата и губи неизплатените суми.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">8. Данни и поверителност</h2>
						<p>Партньорът вижда в кабинета си само имената на доведените бизнеси, статуса им и собствените си начисления — не и условията по договорите на клиентите. Клиентът вижда на първия екран на анкетата, че е препоръчан от партньора. Личните данни на партньора се обработват по <Link href="/privacy" className="underline text-brand-orange-l">политиката ни за поверителност</Link>. Кодът на партньора се пази в браузъра на клиента до {PROGRAM.attributionDays} дни, за да се брои и по-късно попълване.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">9. Промени и прекратяване</h2>
						<p>Digital Effect може да променя процентите и условията с 30-дневно предизвестие в кабинета и по имейл; вече начислените суми не се променят. Всяка страна може да прекрати участието по всяко време; дължимите до момента суми се изплащат по реда на т. 6.</p>
					</section>
					<section>
						<h2 className="font-semibold text-gray-100 mb-1">10. Контакт</h2>
						<p>Digital Effect, гр. Силистра · partners@digitaleffect.bg</p>
					</section>
				</div>
			</div>
		</main>
	);
}
