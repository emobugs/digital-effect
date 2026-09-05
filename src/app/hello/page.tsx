"use client";

// ═══════════════════════════════════════════════════════════════════════════
// /hello — Клиентомат: квалификационна анкета + Digital Effect Growth Score
//
// Клиентът вижда: 5 стъпки → Growth Score (число, 3 под-оценки, до 4 бележки).
// Не вижда: осите, вердикта, флаговете. Те се смятат в /api/hello (сървър).
// ═══════════════════════════════════════════════════════════════════════════

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STEPS, publicReport, type Answers, type Field, type PublicReport } from "@/lib/lead-scoring";
import { resolvePartnerCode } from "@/lib/partner-ref";

type Lang = "bg" | "en";

const T = {
	bg: {
		kicker: "Digital Effect Growth Score",
		title: ["Къде губите ", "клиенти онлайн?"],
		sub: "Пет стъпки, около четири минути. Накрая получавате оценка на дигиталното си състояние, изведена от Вашите отговори. После се свързваме с конкретни стъпки — не с общи приказки.",
		start: "Започни", step: "Стъпка", of: "от", next: "Продължи", back: "Назад",
		finish: "Виж анализа", sending: "Изпращаме…", choose: "Изберете…",
		reqField: "Това поле е нужно, за да е точен анализът.",
		reqContact: "Оставете поне телефон или имейл, за да се свържем.",
		errSend: "Нещо се обърка. Опитайте пак или ни пишете на contacts@digitaleffect.bg.",
		privacy: ["Използваме данните само за да подготвим предложение за Вашия бизнес и да се свържем с Вас. Не ги предоставяме на трети страни. Подробности в ", "Политиката за поверителност", "."],
		doneTitle: "Готово.",
		doneSub: "Това е бърза оценка на дигиталното Ви състояние по Вашите отговори. Свързваме се до 24 часа с конкретните стъпки.",
		badge: "Връзка до 24 часа",
		noneOpt: "Нищо от изброените",
		referred: "Препоръчан от",
	},
	en: {
		kicker: "Digital Effect Growth Score",
		title: ["Where are you ", "losing customers online?"],
		sub: "Five steps, about four minutes. At the end you get a score of your digital state, derived from your own answers. Then we get in touch with concrete steps — not generic talk.",
		start: "Start", step: "Step", of: "of", next: "Continue", back: "Back",
		finish: "See the analysis", sending: "Sending…", choose: "Choose…",
		reqField: "This field is needed for an accurate analysis.",
		reqContact: "Leave at least a phone or an email so we can reach you.",
		errSend: "Something went wrong. Try again or write to contacts@digitaleffect.bg.",
		privacy: ["We use the data only to prepare a proposal for your business and to contact you. We don't share it with third parties. Details in the ", "Privacy Policy", "."],
		doneTitle: "Done.",
		doneSub: "A quick assessment of your digital state based on your answers. We'll be in touch within 24 hours with concrete steps.",
		badge: "Contact within 24 hours",
		noneOpt: "None of these",
		referred: "Referred by",
	},
} as const;

const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

// Подсказки по канал — името стига, линк не е нужен
const LINK_PH: Record<string, { bg: string; en: string }> = {
	"Сайт": { bg: "адрес или само име — напр. example.bg", en: "address or just a name — e.g. example.com" },
	"Facebook страница": { bg: "името на страницата — както се вижда във Facebook", en: "the page name — as it appears on Facebook" },
	"Instagram": { bg: "@профил или име", en: "@handle or name" },
	"TikTok": { bg: "@профил или име", en: "@handle or name" },
	"Google Бизнес профил": { bg: "името на обекта — както е в Google Maps", en: "the listing name — as it is on Google Maps" },
	"Онлайн магазин": { bg: "адрес или име на магазина", en: "store address or name" },
};
const visible = (f: Field, a: Answers) => (typeof f.showIf === "function" ? f.showIf(a) : true);
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : String(v ?? "").trim().length > 0);

/* ── UI атоми ─────────────────────────────────────────────────────────── */
function Mark({ on, round }: { on: boolean; round?: boolean }) {
	return (
		<span className={cx("flex-shrink-0 w-5 h-5 border grid place-items-center transition", round ? "rounded-full" : "rounded-md", on ? "border-transparent bg-brand-grad" : "border-white/20")}>
			{on && (round ? <span className="w-2 h-2 rounded-full bg-white" /> : (
				<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
			))}
		</span>
	);
}

const INPUT = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-gray-100 placeholder:text-gray-600 outline-none transition focus:border-brand-orange-l/50 focus:shadow-[0_0_0_3px_rgba(242,101,34,0.12)]";
const OPT = "flex items-center gap-3 text-left rounded-xl border px-4 py-3 text-[15px] transition";
const OPT_ON = "border-brand-orange-l/50 bg-brand-orange-l/[0.07] text-gray-100";
const OPT_OFF = "border-white/10 bg-black/30 text-gray-300 hover:border-white/20";

type Val = string | string[] | Record<string, string> | undefined;
function FieldInput({ f, value, lang, onChange, t }: { f: Field; value: Val; lang: Lang; onChange: (v: Val) => void; t: (typeof T)[Lang] }) {
	const labelOf = (i: number) => (lang === "en" && f.options_en ? f.options_en[i] : f.options![i]);
	const ph = lang === "en" ? f.placeholder_en ?? f.placeholder : f.placeholder;

	if (f.type === "textarea")
		return <textarea rows={f.rows || 3} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={cx(INPUT, "resize-y leading-relaxed")} />;

	if (f.type === "select")
		return (
			<select value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} className={INPUT} style={{ colorScheme: "dark" }}>
				<option value="">{t.choose}</option>
				{f.options!.map((o, i) => <option key={o} value={o}>{labelOf(i)}</option>)}
			</select>
		);

	if (f.type === "radio")
		return (
			<div className="grid gap-2">
				{f.options!.map((o, i) => {
					const on = value === o;
					return (
						<button key={o} type="button" onClick={() => onChange(o)} className={cx(OPT, on ? OPT_ON : OPT_OFF)}>
							<Mark on={on} round /><span className="leading-snug">{labelOf(i)}</span>
						</button>
					);
				})}
			</div>
		);

	if (f.type === "checks") {
		const arr: string[] = Array.isArray(value) ? value : [];
		const NONE = "Нищо от изброените";
		const toggle = (o: string) => {
			if (o === NONE) return onChange(arr.includes(NONE) ? [] : [NONE]);
			onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr.filter((x) => x !== NONE), o]);
		};
		return (
			<div className="grid gap-2 sm:grid-cols-2">
				{f.options!.map((o, i) => {
					const on = arr.includes(o);
					return (
						<button key={o} type="button" onClick={() => toggle(o)} className={cx(OPT, on ? OPT_ON : OPT_OFF)}>
							<Mark on={on} /><span className="leading-snug">{labelOf(i)}</span>
						</button>
					);
				})}
			</div>
		);
	}

	return <input type={f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} placeholder={ph} className={INPUT} autoComplete={f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.id === "contactName" ? "name" : "off"} />;
}

function Ring({ score }: { score: number }) {
	const c = 2 * Math.PI * 34;
	return (
		<div className="relative w-24 h-24 flex-shrink-0">
			<svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
				<defs><linearGradient id="gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f26522" /><stop offset="1" stopColor="#f59c1a" /></linearGradient></defs>
				<circle cx="48" cy="48" r="34" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7" />
				<circle cx="48" cy="48" r="34" fill="none" stroke="url(#gs)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)" }} />
			</svg>
			<span className="absolute inset-0 grid place-items-center text-2xl font-display font-black text-brand-orange-l">{score}</span>
		</div>
	);
}

/* ── Обвивка ──────────────────────────────────────────────────────────── */
function Shell({ children, pct, lang, setLang, topRef }: { children: React.ReactNode; pct: number; lang: Lang; setLang: (l: Lang) => void; topRef: React.RefObject<HTMLDivElement | null> }) {
	return (
		<main className="min-h-screen bg-dark-obsidian text-gray-100">
			<div ref={topRef} className="relative w-full max-w-2xl mx-auto px-4 py-8 sm:py-14">
				{/* декоративни глоу-ове — в clip-нат слой, за да не създават втори скрол */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
					<div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[70px] opacity-60" style={{ background: "radial-gradient(circle, rgba(242,101,34,.16) 0%, transparent 65%)" }} />
					<div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blur-[70px] opacity-60" style={{ background: "radial-gradient(circle, rgba(245,156,26,.12) 0%, transparent 65%)" }} />
				</div>

				<div className="relative flex items-center justify-between mb-5">
					<Link href="/" className="font-display font-black tracking-tight text-lg">Digital<span className="text-brand-orange-l">Effect</span></Link>
					<div className="flex gap-1 rounded-full bg-white/5 p-1">
						{(["bg", "en"] as Lang[]).map((l) => (
							<button key={l} type="button" onClick={() => setLang(l)} className={cx("px-3 py-1 rounded-full text-xs font-semibold uppercase transition", lang === l ? "bg-brand-grad text-white" : "text-white/50 hover:text-white/80")}>{l}</button>
						))}
					</div>
				</div>

				<div className="relative rounded-2xl border border-white/10 bg-dark-surface/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,.6)]">
					<div className="h-1 rounded-full bg-white/[0.08] overflow-hidden mb-7">
						<div className="h-full rounded-full bg-brand-grad transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
					</div>
					{children}
				</div>
			</div>
		</main>
	);
}

/* ── Страницата ───────────────────────────────────────────────────────── */
export default function HelloPage() {
	const [lang, setLang] = useState<Lang>("bg");
	const [started, setStarted] = useState(false);
	const [step, setStep] = useState(0);
	const [a, setA] = useState<Answers>({});
	const [touched, setTouched] = useState(false);
	const [sending, setSending] = useState(false);
	const [err, setErr] = useState("");
	const [done, setDone] = useState<PublicReport | null>(null);
	// DE Partners: ?p=DE-… → пази се 90 дни, праща се като partnerCode (отделно
	// поле; meta.ref е Smart Reach линкът). Бадж само ако кодът е активен.
	const [partner, setPartner] = useState<{ code: string; name: string | null }>({ code: "", name: null });
	const t = T[lang];

	useEffect(() => {
		const code = resolvePartnerCode();
		if (!code) return;
		let alive = true;
		fetch(`/api/partners/check?code=${encodeURIComponent(code)}`)
			.then((r) => r.json())
			.then((d: { valid?: boolean; name?: string }) => { if (alive) setPartner({ code, name: d?.valid && d.name ? String(d.name).slice(0, 40) : null }); })
			.catch(() => { if (alive) setPartner({ code, name: null }); });
		return () => { alive = false; };
	}, []);

	const bh = useRef({ t0: 0, stepT0: 0, perStep: {} as Record<string, number>, revisits: 0, maxStep: 0 });
	const hpRef = useRef<HTMLInputElement>(null);
	const topRef = useRef<HTMLDivElement>(null);

	const set = useCallback((id: string, v: Val) => setA((p) => ({ ...p, [id]: v })), []);
	const current = STEPS[step];
	const fields = useMemo(() => current.fields.filter((f) => visible(f, a)), [current, a]);
	const missing = fields.filter((f) => f.required && !filled(a[f.id]));
	const last = step === STEPS.length - 1;
	const contactMissing = last && !filled(a.phone) && !filled(a.email);
	const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

	const begin = () => { bh.current.t0 = bh.current.stepT0 = Date.now(); setStarted(true); scrollTop(); };

	const go = (dir: 1 | -1) => {
		if (dir > 0) { setTouched(true); if (missing.length || contactMissing) return; }
		const now = Date.now();
		bh.current.perStep[current.id] = (bh.current.perStep[current.id] || 0) + (now - bh.current.stepT0);
		bh.current.stepT0 = now;
		const next = step + dir;
		if (next < bh.current.maxStep) bh.current.revisits += 1;
		bh.current.maxStep = Math.max(bh.current.maxStep, next);
		setTouched(false); setStep(next); scrollTop();
	};

	async function submit() {
		setTouched(true);
		if (missing.length || contactMissing) return;
		setSending(true); setErr("");
		const now = Date.now();
		bh.current.perStep[current.id] = (bh.current.perStep[current.id] || 0) + (now - bh.current.stepT0);
		const links = Object.fromEntries(Object.entries((a.presenceLinks || {}) as Record<string, string>).filter(([, v]) => v.trim()));
		const presenceUrl = Object.entries(links).map(([k, v]) => `${k}: ${v.trim()}`).join(" · ");
		const behaviour = {
			totalMs: now - bh.current.t0, perStepMs: bh.current.perStep, revisits: bh.current.revisits,
			textLen: (String(a.goal || "") + String(a.cost || "") + String(a.workedWhat || "")).length,
			optionalFilled: ["phone", "email", "workedWhat"].filter((k) => filled(a[k])).length + Object.keys(links).length,
		};
		try {
			const r = await fetch("/api/hello", {
				method: "POST", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...a, presenceLinks: links, presenceUrl, lang, behaviour, partnerCode: partner.code || undefined, website: hpRef.current?.value || "", meta: { ua: navigator.userAgent, ref: new URLSearchParams(window.location.search).get("ref") || "", referrer: document.referrer, ts: new Date().toISOString() } }),
			});
			if (!r.ok) throw new Error();
			setDone(publicReport(a)); scrollTop();
		} catch { setErr(t.errSend); } finally { setSending(false); }
	}

	const pct = !started ? 0 : done ? 100 : Math.round((step / STEPS.length) * 100);

	/* — интро — */
	if (!started)
		return (
			<Shell pct={pct} lang={lang} setLang={setLang} topRef={topRef}>
				{partner.name && (
					<div className="inline-flex items-center gap-2 rounded-full border border-brand-orange-l/30 bg-brand-orange-l/[0.08] px-3 py-1 text-xs text-gray-200 mb-4">
						<span className="w-1.5 h-1.5 rounded-full bg-brand-orange-l" />{t.referred} <span className="font-semibold">{partner.name}</span>
					</div>
				)}
				<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-brand-orange-l mb-3">{t.kicker}</div>
				<h1 className="font-display font-black text-3xl sm:text-4xl leading-[1.08] tracking-tight mb-4">{t.title[0]}<span className="bg-brand-grad-text bg-clip-text text-transparent">{t.title[1]}</span></h1>
				<p className="text-gray-400 text-[15px] leading-relaxed mb-8 max-w-prose">{t.sub}</p>
				<button type="button" onClick={begin} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] hover:shadow-[0_0_34px_rgba(242,101,34,.4)] transition">{t.start} →</button>
			</Shell>
		);

	/* — резултат — */
	if (done)
		return (
			<Shell pct={100} lang={lang} setLang={setLang} topRef={topRef}>
				<div className="flex items-start gap-5 mb-7">
					<Ring score={done.score} />
					<div className="min-w-0">
						<div className="text-[10px] font-extrabold tracking-[.18em] uppercase text-gray-500 mb-1">{t.kicker}</div>
						<h2 className="font-display font-black text-2xl tracking-tight leading-tight mb-1">{t.doneTitle}</h2>
						<p className="text-gray-400 text-[15px] leading-relaxed">{t.doneSub}</p>
						<span className="inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-orange-l/10 text-brand-orange-l border border-brand-orange-l/30">{t.badge}</span>
					</div>
				</div>
				<div className="grid gap-2.5 mb-6">
					{done.subScores.map((s) => (
						<div key={s.k}>
							<div className="flex items-baseline justify-between mb-1">
								<span className="text-sm text-gray-300">{lang === "en" ? s.k_en : s.k}</span>
								<span className="text-sm font-bold tabular-nums text-brand-orange-l">{s.v}</span>
							</div>
							<div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden"><div className="h-full rounded-full bg-brand-grad" style={{ width: `${s.v}%`, transition: "width 1s ease" }} /></div>
						</div>
					))}
				</div>
				{done.notes.length > 0 && (
					<div className="grid gap-2.5">
						{done.notes.map((n, i) => (
							<div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4">
								<div className="flex items-start gap-3">
									<span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange-l flex-shrink-0" />
									<div>
										<div className="font-semibold text-gray-100 text-[15px] leading-snug">{lang === "en" ? n.t_en : n.t}</div>
										<div className="text-gray-400 text-sm mt-1 leading-relaxed">{lang === "en" ? n.d_en : n.d}</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</Shell>
		);

	/* — стъпки — */
	return (
		<Shell pct={pct} lang={lang} setLang={setLang} topRef={topRef}>
			<div className="mb-6">
				<div className="text-[11px] font-extrabold tracking-[.18em] uppercase text-brand-orange-l mb-2">{t.step} {step + 1} {t.of} {STEPS.length} · {lang === "en" ? current.title_en : current.title}</div>
				<h2 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight">{lang === "en" ? current.lead_en : current.lead}</h2>
			</div>

			<div className="grid gap-5">
				{fields.map((f) => {
					const bad = touched && f.required && !filled(a[f.id]);
					return (
						<div key={f.id}>
							<label className="block text-[15px] font-semibold text-gray-200 mb-2 leading-snug">
								{lang === "en" ? f.label_en ?? f.label : f.label}{f.required && <span className="ml-1 text-brand-orange-l">*</span>}
							</label>
							<FieldInput f={f} value={a[f.id] as Val} lang={lang} onChange={(v) => set(f.id, v)} t={t} />
							{f.id === "presence" && (a.presence as string[] | undefined)?.filter((o) => LINK_PH[o]).map((o) => {
								const links = (a.presenceLinks || {}) as Record<string, string>;
								const i = f.options!.indexOf(o);
								return (
									<div key={o} className="mt-2 flex items-center gap-2">
										<span className="flex-shrink-0 w-28 sm:w-36 text-xs text-gray-500 text-right leading-tight">
											{lang === "en" && f.options_en ? f.options_en[i] : o}
										</span>
										<input
											type="text"
											value={links[o] || ""}
											onChange={(e) => set("presenceLinks", { ...links, [o]: e.target.value })}
											placeholder={LINK_PH[o][lang]}
											className={cx(INPUT, "py-2 text-sm")}
										/>
									</div>
								);
							})}
							{bad && <div className="text-xs mt-1.5 text-red-400">{t.reqField}</div>}
						</div>
					);
				})}
				{contactMissing && touched && <div className="text-xs text-red-400 -mt-2">{t.reqContact}</div>}
				{/* honeypot */}
				<input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute opacity-0 pointer-events-none h-0 w-0" aria-hidden="true" />
			</div>

			{err && <div className="mt-5 text-sm text-red-400">{err}</div>}

			<div className="mt-8 flex items-center gap-3">
				{step > 0 && <button type="button" onClick={() => go(-1)} className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 text-[15px] hover:text-gray-200 hover:border-white/20 transition">{t.back}</button>}
				<button type="button" disabled={sending} onClick={() => (last ? submit() : go(1))} className="flex-1 px-5 py-3 rounded-xl font-bold text-[15px] text-white bg-brand-grad shadow-[0_0_24px_rgba(242,101,34,.28)] transition disabled:opacity-50">
					{sending ? t.sending : last ? t.finish : t.next}
				</button>
			</div>

			{last && (
				<p className="mt-4 text-[12px] text-gray-500 leading-relaxed">
					{t.privacy[0]}<a href="/privacy" className="underline text-brand-orange-l">{t.privacy[1]}</a>{t.privacy[2]}
				</p>
			)}
		</Shell>
	);
}
