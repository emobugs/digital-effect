"use client";

// ═══════════════════════════════════════════════════════════════════════════
// /partners — Digital Effect Partners: публичната страница на програмата
// Hero → как работи → нива + калкулатор → за кого → условия → регистрация.
// Регистрацията минава през /api/partners/register (proxy към de-os).
// Числата (нива, месеци, минимум…) идват като prop `program` от page.tsx
// (сървърно от de-os, fallback program.ts) — тук няма твърдо записани.
// ═══════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ROLES, tierRate, pct, eur, type Program } from "./program";
import { Shell, Card, Kicker, H2, Note, INPUT, BTN, BTN_GHOST, cx } from "./ui";
import { readPartnerCode, storePartnerCode, getStoredPartnerCode } from "@/lib/partner-ref";

type Result = { code: string | null; link?: string; cabinet?: string; qr: string | null; duplicate: boolean; status?: string };

const steps = (months: number) => [
	["Получавате код", "Регистрирате се за минута. Получавате личен код, линк и QR."],
	["Споделяте", "Пращате линка или показвате QR-а на собственик, който има нужда от повече клиенти."],
	[`Печелите ${months} месеца`, "Той попълва анкетата ни, ние работим, Вие получавате процент от всяко негово месечно плащане."],
];

const FOR = ["Счетоводители", "Адвокати и нотариуси", "Брокери на имоти", "Фотографи и видеографи", "IT support и системни администратори", "POS, ERP и касови системи", "Печат, табели, реклама", "Web freelancer-и и дизайнери", "Бизнес консултанти", "HR агенции"];

function Calculator({ program }: { program: Program }) {
	const [n, setN] = useState(3);
	const [v, setV] = useState(500);
	const rate = tierRate(n, program.tiers);
	const monthly = n * v * rate;
	return (
		<div className="rounded-xl border border-white/10 bg-black/30 p-5 space-y-5">
			<div>
				<div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Доведени клиенти</span><span className="font-semibold">{n}</span></div>
				<input type="range" min={1} max={10} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-[#f26522]" aria-label="Брой клиенти" />
			</div>
			<div>
				<div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Среден месечен договор</span><span className="font-semibold">{eur(v)}</span></div>
				<input type="range" min={200} max={2000} step={50} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full accent-[#f26522]" aria-label="Среден месечен договор" />
			</div>
			<div className="grid grid-cols-2 gap-3 pt-1">
				<div className="rounded-xl bg-brand-orange-l/[0.08] border border-brand-orange-l/25 p-4">
					<div className="text-[11px] uppercase tracking-[.14em] text-gray-400">На месец</div>
					<div className="font-display font-black text-2xl text-brand-orange-l mt-1">≈ {eur(monthly)}</div>
					<div className="text-xs text-gray-500 mt-0.5">ниво {pct(rate)}</div>
				</div>
				<div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
					<div className="text-[11px] uppercase tracking-[.14em] text-gray-400">За {program.months} месеца</div>
					<div className="font-display font-black text-2xl mt-1">≈ {eur(monthly * program.months)}</div>
					<div className="text-xs text-gray-500 mt-0.5">{n} × {eur(v)} × {pct(rate)}</div>
				</div>
			</div>
		</div>
	);
}

function Success({ r }: { r: Result }) {
	const [copied, setCopied] = useState(false);
	const link = r.link || "";
	const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* няма clipboard */ } };
	const share = async () => {
		try {
			if (navigator.share) await navigator.share({ title: "Digital Effect", text: "Къде губите клиенти онлайн? Безплатна оценка за 4 минути:", url: link });
			else await copy();
		} catch { /* отказан share */ }
	};
	if (r.duplicate || !r.code || !r.link) {
		return (
			<Card>
				<Kicker>Този телефон вече е регистриран</Kicker>
				<H2>Кодът Ви е в имейла от регистрацията.</H2>
				<Note>Ако не го намирате, отворете кабинета и поискайте линка наново с кода и телефона си — или ни пишете на partners@digitaleffect.bg.</Note>
				<div className="flex flex-wrap gap-3 mt-5"><Link href="/partners/me" className={BTN}>Кабинет</Link></div>
			</Card>
		);
	}
	return (
		<Card>
			<Kicker>Готово</Kicker>
			<H2>Вашият код: <span className="font-mono text-brand-orange-l">{r.code}</span></H2>
			<Note>{r.status === "active" ? "Кодът е активен — можете да го споделяте веднага." : "Кодът чака одобрение — обикновено до 24 часа. Ще Ви пишем, щом е активен; междувременно можете да го споделите, всичко попълнено през него се записва."}</Note>
			<div className="mt-5 rounded-xl bg-black/40 border border-white/10 px-4 py-3 font-mono text-sm break-all">{link}</div>
			<div className="flex flex-wrap gap-3 mt-4">
				<button type="button" onClick={copy} className={BTN}>{copied ? "Копирано ✓" : "Копирай линка"}</button>
				<button type="button" onClick={share} className={BTN_GHOST}>Сподели</button>
				{r.cabinet && <a href={r.cabinet} className={BTN_GHOST}>Отвори кабинета</a>}
			</div>
			<Note>Пратихме Ви имейл с кода и личния линк за кабинета. Пазете го — с него влизате, без парола.</Note>
			{r.qr && (
				<div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
					<div className="rounded-xl bg-white p-3 w-40 h-40 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: r.qr }} />
					<Note>Покажете QR-а на телефона си или го разпечатайте — клиентът го сканира и отива директно в анкетата с Вашия код.</Note>
				</div>
			)}
		</Card>
	);
}

export default function PartnersClient({ program }: { program: Program }) {
	const [f, setF] = useState({ name: "", phone: "", email: "", role: "accountant", company: "", is_client: false, pay_method: "credit", consent: false });
	const [sending, setSending] = useState(false);
	const [err, setErr] = useState("");
	const [result, setResult] = useState<Result | null>(null);
	const [parent, setParent] = useState<string | null>(null);
	const hpRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Партньор води партньор: ?p= на тази страница → parent_code
		const fromUrl = readPartnerCode();
		if (fromUrl) storePartnerCode(fromUrl);
		// eslint-disable-next-line react-hooks/set-state-in-effect -- четем URL/localStorage след mount (SSR няма достъп)
		setParent(fromUrl ?? getStoredPartnerCode(program.attributionDays));
	}, [program.attributionDays]);

	const tiers = useMemo(() => [...program.tiers].sort((a, b) => a.min - b.min), [program.tiers]);
	const valid = f.name.trim().length >= 2 && f.phone.replace(/\D/g, "").length >= 9 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) && f.consent;

	async function submit() {
		if (!valid || sending) return;
		setSending(true); setErr("");
		try {
			const r = await fetch("/api/partners/register", {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...f, parent_code: parent || "", website: hpRef.current?.value || "" }),
			});
			const d = await r.json().catch(() => ({}));
			if (!r.ok) throw new Error(d.error || "Нещо се обърка.");
			if (!d.code && !d.duplicate) throw new Error("Нещо се обърка.");
			setResult(d as Result);
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Нещо се обърка. Опитайте пак или ни пишете на partners@digitaleffect.bg.");
		} finally { setSending(false); }
	}

	if (result) return <Shell><Success r={result} /></Shell>;

	return (
		<Shell wide>
			{/* Hero */}
			<Card>
				<Kicker>Digital Effect Partners</Kicker>
				<h1 className="font-display font-black text-3xl sm:text-4xl leading-[1.08] tracking-tight mb-4">
					Познавате собственици на бизнес. <span className="bg-brand-grad-text bg-clip-text text-transparent">Ние им намираме клиенти.</span> Вие получавате процент.
				</h1>
				<Note>Препоръчвате Digital Effect на хора, с които и без това говорите всеки ден. Всеки от тях, който стане наш клиент, Ви носи до {pct(tiers[tiers.length - 1].rate)} от месечния му договор — {program.months} месеца. Без продажби, без ангажимент, без разходи.</Note>
				<div className="flex flex-wrap gap-3 mt-6">
					<button type="button" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} className={BTN}>Вземи код →</button>
					<Link href="/partners/me" className={BTN_GHOST}>Вече съм партньор</Link>
				</div>
			</Card>

			{/* Как работи */}
			<Card>
				<Kicker>Как работи</Kicker>
				<div className="grid sm:grid-cols-3 gap-4">
					{steps(program.months).map(([t, d], i) => (
						<div key={t} className="rounded-xl border border-white/10 bg-black/30 p-4">
							<div className="w-8 h-8 rounded-full bg-brand-grad grid place-items-center font-black text-sm mb-3">{i + 1}</div>
							<div className="font-semibold text-[15px] mb-1">{t}</div>
							<div className="text-sm text-gray-400 leading-relaxed">{d}</div>
						</div>
					))}
				</div>
			</Card>

			{/* Нива + калкулатор */}
			<Card>
				<Kicker>Колко печелите</Kicker>
				<H2>Колкото повече клиенти, толкова по-висок процент — за всичките.</H2>
				<div className="grid sm:grid-cols-[1fr_1.3fr] gap-5 items-start">
					<div className="space-y-3">
						<div className="rounded-xl border border-white/10 overflow-hidden">
							{tiers.map((t, i) => (
								<div key={t.min} className={cx("flex items-center justify-between px-4 py-3 text-sm", i > 0 && "border-t border-white/[.06]", i === tiers.length - 1 && "bg-brand-orange-l/[0.08]")}>
									<span className="text-gray-300">{t.min}{i === tiers.length - 1 ? "+" : ""} активн{t.min === 1 ? "и клиент" : "и клиента"}</span>
									<span className={cx("font-display font-black text-lg", i === tiers.length - 1 ? "text-brand-orange-l" : "")}>{pct(t.rate)}</span>
								</div>
							))}
						</div>
						<p className="text-xs text-gray-500 leading-relaxed">Третият клиент вдига процента и на първите два. Нивото се преизчислява всеки месец от броя активни клиенти.</p>
						<div className="rounded-xl border border-white/10 overflow-hidden">
							<div className="px-4 py-2 text-[11px] uppercase tracking-[.14em] text-gray-500 bg-white/[0.03]">Еднократни проекти (сайт, брандинг)</div>
							{program.projectTiers.map((t, i, arr) => (
								<div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm border-t border-white/[.06]">
									<span className="text-gray-300">{t.max == null ? `над ${eur(arr[i - 1].max!)}` : `до ${eur(t.max)}`}</span>
									<span className="font-bold">{pct(t.rate)}</span>
								</div>
							))}
						</div>
					</div>
					<Calculator program={program} />
				</div>
			</Card>

			{/* За кого */}
			<Card>
				<Kicker>За кого е</Kicker>
				<H2>За хора, на които собствениците вече вярват.</H2>
				<div className="flex flex-wrap gap-2">
					{FOR.map((x) => <span key={x} className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-gray-300">{x}</span>)}
				</div>
				<Note>Един добър счетоводител познава 100+ собственици. Не Ви караме да продавате — само да кажете „има едни хора, които ще ти покажат къде губиш клиенти онлайн, безплатно“.</Note>
			</Card>

			{/* Условия накратко */}
			<Card>
				<Kicker>Условията накратко</Kicker>
				<ul className="space-y-2 text-[15px] text-gray-300 leading-relaxed">
					<li>· Процентът е от месечния договор на клиента без ДДС и без рекламния му бюджет.</li>
					<li>· Важи {program.months} месеца от първото плащане на всеки доведен клиент.</li>
					<li>· Доведете и партньор — получавате {pct(program.level2Rate)} от клиентите на хората, които Вие сте довели.</li>
					<li>· Изплащаме до {program.payoutDay}-то число за предходния месец, при натрупани поне {eur(program.minPayout)}.</li>
					<li>· Банков превод или кредит срещу наша услуга за Вас — с {pct(program.creditBonus)} бонус.</li>
					<li>· Клиентът трябва да е нов за Digital Effect. Първият код печели.</li>
				</ul>
				<p className="text-sm text-gray-500 mt-4">Пълните условия: <Link href="/partners/terms" className="underline text-brand-orange-l">digitaleffect.bg/partners/terms</Link></p>
			</Card>

			{/* Регистрация */}
			<div ref={formRef}>
				<Card>
					<Kicker>Регистрация</Kicker>
					<H2>Вземете код за минута.</H2>
					{parent && <div className="text-xs text-gray-400 mb-4">Регистрирате се по покана на партньор <span className="font-mono text-gray-200">{parent}</span>.</div>}
					<div className="grid sm:grid-cols-2 gap-3">
						<input className={INPUT} placeholder="Име и фамилия *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
						<input className={INPUT} placeholder="Телефон *" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
						<input className={INPUT} placeholder="Имейл * (там пращаме линка за кабинета)" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
						<select className={INPUT} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
							{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
						</select>
						<input className={cx(INPUT, "sm:col-span-2")} placeholder="Фирма (по избор)" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoComplete="organization" />
					</div>
					<label className="flex items-start gap-3 mt-4 text-sm text-gray-300 cursor-pointer">
						<input type="checkbox" className="mt-1 accent-[#f26522]" checked={f.is_client} onChange={(e) => setF({ ...f, is_client: e.target.checked })} />
						<span>Аз съм и клиент на Digital Effect</span>
					</label>
					{f.is_client && (
						<div className="mt-3 ml-7 flex flex-wrap gap-2">
							{[["credit", `Отстъпка от моята сметка (+${pct(program.creditBonus)})`], ["cash", "Банков превод"]].map(([v, l]) => (
								<button key={v} type="button" onClick={() => setF({ ...f, pay_method: v })}
									className={cx("rounded-full px-3 py-1.5 text-sm border transition", f.pay_method === v ? "border-brand-orange-l/50 bg-brand-orange-l/[0.08] text-gray-100" : "border-white/10 text-gray-400")}>{l}</button>
							))}
						</div>
					)}
					<label className="flex items-start gap-3 mt-4 text-sm text-gray-300 cursor-pointer">
						<input type="checkbox" className="mt-1 accent-[#f26522]" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
						<span>Приемам <Link href="/partners/terms" className="underline text-brand-orange-l">условията на програмата</Link> и <Link href="/privacy" className="underline text-brand-orange-l">политиката за поверителност</Link>. *</span>
					</label>
					<input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden="true" />
					{err && <div className="mt-4 text-sm text-red-400">{err}</div>}
					<button type="button" disabled={!valid || sending} onClick={submit} className={cx(BTN, "w-full sm:w-auto mt-5")}>{sending ? "Изпращаме…" : "Вземи код →"}</button>
				</Card>
			</div>
		</Shell>
	);
}
