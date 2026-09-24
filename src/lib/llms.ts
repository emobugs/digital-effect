// ── llms.txt / llms-full.txt — кратко и пълно описание за езикови модели ──────
// Генерира се от ценоразписа и съдържанието в de-os — винаги актуално.
// Формат: https://llmstxt.org (Markdown: H1, цитат-резюме, секции със списъци от линкове).
import { getCatalog, priceParts, byCategory, CATEGORY_META, type ServiceCategory } from "@/lib/services";
import { getSiteContent, pagePath } from "@/lib/content";
import { CASES } from "@/data/cases";
import { ARTICLES } from "@/data/articles";
import { tierRows } from "@/lib/fees";
import { SITE } from "@/lib/site";

const U = (p: string) => `${SITE.url}${p}`;

export async function buildLlms(full: boolean) {
	const [cat, c] = await Promise.all([getCatalog(false), getSiteContent()]);
	const L: string[] = [];
	L.push(`# ${SITE.name}`, "");
	L.push(`> ${SITE.description} Цените са публични; рекламният бюджет се плаща директно на Meta и Google. Първият месец може да е пилотен: без резултат по договорения критерий — без такса за управление.`, "");
	L.push(`- Юридическо лице: ${SITE.legalName}${SITE.eik ? `, ЕИК ${SITE.eik}` : ""}`);
	L.push(`- Седалище: ${SITE.address.city}, България; работи с клиенти от цялата страна`);
	L.push(`- Основател: ${SITE.founder.name}`);
	L.push(`- Контакт: ${SITE.email}${SITE.phone ? `, ${SITE.phone}` : ""} · оферта онлайн: ${U("/hello")}`, "");

	L.push("## Услуги", "");
	for (const p of c.pages.filter((x) => x.type === "service").sort((a, b) => a.sort - b.sort)) {
		L.push(`- [${p.data.title}](${U(pagePath(p))}): ${p.data.summary || p.data.lead || ""}`);
	}
	L.push("");

	L.push("## Цени (EUR, без рекламния бюджет)", "");
	const order: ServiceCategory[] = ["growth", "reklama", "smm", "web", "ai"];
	for (const k of order) {
		for (const s of byCategory(cat, k)) {
			const pp = priceParts(s);
			const lv = s.options?.length ? ` — ${s.options.map((o) => `${o.label}: €${o.price}/мес.`).join("; ")}` : s.tiers?.length ? ` — ${s.tiers.map((t) => `${t.label}: €${t.price}${s.price.monthly ? "/мес." : ""}`).join("; ")}` : "";
			L.push(`- ${s.name} (${CATEGORY_META[k].label}): ${`${pp.prefix} ${pp.value} ${pp.suffix}`.trim()}${lv}`);
			if (s.pctTiers?.length) L.push(`  - Таксата за реклама: €${s.price.fixed ?? 150} фиксирано + стъпаловиден % от бюджета: ${tierRows(s.pctTiers).map((r) => `${r.range} — ${r.pct}%`).join("; ")}.${s.setup ? ` Setup: €${s.setup.min}–${s.setup.max} еднократно.` : ""}`);
			if (full && s.includes?.length) L.push(`  - Включва: ${s.includes.join("; ")}`);
		}
	}
	L.push(`- Пълен ценоразпис: ${U("/ceni")}`, "");

	L.push("## Индустрии и градове", "");
	for (const p of c.pages.filter((x) => x.type !== "service" && x.data.indexable !== false)) L.push(`- [${p.data.title}](${U(pagePath(p))}): ${p.data.h1}`);
	L.push("");

	L.push("## Резултати", "");
	for (const k of CASES) L.push(`- [${k.client}](${U(`/rezultati/${k.slug}`)}): ${k.short}`);
	L.push("");

	L.push("## Безплатни инструменти", "");
	for (const r of c.resources) L.push(`- [${r.data.title}](${U(r.status === "live" && r.data.href ? r.data.href : `/resursi/${r.slug}`)}): ${r.data.short}${r.status === "live" ? "" : " (скоро)"}`);
	L.push("");

	L.push("## Статии", "");
	for (const a of ARTICLES) L.push(`- [${a.title}](${U(`/znanie/${a.slug}`)}): ${a.answer}`);
	L.push("");

	if (full) {
		L.push("## Подробно по страници", "");
		for (const p of c.pages.filter((x) => x.data.indexable !== false)) {
			const d = p.data;
			L.push(`### ${d.title}`, "", `URL: ${U(pagePath(p))}`, "");
			if (d.summary) L.push(d.summary, "");
			if (d.benefits?.length) { L.push("Ползи:"); d.benefits.forEach((b) => L.push(`- ${b.title}: ${b.text}`)); L.push(""); }
			if (d.compare?.length) { L.push(`Разлика (${d.compareLabels?.them || "типично"} → ${d.compareLabels?.us || "Digital Effect"}):`); d.compare.forEach((r) => L.push(`- ${r.topic}: ${r.them} → ${r.us}`)); L.push(""); }
			if (d.process?.length) { L.push("Процес:"); d.process.forEach((s) => L.push(`- ${s.when ? `${s.when} — ` : ""}${s.title}: ${s.text}`)); L.push(""); }
			if (d.faq?.length) { L.push("Въпроси:"); d.faq.forEach((f) => L.push(`- В: ${f.q}`, `  О: ${f.a}`)); L.push(""); }
		}
	} else {
		L.push("## Optional", "", `- [Пълна версия за езикови модели](${U("/llms-full.txt")}): всички страници, ползи, процеси и ЧЗВ`, `- [Карта на сайта](${U("/sitemap.xml")})`, "");
	}
	return L.join("\n");
}
