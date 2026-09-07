import type { Metadata } from "next";
import { loadProgram } from "@/lib/partners-program";
import { pct } from "./program";

// Описанието носи най-високия процент и срока — от de-os, за да не остане
// „до 18 %“ в Google, ако нивата се сменят от панела.
export async function generateMetadata(): Promise<Metadata> {
	const p = await loadProgram();
	const top = pct(Math.max(...p.tiers.map((t) => t.rate)));
	return {
		title: "Партньорска програма — Digital Effect",
		description: `Познавате собственици на бизнес? Препоръчайте Digital Effect и получавате до ${top} от месечния договор на всеки доведен клиент, ${p.months} месеца.`,
		alternates: { canonical: "https://digitaleffect.bg/partners" },
		openGraph: {
			title: "Digital Effect Partners",
			description: `Препоръчвате. Ние работим. Вие получавате процент — ${p.months} месеца.`,
			url: "https://digitaleffect.bg/partners",
			type: "website",
		},
	};
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
	return children;
}
