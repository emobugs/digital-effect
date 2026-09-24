// ═══════════════════════════════════════════════════════════════════════════
// Данните за агенцията — ЕДНО място за име, контакти, адрес, профили.
// Оттук четат навигацията, footer-ът, structured data (schema.org), llms.txt.
// Празно поле = не се показва никъде (виж docs/redesign-2026/ZA-POPALVANE.md).
// NAP (име, адрес, телефон) трябва да е буква по буква същото в Google профила.
// ═══════════════════════════════════════════════════════════════════════════

export const SITE = {
	name: "Digital Effect",
	legalName: "„Диджитал Ефект“ ЕООД",
	url: "https://digitaleffect.bg",
	email: "contacts@digitaleffect.bg",
	/** [ЗА ПОПЪЛВАНЕ] телефон във формат +359 88 888 8888 — празно = скрит навсякъде */
	phone: "",
	/** [ЗА ПОПЪЛВАНЕ] ЕИК — идва тези дни; показва се във footer-а и в schema */
	eik: "",
	founder: { name: "Емил Тупев", role: "Основател", linkedin: "" /* [ЗА ПОПЪЛВАНЕ] */, image: "" /* [ЗА ПОПЪЛВАНЕ] /team/emil.webp */ },
	address: {
		/** [ЗА ПОПЪЛВАНЕ] публичен адрес на офиса (ако не искате домашния от регистрацията — само град) */
		street: "",
		city: "Силистра",
		postalCode: "7500",
		region: "Силистра",
		country: "BG",
	},
	/** [ЗА ПОПЪЛВАНЕ] точните координати на офиса (Google Maps → десен клик) */
	geo: { lat: 44.1171, lng: 27.2606 },
	hours: "Mo-Fr 09:00-18:00",
	areaServed: ["Силистра", "Русе", "Добрич", "Варна", "Шумен", "Разград", "България"],
	tagline: "Всяко евро да работи.",
	description:
		"Дигитална маркетинг агенция от Силистра: реклама във Facebook, Instagram и Google, социални мрежи, изработка на сайтове и AI автоматизация за бизнеси в България.",
	social: {
		facebook: "https://www.facebook.com/digitalleffect/",
		instagram: "https://www.instagram.com/digital.effect.bg",
		linkedin: "", // [ЗА ПОПЪЛВАНЕ]
		tiktok: "", // [ЗА ПОПЪЛВАНЕ]
		youtube: "", // [ЗА ПОПЪЛВАНЕ]
		clutch: "", // [ЗА ПОПЪЛВАНЕ] след регистрация
		googleBusiness: "", // [ЗА ПОПЪЛВАНЕ] след ЕИК — линк към Google профила
	},
} as const;

export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
export const sameAs = () => Object.values(SITE.social).filter(Boolean);

export const NAV = {
	services: [
		{ label: "Реклама", href: "/uslugi/reklama", text: "Facebook, Instagram и Google — за запитвания", module: "ads" },
		{ label: "Социални мрежи", href: "/uslugi/socialni-mrezhi", text: "Съдържание с цел, всеки месец", module: "smm" },
		{ label: "Сайтове", href: "/uslugi/izrabotka-na-sait", text: "Бързи, красиви, продаващи", module: "web" },
		{ label: "AI и автоматизация", href: "/uslugi/ai-avtomatizacia", text: "Чатботове, CRM, AI агенти", module: "ai" },
	],
	main: [
		{ label: "Цени", href: "/ceni" },
		{ label: "Резултати", href: "/rezultati" },
		{ label: "Ресурси", href: "/resursi" },
		{ label: "За нас", href: "/za-nas" },
	],
	cta: { label: "Вземи оферта", href: "/hello" },
} as const;
