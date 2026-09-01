// ═══════════════════════════════════════════════════════════════════════════
// lib/lead-scoring.ts — Клиентомат: въпроси, скоринг, вердикт
//
// Чист TS без зависимости — ползва се и на клиента (стъпки + публичния
// Growth Score), и на сървъра (истинският профил, който клиентът не вижда).
//
// ⚠ Клиентът вижда САМО publicReport(). profile() е вътрешен — никога не го
//    връщай към браузъра. Стойностите на опциите са на български и са КЛЮЧОВЕ
//    за скоринга — EN етикетите са само за показване.
// ═══════════════════════════════════════════════════════════════════════════

export type Answers = Record<string, unknown>;
export interface Behaviour {
	totalMs?: number;
	perStepMs?: Record<string, number>;
	revisits?: number;
	textLen?: number;
	optionalFilled?: number;
}
export type FieldType = "text" | "tel" | "email" | "select" | "radio" | "checks" | "textarea";
export interface Field {
	id: string;
	type: FieldType;
	label: string;
	label_en?: string;
	required?: boolean;
	placeholder?: string;
	placeholder_en?: string;
	options?: string[];
	options_en?: string[];
	rows?: number;
	showIf?: (a: Answers) => boolean;
	signal?: string; // само документация — какво мери въпросът
}
export interface Step {
	id: string;
	title: string;
	title_en: string;
	lead: string;
	lead_en: string;
	fields: Field[];
}

/* ── Помощни ───────────────────────────────────────────────────────────── */
const clamp = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const pick = (map: Record<string, number>, v: unknown, d = 0) =>
	typeof v === "string" && v in map ? map[v] : d;
const S = (v: unknown) => (typeof v === "string" ? v : "");
const words = (s: unknown) => String(s || "").trim().split(/\s+/).filter(Boolean).length;

/* ── СТЪПКИ И ВЪПРОСИ ──────────────────────────────────────────────────── */
export const STEPS: Step[] = [
	{
		id: "business", title: "Бизнесът", title_en: "The business",
		lead: "Започваме с основното. Отнема по-малко от минута.",
		lead_en: "The basics first. Takes under a minute.",
		fields: [
			{ id: "name", type: "text", label: "Име на бизнеса", label_en: "Business name", required: true,
			  placeholder: "Как се казва фирмата или обектът", placeholder_en: "Company or venue name" },
			{ id: "industry", type: "select", label: "Бранш", label_en: "Industry", required: true,
			  options: ["Търговия на дребно", "Ресторант / кафе / бар", "Услуги за дома", "Красота и здраве", "Медицина и стоматология", "Строителство и ремонти", "Автомобили", "Образование и обучения", "Недвижими имоти", "Финанси и застраховане", "Производство", "Онлайн магазин", "Друго"],
			  options_en: ["Retail", "Restaurant / café / bar", "Home services", "Beauty & wellness", "Medical & dental", "Construction & renovation", "Automotive", "Education & training", "Real estate", "Finance & insurance", "Manufacturing", "E-commerce", "Other"] },
			{ id: "industryOther", type: "text", label: "Уточнете бранша", label_en: "Specify the industry", showIf: (a) => a.industry === "Друго" },
			{ id: "age", type: "radio", label: "От колко време работи бизнесът?", label_en: "How long has the business been operating?", required: true,
			  options: ["Още не е стартирал", "До 1 година", "1 – 3 години", "3 – 10 години", "Над 10 години"],
			  options_en: ["Not launched yet", "Under 1 year", "1 – 3 years", "3 – 10 years", "Over 10 years"],
			  signal: "CAPACITY: оцеляване = приход." },
			{ id: "team", type: "radio", label: "Колко души работят в бизнеса?", label_en: "How many people work in the business?", required: true,
			  options: ["Само аз", "2 – 5", "6 – 20", "Над 20"], options_en: ["Just me", "2 – 5", "6 – 20", "Over 20"],
			  signal: "CAPACITY: най-добрият прокси за оборот." },
		],
	},
	{
		id: "presence", title: "Къде сте днес", title_en: "Where you are today",
		lead: "Каквото и да е състоянието — важното е да е точно.",
		lead_en: "Whatever the state is — what matters is that it's accurate.",
		fields: [
			{ id: "presence", type: "checks", label: "Какво имате в момента?", label_en: "What do you have right now?",
			  options: ["Сайт", "Facebook страница", "Instagram", "TikTok", "Google Бизнес профил", "Онлайн магазин", "Нищо от изброените"],
			  options_en: ["Website", "Facebook page", "Instagram", "TikTok", "Google Business Profile", "Online store", "None of these"],
			  signal: "CAPACITY + BELIEF: вече инвестирано усилие." },
			{ id: "discovery", type: "radio", label: "Как Ви намират клиентите днес?", label_en: "How do customers find you today?", required: true,
			  options: ["По препоръка", "Google търсене", "Социални мрежи", "Платена реклама", "Минават покрай обекта", "Честно казано — не знам"],
			  options_en: ["Word of mouth", "Google search", "Social media", "Paid ads", "Walk-ins", "Honestly — I don't know"],
			  signal: "BELIEF: „не знам“ = нищо не се измерва." },
			{ id: "leadsNow", type: "radio", label: "Колко нови клиента месечно идват от интернет?", label_en: "How many new customers per month come from the internet?", required: true,
			  options: ["Нито един", "1 – 5", "6 – 20", "Над 20", "Нямам представа"],
			  options_en: ["None", "1 – 5", "6 – 20", "Over 20", "No idea"],
			  signal: "BELIEF: „нямам представа“ при зрял бизнес = липса на измерване." },
		],
	},
	{
		id: "history", title: "Какво сте пробвали", title_en: "What you've tried",
		lead: "Тази част пести най-много време и на двама ни.",
		lead_en: "This part saves both of us the most time.",
		fields: [
			{ id: "worked", type: "radio", label: "Работили ли сте с агенция или фрийлансър?", label_en: "Have you worked with an agency or freelancer?", required: true,
			  options: ["Не, никога", "Да, и бях доволен", "Да, но не останах доволен", "Работя с агенция в момента", "Опитвах сам"],
			  options_en: ["No, never", "Yes, and I was happy", "Yes, but I wasn't happy", "I'm working with an agency now", "I tried on my own"],
			  signal: "FIT + BELIEF: текуща агенция = Second Opinion, не пич." },
			{ id: "workedWhat", type: "textarea", label: "Какво се обърка?", label_en: "What went wrong?", rows: 3,
			  showIf: (a) => a.worked === "Да, но не останах доволен",
			  placeholder: "Накратко — какво не се получи", placeholder_en: "Briefly — what didn't work",
			  signal: "INTENT: дължина и конкретика." },
			{ id: "spend", type: "radio", label: "Влагали ли сте пари в платена реклама?", label_en: "Have you spent money on paid advertising?", required: true,
			  options: ["Никога", "Пробвал съм малко — до 500 € общо", "Влагам редовно, до 500 €/месец", "Влагам редовно, над 500 €/месец"],
			  options_en: ["Never", "Tried a little — up to €500 total", "Regularly, up to €500/month", "Regularly, over €500/month"],
			  signal: "CAPACITY: разкрито предпочитание." },
			{ id: "spendResult", type: "radio", label: "Донесе ли резултат?", label_en: "Did it bring results?",
			  showIf: (a) => !!a.spend && a.spend !== "Никога",
			  options: ["Да, ясно се видя", "Може би, но не съм сигурен", "Не, изхвърлени пари", "Не мога да преценя — не съм мерил"],
			  options_en: ["Yes, clearly", "Maybe, not sure", "No, wasted money", "Can't tell — never measured"],
			  signal: "BELIEF — ядрото." },
		],
	},
	{
		id: "goal", title: "Накъде", title_en: "Where to",
		lead: "Тук отговаряйте свободно — четем го, не го обработваме машинно.",
		lead_en: "Answer freely here — a person reads this, not a machine.",
		fields: [
			{ id: "goal", type: "textarea", label: "Какво искате да е различно след 6 месеца?", label_en: "What do you want to be different in 6 months?", required: true, rows: 3,
			  placeholder: "Колкото по-конкретно, толкова по-полезен е анализът", placeholder_en: "The more specific, the more useful the analysis",
			  signal: "INTENT: конкретика и числа." },
			{ id: "cost", type: "textarea", label: "Ако нищо не се промени през следващата година — какво губите?", label_en: "If nothing changes over the next year — what do you lose?", rows: 3,
			  placeholder: "Пропуснати клиенти, конкурент, който изпреварва, нещо друго", placeholder_en: "Missed customers, a competitor pulling ahead, something else",
			  signal: "INTENT — най-силният предиктор за плащане." },
			{ id: "clientValue", type: "radio", label: "Колко Ви носи един нов клиент средно?", label_en: "How much is one new customer worth to you on average?", required: true,
			  options: ["Не знам", "До 50 €", "50 – 200 €", "200 – 1 000 €", "Над 1 000 €"],
			  options_en: ["Don't know", "Up to €50", "€50 – 200", "€200 – 1,000", "Over €1,000"],
			  signal: "CAPACITY + BELIEF: unit economics." },
			{ id: "capacity", type: "radio", label: "Ако утре получите 10 нови запитвания месечно, можете ли да ги поемете?", label_en: "If you got 10 new enquiries a month tomorrow, could you handle them?", required: true,
			  options: ["Да, веднага", "Да, с малко напрежение", "Не — първо трябва да наема хора", "Не съм се замислял"],
			  options_en: ["Yes, right away", "Yes, with some strain", "No — I'd need to hire first", "Haven't thought about it"],
			  signal: "FIT: капацитетът е таванът." },
		],
	},
	{
		id: "decision", title: "Последни две неща", title_en: "Last two things",
		lead: "След това получавате анализа.", lead_en: "Then you get the analysis.",
		fields: [
			{ id: "decider", type: "radio", label: "Кой взима решение за такъв разход?", label_en: "Who decides on an expense like this?", required: true,
			  options: ["Аз", "Аз и съдружник", "Собственик или управител над мен", "Съвет или няколко души"],
			  options_en: ["Me", "Me and a partner", "An owner or manager above me", "A board or several people"],
			  signal: "INTENT: скорост на решението." },
			{ id: "timeline", type: "radio", label: "Кога искате да започнете?", label_en: "When do you want to start?", required: true,
			  options: ["Веднага", "До месец", "До 3 месеца", "Още проучвам"],
			  options_en: ["Right away", "Within a month", "Within 3 months", "Still researching"],
			  signal: "INTENT." },
			{ id: "budget", type: "radio", label: "Какъв месечен ресурс сте отделили за това?", label_en: "What monthly budget have you set aside for this?", required: true,
			  options: ["Още не съм мислил", "До 250 €", "250 – 500 €", "500 – 1 000 €", "1 000 – 2 500 €", "Над 2 500 €"],
			  options_en: ["Haven't thought about it yet", "Up to €250", "€250 – 500", "€500 – 1,000", "€1,000 – 2,500", "Over €2,500"],
			  signal: "CAPACITY: пита се последен." },
			{ id: "contactName", type: "text", label: "Име", label_en: "Name", required: true },
			{ id: "phone", type: "tel", label: "Телефон", label_en: "Phone" },
			{ id: "email", type: "email", label: "Имейл", label_en: "Email" },
		],
	},
];

export const ALL_FIELDS: Field[] = STEPS.flatMap((s) => s.fields);

/* ── ОСИ ───────────────────────────────────────────────────────────────── */
function capacityScore(a: Answers) {
	let s = 0;
	s += pick({ "Още не е стартирал": 0, "До 1 година": 4, "1 – 3 години": 11, "3 – 10 години": 17, "Над 10 години": 20 }, a.age);
	s += pick({ "Само аз": 4, "2 – 5": 11, "6 – 20": 17, "Над 20": 20 }, a.team);
	s += pick({ "Никога": 0, "Пробвал съм малко — до 500 € общо": 8, "Влагам редовно, до 500 €/месец": 17, "Влагам редовно, над 500 €/месец": 25 }, a.spend);
	s += pick({ "Още не съм мислил": 0, "До 250 €": 6, "250 – 500 €": 12, "500 – 1 000 €": 18, "1 000 – 2 500 €": 23, "Над 2 500 €": 25 }, a.budget);
	s += pick({ "Не знам": 0, "До 50 €": 3, "50 – 200 €": 6, "200 – 1 000 €": 8, "Над 1 000 €": 10 }, a.clientValue);
	if (a.worked === "Работя с агенция в момента") s += 8; // вече плаща retainer
	return clamp(s);
}

function beliefScore(a: Answers) {
	const early = ["Още не е стартирал", "До 1 година"].includes(S(a.age));
	let s = 40;
	s += pick({ "Да, ясно се видя": 32, "Може би, но не съм сигурен": 8, "Не, изхвърлени пари": -18, "Не мога да преценя — не съм мерил": -6 }, a.spendResult);
	if (a.spend === "Никога") s -= 3;
	s += pick({ "По препоръка": 2, "Google търсене": 10, "Социални мрежи": 10, "Платена реклама": 16, "Минават покрай обекта": 0, "Честно казано — не знам": -14 }, a.discovery);
	s += pick({ "Нито един": early ? 0 : -4, "1 – 5": 8, "6 – 20": 13, "Над 20": 16, "Нямам представа": -14 }, a.leadsNow);
	const p: string[] = Array.isArray(a.presence) ? a.presence : [];
	if (p.includes("Нищо от изброените")) s -= early ? 3 : 10;
	else s += Math.min(12, p.length * 3);
	s += pick({ "Да, и бях доволен": 12, "Да, но не останах доволен": -10, "Работя с агенция в момента": 14, "Опитвах сам": 2, "Не, никога": 0 }, a.worked);
	if (a.clientValue === "Не знам") s -= 6;
	if (words(a.goal) >= 12) s += 6;
	if (["Веднага", "До месец"].includes(S(a.timeline))) s += 4;
	return clamp(s);
}

function intentScore(a: Answers, b: Behaviour = {}) {
	let s = 0;
	s += pick({ "Веднага": 28, "До месец": 22, "До 3 месеца": 12, "Още проучвам": 3 }, a.timeline);
	s += pick({ "Аз": 20, "Аз и съдружник": 15, "Собственик или управител над мен": 7, "Съвет или няколко души": 5 }, a.decider);
	const cw = words(a.cost);
	s += cw === 0 ? 0 : cw < 6 ? 5 : cw < 15 ? 14 : 22;
	const gw = words(a.goal);
	s += gw < 5 ? 2 : gw < 15 ? 9 : 15;
	if (/\d/.test(String(a.goal || "") + String(a.cost || ""))) s += 5;
	if (a.budget && a.budget !== "Още не съм мислил") s += 6;
	const t = b.totalMs || 0;
	if (t > 150000) s += 4;
	if (t > 0 && t < 45000) s -= 8;
	if ((b.revisits || 0) >= 2) s += 3;
	return clamp(s);
}

function fitScore(a: Answers) {
	let s = 50;
	s += pick({ "Да, веднага": 22, "Да, с малко напрежение": 12, "Не — първо трябва да наема хора": -20, "Не съм се замислял": -8 }, a.capacity);
	s += pick({ "Аз": 10, "Аз и съдружник": 6, "Собственик или управител над мен": -4, "Съвет или няколко души": -8 }, a.decider);
	s += pick({ "Да, и бях доволен": 8, "Да, но не останах доволен": -12, "Работя с агенция в момента": 6, "Опитвах сам": 4, "Не, никога": 0 }, a.worked);
	const p: string[] = Array.isArray(a.presence) ? a.presence : [];
	if (p.includes("Сайт")) s += 6;
	if (p.includes("Нищо от изброените")) s -= 6;
	if (words(a.goal) >= 10) s += 5;
	return clamp(s);
}

/* ── ФЛАГОВЕ ───────────────────────────────────────────────────────────── */
function flags(a: Answers, b: Behaviour = {}) {
	const red: string[] = [], green: string[] = [];
	if (a.capacity === "Не — първо трябва да наема хора")
		red.push("Не може да обслужи повече клиенти. Маркетингът не е първият му проблем — кажи му го на разговора.");
	if (a.leadsNow === "Нямам представа" && ["3 – 10 години", "Над 10 години"].includes(S(a.age)))
		red.push("Зрял бизнес, който не знае колко клиенти идват от интернет. Нищо не се мери → продавай измерване преди реклама.");
	if (a.spendResult === "Не, изхвърлени пари")
		red.push("Има негативен опит с реклама. Обещания няма да минат — влизай с одит или пилот с ясен критерий.");
	if (a.worked === "Да, но не останах доволен" && words(a.workedWhat) < 4)
		red.push("Казва, че е бил недоволен, но не обяснява защо. Изясни го първо.");
	if (a.budget === "Още не съм мислил" && a.timeline === "Веднага")
		red.push("Иска веднага, но не е мислил за пари. Класически профил, който изчезва след офертата.");
	if (a.decider === "Съвет или няколко души" && a.timeline === "Веднага")
		red.push("„Веднага“ при решение през съвет е нереалистично. Питай кой точно подписва.");
	if ((b.totalMs || 0) > 0 && (b.totalMs || 0) < 45000)
		red.push("Попълнил е всичко за под минута. Отговорите вероятно са напосоки.");
	if (!a.cost || words(a.cost) === 0)
		red.push("Пропуснал е въпроса какво губи при бездействие. Няма усетена болка → няма спешност.");

	if (a.spendResult === "Да, ясно се видя")
		green.push("Виждал е реклама да работи. Не му обяснявай защо е нужна — говори колко и как.");
	if (a.decider === "Аз" && ["Веднага", "До месец"].includes(S(a.timeline)))
		green.push("Решава сам и има срок. Може да се затвори на един разговор.");
	if (["200 – 1 000 €", "Над 1 000 €"].includes(S(a.clientValue)))
		green.push("Висока стойност на клиент — таксата ти е шум в сметката му. Спори за качество на заявките, не за цена.");
	if (words(a.cost) >= 15)
		green.push("Описал е подробно какво губи. Болката е назована — най-силната отправна точка за разговора.");
	if (a.worked === "Работя с агенция в момента")
		green.push("Вече плаща retainer — разбира outsourcing, има бюджет, вярва в маркетинга. Влез със Second Opinion, не с оферта за смяна.");
	if (a.spend === "Влагам редовно, над 500 €/месец")
		green.push("Вече харчи сериозно за реклама. Не продаваш нова идея, а по-добро изпълнение.");
	return { red, green };
}

/* ── ВЕРДИКТ ───────────────────────────────────────────────────────────── */
export type PlayKey = "green" | "skeptic" | "believer" | "park" | "second_opinion";
export interface Play { key: PlayKey; label: string; headline: string; move: string }
export const PLAYS: Record<PlayKey, Play> = {
	green: { key: "green", label: "Зелен коридор", headline: "Има пари и вярва, че работи.",
		move: "Пълна оферта веднага, без отстъпки. Обади се до 24 часа, влез с конкретен план, не с въпроси." },
	skeptic: { key: "skeptic", label: "Скептик с пари", headline: "Има пари, но не вярва, че рекламата работи.",
		move: "Не продавай пакет. Безплатен одит или платен пилот с един измерим критерий. Обвържи част от таксата с резултат." },
	believer: { key: "believer", label: "Вярващ без бюджет", headline: "Вярва в ефекта, но парите са малко.",
		move: "Продуктизирано решение с нисък вход или партньорски модел — ниска месечна такса плюс процент." },
	park: { key: "park", label: "Не гони", headline: "Нито бюджет, нито вяра.",
		move: "Автоматичен отговор с полезен материал и връщане след 3 месеца. Ако сам се обади — тогава говорѝ." },
	second_opinion: { key: "second_opinion", label: "Второ мнение", headline: "Вече плаща на агенция — най-ценният тип лид.",
		move: "Не предлагай смяна. Предложи независим Second Opinion одит: ad account, tracking, creatives, landing, изхабен бюджет." },
};

export interface Profile {
	axes: { capacity: number; belief: number; intent: number; fit: number };
	play: Play;
	priority: { key: "now" | "48h" | "email" | "nurture"; label: string };
	flags: { red: string[]; green: string[] };
	score: number;
}

export function profile(answers: Answers = {}, behaviour: Behaviour = {}): Profile {
	const capacity = capacityScore(answers), belief = beliefScore(answers);
	const intent = intentScore(answers, behaviour), fit = fitScore(answers);
	const hiCap = capacity >= 45, hiBel = belief >= 45;
	let play: Play = hiCap && hiBel ? PLAYS.green : hiCap ? PLAYS.skeptic : hiBel ? PLAYS.believer : PLAYS.park;
	if (answers.worked === "Работя с агенция в момента") play = PLAYS.second_opinion;
	const priority: Profile["priority"] =
		intent >= 65 && capacity >= 45 ? { key: "now", label: "Обади се днес" } :
		intent >= 45 ? { key: "48h", label: "Обади се до 48 часа" } :
		intent >= 25 ? { key: "email", label: "Имейл, не обаждане" } :
		{ key: "nurture", label: "Само в списъка" };
	return {
		axes: { capacity, belief, intent, fit }, play, priority,
		flags: flags(answers, behaviour),
		score: clamp(Math.round(capacity * 0.35 + intent * 0.3 + belief * 0.2 + fit * 0.15)),
	};
}

/* ── GROWTH SCORE — това, което клиентът вижда ─────────────────────────── */
export interface PublicNote { t: string; d: string; t_en: string; d_en: string }
export interface PublicReport {
	score: number;
	subScores: { k: string; k_en: string; v: number }[];
	notes: PublicNote[];
}

export function publicReport(a: Answers = {}): PublicReport {
	const notes: PublicNote[] = [];
	const p: string[] = Array.isArray(a.presence) ? a.presence : [];
	const none = p.includes("Нищо от изброените");

	if (a.discovery === "Честно казано — не знам" || a.leadsNow === "Нямам представа")
		notes.push({ t: "Не знаете откъде идват клиентите Ви", d: "Това е първото за оправяне. Без измерване всяко решение за реклама е на сляпо.",
			t_en: "You don't know where your customers come from", d_en: "Fix this first. Without measurement every advertising decision is blind." });
	if (!p.includes("Google Бизнес профил") && !none)
		notes.push({ t: "Липсва Google Бизнес профил", d: "Безплатен е и при локален бизнес обикновено носи повече обаждания от социалните мрежи.",
			t_en: "No Google Business Profile", d_en: "It's free and for a local business usually brings more calls than social media." });
	if (none)
		notes.push({ t: "Тръгвате от нула", d: "Това не е недостатък. Първите стъпки са евтини и се виждат бързо.",
			t_en: "Starting from zero", d_en: "Not a disadvantage. The first steps are cheap and show quickly." });
	if (!p.includes("Сайт") && !none)
		notes.push({ t: "Нямате собствен сайт", d: "Профилите в социалните мрежи са наети. Алгоритъм или блокировка могат да Ви отрежат за ден.",
			t_en: "No website of your own", d_en: "Social profiles are rented. An algorithm change or a block can cut you off in a day." });
	if (a.clientValue === "Не знам")
		notes.push({ t: "Не знаете колко струва един клиент", d: "Без това число не може да се прецени коя реклама е изгодна. Смята се за 20 минути.",
			t_en: "You don't know what a customer is worth", d_en: "Without this number you can't tell which ad pays off. Takes 20 minutes to work out." });
	if (a.capacity === "Не — първо трябва да наема хора")
		notes.push({ t: "Капацитетът Ви е таванът, не рекламата", d: "Повече запитвания без хора, които да ги поемат, водят до лоши отзиви. Първо капацитет, после обем.",
			t_en: "Capacity is your ceiling, not advertising", d_en: "More enquiries without people to handle them lead to bad reviews. Capacity first, then volume." });
	if (a.spendResult === "Не мога да преценя — не съм мерил")
		notes.push({ t: "Харчили сте за реклама без проследяване", d: "Затова усещането е, че „не работи“. Почти винаги проблемът е в измерването, не в рекламата.",
			t_en: "You've spent on ads without tracking", d_en: "That's why it feels like it \"doesn't work\". Almost always the problem is measurement, not the ads." });
	if (a.spend === "Никога" && ["3 – 10 години", "Над 10 години"].includes(S(a.age)))
		notes.push({ t: "Стабилен бизнес без платена реклама", d: "Растежът Ви досега е органичен. Добра основа — има какво да се мащабира.",
			t_en: "A stable business without paid ads", d_en: "Your growth so far is organic. A good base — there's something to scale." });

	const pres = clamp(none ? 8 : 12 + p.length * 14 + (p.includes("Сайт") ? 8 : 0) + (p.includes("Google Бизнес профил") ? 8 : 0));
	const meas = clamp(20
		+ (a.discovery && a.discovery !== "Честно казано — не знам" ? 22 : -12)
		+ (a.leadsNow && a.leadsNow !== "Нямам представа" ? 22 : -8)
		+ (a.clientValue && a.clientValue !== "Не знам" ? 20 : 0)
		+ (a.spendResult === "Да, ясно се видя" ? 16 : a.spendResult === "Не мога да преценя — не съм мерил" ? -10 : 0));
	const grow = clamp(25
		+ pick({ "Да, веднага": 35, "Да, с малко напрежение": 25, "Не — първо трябва да наема хора": 5, "Не съм се замислял": 10 }, a.capacity)
		+ pick({ "Веднага": 20, "До месец": 16, "До 3 месеца": 10, "Още проучвам": 4 }, a.timeline)
		+ (words(a.goal) >= 10 ? 10 : 0));

	return {
		score: clamp(Math.round(beliefScore(a) * 0.5 + capacityScore(a) * 0.3 + fitScore(a) * 0.2)),
		subScores: [
			{ k: "Присъствие", k_en: "Presence", v: pres },
			{ k: "Измерване", k_en: "Measurement", v: meas },
			{ k: "Готовност за растеж", k_en: "Growth readiness", v: grow },
		],
		notes: notes.slice(0, 4),
	};
}
