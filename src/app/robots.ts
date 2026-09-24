// ── /robots.txt — всички търсачки и AI ботове са добре дошли на публичните страници
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PRIVATE = ["/api/", "/oferta/", "/partners/me", "/hello"];
// Изрично изброени AI и търсещи ботове — някои CDN/хостинги ги блокират по подразбиране.
const BOTS = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "Applebot-Extended", "DuckDuckBot", "YandexBot", "Meta-ExternalAgent", "CCBot"];

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			...BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
			{ userAgent: "*", allow: "/", disallow: PRIVATE },
		],
		sitemap: `${SITE.url}/sitemap.xml`,
		host: SITE.url,
	};
}
