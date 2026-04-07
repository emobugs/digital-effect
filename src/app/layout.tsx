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
		url: "https://digital-effect.vercel.app/",
		siteName: "Digital Effect",
		locale: "bg_BG",
		type: "website",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Digital Effect — Дигитален Маркетинг за Реален Растеж",
			},
		],
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="bg" className={`${inter.variable} ${montserrat.variable}`}>
			<link rel="icon" href="/favicon.ico" sizes="any" />
			<link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
			<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
			<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
			<link rel="manifest" href="/site.webmanifest" />
			<body>
				<Cursor />
				{children}
			</body>
		</html>
	);
}
