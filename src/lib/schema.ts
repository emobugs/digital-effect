// ═══════════════════════════════════════════════════════════════════════════
// Structured data (schema.org) — фактите за агенцията, които Google, Bing и
// AI търсачките четат директно. Всичко идва от SITE и от ценоразписа — цена
// в схемата = цена на страницата (иначе Google игнорира/наказва).
// ═══════════════════════════════════════════════════════════════════════════
import { SITE, sameAs } from "@/lib/site";
import { fromPrice, type PublicService } from "@/lib/services";

export const ORG_ID = `${SITE.url}/#organization`;
export const SITE_ID = `${SITE.url}/#website`;
export const FOUNDER_ID = `${SITE.url}/za-nas#founder`;

export function organizationGraph() {
	const address = {
		"@type": "PostalAddress",
		...(SITE.address.street ? { streetAddress: SITE.address.street } : {}),
		addressLocality: SITE.address.city,
		postalCode: SITE.address.postalCode,
		addressRegion: SITE.address.region,
		addressCountry: SITE.address.country,
	};
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": ["Organization", "ProfessionalService"],
				"@id": ORG_ID,
				name: SITE.name,
				legalName: SITE.legalName,
				url: SITE.url,
				logo: { "@type": "ImageObject", url: `${SITE.url}/logo-512.png`, width: 512, height: 490 },
				image: `${SITE.url}/opengraph-image`,
				description: SITE.description,
				slogan: SITE.tagline,
				email: SITE.email,
				...(SITE.phone ? { telephone: SITE.phone } : {}),
				...(SITE.eik ? { taxID: SITE.eik } : {}),
				address,
				geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
				openingHours: SITE.hours,
				priceRange: "€€",
				currenciesAccepted: "EUR",
				areaServed: SITE.areaServed.map((n) => (n === "България" ? { "@type": "Country", name: "България" } : { "@type": "City", name: n })),
				founder: { "@id": FOUNDER_ID },
				knowsAbout: ["Facebook реклама", "Instagram реклама", "Google Ads", "Performance Max", "управление на социални мрежи", "изработка на сайтове", "Next.js", "SEO", "AI чатботове", "автоматизация на бизнес процеси", "CRM"],
				knowsLanguage: ["bg", "en"],
				sameAs: sameAs(),
				contactPoint: {
					"@type": "ContactPoint",
					contactType: "sales",
					email: SITE.email,
					...(SITE.phone ? { telephone: SITE.phone } : {}),
					availableLanguage: ["Bulgarian", "English"],
					areaServed: "BG",
				},
			},
			{
				"@type": "Person",
				"@id": FOUNDER_ID,
				name: SITE.founder.name,
				jobTitle: SITE.founder.role,
				worksFor: { "@id": ORG_ID },
				...(SITE.founder.image ? { image: `${SITE.url}${SITE.founder.image}` } : {}),
				...(SITE.founder.linkedin ? { sameAs: [SITE.founder.linkedin] } : {}),
			},
			{
				"@type": "WebSite",
				"@id": SITE_ID,
				url: SITE.url,
				name: SITE.name,
				inLanguage: "bg-BG",
				publisher: { "@id": ORG_ID },
			},
		],
	};
}

/** Offer от услуга в ценоразписа — с UnitPriceSpecification при месечни цени. */
export function offerOf(s: PublicService, url: string) {
	const price = fromPrice(s);
	if (price == null) return null;
	return {
		"@type": "Offer",
		name: s.name,
		description: s.description,
		url,
		priceCurrency: "EUR",
		price,
		...(s.priceMax ? { priceSpecification: { "@type": "PriceSpecification", minPrice: price, maxPrice: s.priceMax, priceCurrency: "EUR" } } : {}),
		...(s.price.monthly ? { priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "EUR", unitText: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" } } } : {}),
		availability: "https://schema.org/InStock",
		seller: { "@id": ORG_ID },
	};
}

export function serviceSchema(opts: { name: string; description?: string; url: string; serviceType: string; services: PublicService[]; areaServed?: string }) {
	const offers = opts.services.map((s) => offerOf(s, opts.url)).filter(Boolean);
	return {
		"@context": "https://schema.org",
		"@type": "Service",
		"@id": `${opts.url}#service`,
		name: opts.name,
		serviceType: opts.serviceType,
		description: opts.description,
		url: opts.url,
		provider: { "@id": ORG_ID },
		areaServed: opts.areaServed ? { "@type": "City", name: opts.areaServed } : { "@type": "Country", name: "България" },
		...(offers.length ? { hasOfferCatalog: { "@type": "OfferCatalog", name: opts.name, itemListElement: offers } } : {}),
	};
}

export function webPageSchema(opts: { url: string; name: string; description?: string; updated?: string | null; type?: string }) {
	return {
		"@context": "https://schema.org",
		"@type": opts.type || "WebPage",
		"@id": `${opts.url}#webpage`,
		url: opts.url,
		name: opts.name,
		description: opts.description,
		inLanguage: "bg-BG",
		isPartOf: { "@id": SITE_ID },
		about: { "@id": ORG_ID },
		...(opts.updated ? { dateModified: opts.updated } : {}),
		speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[aria-label='Накратко'] p"] },
	};
}
