// ── Кейсове (/rezultati) ────────────────────────────────────────────────────
// Всяко число тук трябва да е реално и с разрешение от клиента.
// [ЗА ПОПЪЛВАНЕ] полетата са описани в docs/redesign-2026/ZA-POPALVANE.md —
// празен `quote` / `results` просто не се показва.

export interface CaseStudy {
	slug: string;
	client: string;
	year: string;
	category: string;
	services: string[]; // пътища на страници /uslugi/…
	url: string | null;
	image: string;
	mobileImage: string | null;
	short: string;
	challenge: string;
	solution: string[];
	results: { value: string; label: string }[];
	quote: { text: string; author: string; role: string } | null;
	tags: string[];
	accent: string;
}

export const CASES: CaseStudy[] = [
	{
		slug: "aromasecret",
		client: "AromaSecret",
		year: "2025",
		category: "Meta реклама · Социални мрежи",
		services: ["/uslugi/reklama/facebook-instagram", "/uslugi/socialni-mrezhi"],
		url: null,
		image: "/projects/aromasecret.webp",
		mobileImage: null,
		short: "Рекламни кампании за магазин за парфюми: 303 283 достигнати, 1,68 млн. импресии при CPM $0,64 и 17,1% engagement — при бюджет $1,07K.",
		challenge: "Онлайн магазин за ориенталски парфюми с малък бюджет и нужда от бърза разпознаваемост сред точната аудитория.",
		solution: [
			"Кампании във Facebook и Instagram с продуктови видеа и визии",
			"Тестове на послания и аудитории, бюджетът — към печелившите",
			"Съдържание в профилите, синхронизирано с рекламата",
		],
		results: [
			{ value: "303K", label: "достигнати хора" },
			{ value: "1,68M", label: "импресии" },
			{ value: "$0,64", label: "CPM" },
			{ value: "17,1%", label: "engagement rate" },
		],
		quote: null,
		tags: ["Meta Ads", "Reach", "Криейтиви"],
		accent: "#f26522",
	},
	{
		slug: "hotel-danube",
		client: "Hotel Danube",
		year: "2025",
		category: "Уебсайт · Резервации · Автоматизация",
		services: ["/uslugi/izrabotka-na-sait", "/uslugi/ai-avtomatizacia", "/za/hoteli"],
		url: "https://danube-hotel.bg",
		image: "/projects/danube.webp",
		mobileImage: "/projects/danube-mobile.webp",
		short: "Многоезичен хотелски сайт с онлайн резервации в реално време и автоматични имейл потвърждения на 4 езика.",
		challenge: "Хотелът разчиташе на платформи с комисиона и на телефонни резервации; сайтът не показваше наличност и беше само на български.",
		solution: [
			"Сайт на Next.js на 4 езика (BG, EN, RU, RO)",
			"Резервации в реално време през собствен REST API към резервационната система",
			"Автоматични имейл потвърждения",
		],
		results: [
			{ value: "4", label: "езика" },
			{ value: "24/7", label: "онлайн резервации" },
		],
		quote: null,
		tags: ["Next.js", "Booking API", "Многоезичен"],
		accent: "#f59c1a",
	},
	{
		slug: "robert-key",
		client: "Robert Key",
		year: "2025",
		category: "Landing · SEO · Meta реклама",
		services: ["/uslugi/izrabotka-na-sait", "/uslugi/reklama/google-ads", "/marketing-agencia/silistra"],
		url: "https://robertkey.vercel.app",
		image: "/projects/robert-key.webp",
		mobileImage: "/projects/robert-mobile.webp",
		short: "Landing страница за авариен ключар в Силистра — първи в Google по ключовите думи за ключарски услуги в града.",
		challenge: "Спешна услуга, при която клиентът звъни на първия, когото намери в Google.",
		solution: ["Бърза landing страница с телефон на всеки екран", "Локално SEO и Google профил", "Meta реклама за разпознаваемост в града"],
		results: [
			{ value: "#1", label: "в Google за ключар в Силистра" },
		],
		quote: null,
		tags: ["Landing", "Локално SEO", "Leads"],
		accent: "#e8450a",
	},
	{
		slug: "northpart",
		client: "Northpart",
		year: "2025",
		category: "Уебсайт · B2B · Брандинг",
		services: ["/uslugi/izrabotka-na-sait"],
		url: "https://northpart.com",
		image: "/projects/northpart.webp",
		mobileImage: "/projects/northpart-mobile.webp",
		short: "Корпоративен многоезичен сайт за дистрибутор на EV и соларни батерийни решения — за B2B аудитория и технически продукти.",
		challenge: "Технически продукт и B2B купувачи в няколко държави — сайтът трябваше да изглежда като сериозен европейски доставчик.",
		solution: ["Бранд и визия", "Многоезичен сайт на Next.js с GSAP анимации", "SEO структура за продуктите"],
		results: [],
		quote: null,
		tags: ["Next.js", "B2B", "Многоезичен"],
		accent: "#f26522",
	},
	{
		slug: "migama",
		client: "MIGAMA",
		year: "2025",
		category: "Уебсайт · Строителство · Препоръки",
		services: ["/uslugi/izrabotka-na-sait", "/za/stroitelni-firmi"],
		url: "https://migama.bg",
		image: "/projects/migama.webp",
		mobileImage: "/projects/migama-mobile.webp",
		short: "Интерактивен сайт за строителна фирма със система за препоръки — визия и функционалност, създадени за строителния бранш.",
		challenge: "Строителна фирма, която искаше да изпъква пред конкурентите с еднакви шаблонни сайтове.",
		solution: ["Интерактивен сайт, съобразен с нишата", "Система за препоръки (referral) на Node.js + SQLite"],
		results: [],
		quote: null,
		tags: ["GSAP", "Node.js", "Referral"],
		accent: "#f59c1a",
	},
];

export const caseBySlug = (slug?: string | null) => (slug ? CASES.find((c) => c.slug === slug) || null : null);
