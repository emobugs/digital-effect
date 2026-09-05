import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Партньорска програма — Digital Effect",
	description: "Познавате собственици на бизнес? Препоръчайте Digital Effect и получавате до 18 % от месечния договор на всеки доведен клиент, 12 месеца.",
	alternates: { canonical: "https://digitaleffect.bg/partners" },
	openGraph: {
		title: "Digital Effect Partners",
		description: "Препоръчвате. Ние работим. Вие получавате процент — 12 месеца.",
		url: "https://digitaleffect.bg/partners",
		type: "website",
	},
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
	return children;
}
