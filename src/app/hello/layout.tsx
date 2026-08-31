import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Digital Effect — Growth Score",
	description: "Къде губите клиенти онлайн? Пет стъпки, около четири минути — и получавате оценка на дигиталното си състояние.",
	robots: { index: false, follow: false },
	alternates: { canonical: "https://digitaleffect.bg/hello" },
};

export default function HelloLayout({ children }: { children: React.ReactNode }) {
	return children;
}
