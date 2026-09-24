// ── /kontakti — NAP (буква по буква като в Google профила), форма, карта ──────
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Breadcrumbs, JsonLd } from "@/components/ui/bits";
import { ContactForm } from "@/components/ui/Forms";
import Button from "@/components/ui/Button";
import { pageMeta } from "@/lib/meta";
import { webPageSchema, ORG_ID } from "@/lib/schema";
import { SITE, telHref } from "@/lib/site";

export const metadata: Metadata = pageMeta({
	title: "Контакти — Digital Effect, Силистра",
	description: "Свържете се с Digital Effect: имейл, телефон и форма. Отговаряме до 1 работен ден. Силистра, работим с бизнеси от цяла България.",
	path: "/kontakti",
	ogTitle: "Да поговорим",
	eyebrow: "Контакти",
});

export default function Contacts() {
	const map = `https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&z=14&output=embed`;
	return (
		<main id="main" className="relative z-10">
			<JsonLd data={webPageSchema({ url: `${SITE.url}/kontakti`, name: "Контакти", type: "ContactPage" })} />
			<section data-stage="3" className="relative pb-24 pt-36">
				<div className="wrap">
					<Breadcrumbs items={[{ name: "Контакти", href: "/kontakti" }]} />
					<h1 className="display t-1 max-w-[12ch]"><span className="rise"><span>Да <span className="text-gradient">поговорим</span></span></span></h1>
					<div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
						<div className="space-y-4">
							<a href={`mailto:${SITE.email}`} className="card card-spot flex items-center gap-4 p-5"><Mail className="text-[#f26522]" /><span><span className="block text-[12px] uppercase tracking-[0.18em] text-[var(--dim)]">Имейл</span><span className="text-[17px]">{SITE.email}</span></span></a>
							{SITE.phone && <a href={telHref(SITE.phone)} className="card card-spot flex items-center gap-4 p-5"><Phone className="text-[#f26522]" /><span><span className="block text-[12px] uppercase tracking-[0.18em] text-[var(--dim)]">Телефон</span><span className="text-[17px]">{SITE.phone}</span></span></a>}
							<div className="card flex items-center gap-4 p-5"><MapPin className="text-[#f26522]" /><span><span className="block text-[12px] uppercase tracking-[0.18em] text-[var(--dim)]">Адрес</span><span className="text-[17px]">{SITE.address.street ? `${SITE.address.street}, ` : ""}{SITE.address.postalCode} {SITE.address.city}</span></span></div>
							<div className="card flex items-center gap-4 p-5"><Clock className="text-[#f26522]" /><span><span className="block text-[12px] uppercase tracking-[0.18em] text-[var(--dim)]">Работно време</span><span className="text-[17px]">Понеделник – петък, 9:00 – 18:00</span></span></div>
							<div className="pt-2"><Button href="/hello" variant="line">Или анкетата — оферта за 2 минути</Button></div>
							<div className="card overflow-hidden" data-itemid={ORG_ID}>
								<iframe title="Digital Effect на картата" src={map} loading="lazy" className="h-[260px] w-full grayscale invert-[.9] contrast-[.9]" referrerPolicy="no-referrer-when-downgrade" />
							</div>
						</div>
						<div className="card bg-[#0c0d10]/85 p-6 backdrop-blur md:p-8"><ContactForm source="/kontakti" /></div>
					</div>
				</div>
			</section>
		</main>
	);
}
