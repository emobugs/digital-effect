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
	metadataBase: new URL("https://digitaleffect.bg"),
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
		"маркетинг агенция България",
		"уеб дизайн",
		"реклама facebook",
	],
	authors: [{ name: "Digital Effect" }],
	alternates: {
		canonical: "https://digitaleffect.bg",
	},
	openGraph: {
		title: "Digital Effect — Дигитален Маркетинг за Реален Растеж",
		description: "Изграждаме система, не просто публикации.",
		url: "https://digitaleffect.bg",
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
	twitter: {
		card: "summary_large_image",
		title: "Digital Effect — Дигитален Маркетинг за Реален Растеж",
		description: "Изграждаме система, не просто публикации.",
		images: ["/og-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "ProfessionalService",
	name: "Digital Effect",
	url: "https://digitaleffect.bg",
	logo: "https://digitaleffect.bg/logo.png",
	description:
		"Дигитална маркетинг агенция — управление на социални мрежи, уеб дизайн и разработка, платена реклама и дигитална стратегия.",
	email: "hello@digitaleffect.bg",
	areaServed: "BG",
	availableLanguage: "Bulgarian",
	serviceType: [
		"Дигитален Маркетинг",
		"Управление на Социални Мрежи",
		"Уеб Дизайн",
		"Уеб Разработка",
		"Meta Ads",
		"SEO",
	],
	sameAs: [
		"https://www.facebook.com/digitalleffect/",
		"https://www.instagram.com/digital.effect.bg",
	],
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
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<Cursor />
				{children}
			</body>
		</html>
	);
}
