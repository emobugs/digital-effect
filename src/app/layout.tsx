import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileDock from "@/components/layout/MobileDock";
import Chrome from "@/components/layout/Chrome";
import Effects from "@/components/motion/Effects";
import Cursor from "@/components/motion/Cursor";
import EffectScene from "@/components/scene/EffectScene";
import { JsonLd } from "@/components/ui/bits";
import { organizationGraph } from "@/lib/schema";
import { SITE } from "@/lib/site";

// Шрифтовете са в репото (src/fonts, латиница + кирилица, OFL) — билдът не зависи
// от Google Fonts, а браузърът не прави заявки към трети страни.
const inter = localFont({
	variable: "--font-inter",
	display: "swap",
	src: [
		{ path: "../fonts/inter-400.woff2", weight: "400" },
		{ path: "../fonts/inter-500.woff2", weight: "500" },
		{ path: "../fonts/inter-600.woff2", weight: "600" },
		{ path: "../fonts/inter-700.woff2", weight: "700" },
	],
	fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});
const montserrat = localFont({
	variable: "--font-montserrat",
	display: "swap",
	src: [
		{ path: "../fonts/montserrat-600.woff2", weight: "600" },
		{ path: "../fonts/montserrat-800.woff2", weight: "800" },
		{ path: "../fonts/montserrat-900.woff2", weight: "900" },
	],
	fallback: ["Arial Black", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: {
		default: "Digital Effect — дигитална маркетинг агенция | Реклама, сайтове, AI",
		template: "%s",
	},
	description: SITE.description,
	applicationName: SITE.name,
	authors: [{ name: SITE.founder.name, url: `${SITE.url}/za-nas` }],
	creator: SITE.name,
	publisher: SITE.name,
	alternates: { canonical: "/" },
	openGraph: { type: "website", locale: "bg_BG", siteName: SITE.name, url: SITE.url },
	twitter: { card: "summary_large_image" },
	robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
			{ url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
	formatDetection: { telephone: false },
	other: { "msapplication-TileColor": "#07080a" },
};

export const viewport: Viewport = {
	themeColor: "#07080a",
	colorScheme: "dark",
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="bg" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
			<head>
				{/* Анимациите при скрол се включват само когато има JS — без него всичко е видимо */}
				<script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
				<link rel="preconnect" href="https://deos.digitaleffect.bg" />
			</head>
			<body className="font-sans">
				<a href="#main" className="sr-only z-[100] rounded bg-white px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Към съдържанието</a>
				<JsonLd data={organizationGraph()} />
				<EffectScene />
				<Chrome><Navbar /></Chrome>
				{children}
				<Chrome><Footer /><MobileDock /></Chrome>
				<div className="grain" aria-hidden />
				<Cursor />
				<Effects />
			</body>
		</html>
	);
}
