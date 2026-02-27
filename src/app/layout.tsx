import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/Cursor";

const inter = Inter({
	subsets: ["latin", "cyrillic"],
	variable: "--font-inter",
	display: "swap",
});

const montserrat = Montserrat({
	subsets: ["latin", "cyrillic"],
	variable: "--font-montserrat",
	weight: ["200", "300", "400", "600", "700", "900"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Digital Effect — Дигитален Маркетинг за Реален Растеж",
	description:
		"Управление на социални мрежи, видео съдържание и дигитална стратегия за малки и средни бизнеси. Facebook, Instagram, TikTok.",
	keywords: [
		"дигитален маркетинг",
		"социални мрежи",
		"facebook управление",
		"instagram маркетинг",
		"tiktok",
		"digital effect",
		"маркетинг агенция",
	],
	authors: [{ name: "Digital Effect" }],
	openGraph: {
		title: "Digital Effect — Дигитален Маркетинг за Реален Растеж",
		description: "Изграждаме система, не просто публикации.",
		url: "https://digitaleffect.bg",
		siteName: "Digital Effect",
		locale: "bg_BG",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="bg" className={`${inter.variable} ${montserrat.variable}`}>
			<body>
				<Cursor />
				{children}
			</body>
		</html>
	);
}
