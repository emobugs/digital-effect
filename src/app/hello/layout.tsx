import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Digital Effect — Hello 👋",
	description: "Да опознаем Вашия бранд — 8 бързи нива, под 2 минути.",
	robots: { index: false, follow: false },
	alternates: { canonical: "https://digitaleffect.bg/hello" },
};

export default function HelloLayout({ children }: { children: React.ReactNode }) {
	return children;
}
