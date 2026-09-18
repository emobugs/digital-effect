import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Competitor Radar — кой рекламира във Вашия град | Digital Effect",
	description: "Въведете град и ниша: виждате колко от конкурентите Ви рекламират във Facebook и Google, кой има сайт и Pixel и къде сте Вие в класирането по отзиви. Безплатно.",
	alternates: { canonical: "https://digitaleffect.bg/radar" },
	openGraph: { title: "Competitor Radar — Digital Effect", description: "Кой във Вашия град вече рекламира онлайн — и къде сте Вие.", url: "https://digitaleffect.bg/radar", type: "website" },
};

export default function RadarLayout({ children }: { children: React.ReactNode }) {
	return children;
}
