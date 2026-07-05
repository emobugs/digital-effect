"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Config ───────────────────────────────────────────────────────────────────
const API = "https://deos.digitaleffect.bg/api/hello";
const XP_PER = 15;
const TOTAL = 8;

type Lang = "bg" | "en";
type Opt = [string, string]; // [emoji, label]

interface Answers {
	name: string;
	industry: string;
	industryOther: string;
	presence: string[];
	presenceUrl: string;
	discovery: string;
	goal: string;
	challenge: string;
	budget: string;
	contactName: string;
	phone: string;
	email: string;
}

const EMPTY: Answers = {
	name: "", industry: "", industryOther: "", presence: [], presenceUrl: "",
	discovery: "", goal: "", challenge: "", budget: "", contactName: "", phone: "", email: "",
};

// ── i18n ─────────────────────────────────────────────────────────────────────
const T = {
	bg: {
		introKicker: "Открихте ни 👋",
		introTitle: ["Да опознаем ", "Вашия бранд"],
		introSub: "8 бързи нива · под 2 минути. Отговорете и ще получите мигновена оценка на онлайн присъствието си — а ние ще подготвим персонален анализ за Вас.",
		start: "Старт", level: "Ниво", next: "Напред", skip: "Пропусни",
		send: "Изпрати", sending: "Изпращане…",
		otherPh: "Опишете накратко…", urlPh: "Линк към сайт или профил (по избор)",
		q1: { t: "Как се казва Вашият бизнес?", s: "Началото на всяка добра история.", ph: "Име на бизнеса" },
		q2: { t: "В кой бранш работите?", s: "Изберете най-близкото.", o: [["🍽️", "Ресторант / Храна"], ["🛠️", "Услуги"], ["🛍️", "Търговия"], ["💆", "Здраве / Красота"], ["🏭", "Производство"], ["✨", "Друго"]] as Opt[] },
		q3: { t: "Къде Ви има онлайн?", s: "Изберете всичко, което важи.", o: [["🌐", "Сайт"], ["📘", "Facebook"], ["📸", "Instagram"], ["📍", "Google Business"], ["🎵", "TikTok"], ["🚀", "Нямам все още"]] as Opt[] },
		q4: { t: "Как клиентите Ви намират сега?", s: "Честно — няма грешен отговор.", o: [["🗣️", "Препоръки от уста на уста"], ["📱", "Социални мрежи"], ["🔎", "Google търсене"], ["📢", "Реклами"], ["🤷", "Трудно ме намират"]] as Opt[] },
		q5: { t: "Каква е основната Ви цел?", s: "Какво искате да постигнете?", o: [["📈", "Повече клиенти"], ["⭐", "Разпознаваемост на бранда"], ["🛒", "Онлайн продажби"], ["💻", "Нов / по-добър сайт"], ["🤖", "Автоматизация на процеси"]] as Opt[] },
		q6: { t: "Най-голямото Ви предизвикателство онлайн?", s: "Няколко думи са достатъчни.", ph: "Напр. „публикувам, но няма резултат…“" },
		q7: { t: "Месечен бюджет за маркетинг?", s: "Ориентировъчно — помага ни да предложим реалистичен план.", o: [["🌱", "До 150€"], ["🌿", "150 – 300€"], ["🌳", "300 – 600€"], ["🚀", "Над 600€"], ["🤔", "Още не знам"]] as Opt[] },
		q8: { t: "Как да се свържем с Вас?", s: "Ще Ви потърсим с готовия анализ — без спам, обещаваме.", name: "Вашето име", phone: "Телефон", email: "Имейл" },
		errName: "Моля, въведете име и телефон или имейл.",
		errSend: "Нещо се обърка. Опитайте отново.",
		doneKicker: "Мисията е изпълнена ✅",
		doneTitle: ["Вашият ", "Brand Score"],
		scoreCap: "от 100",
		badge: "Ще се свържем с Вас до 24 часа",
		doneSub: "Отговорите Ви са при нас. Екипът ни ще подготви персонален анализ и идеи за Вашия бранд.",
		verdicts: [
			"Има какво да се желае — но точно това е добрата новина: пред Вас стои най-стръмната крива на растеж. Първите правилни стъпки дават най-видим резултат.",
			"Имате основа, върху която може да се строи. С по-ясна посока и постоянство онлайн присъствието Ви може да заработи за Вас, а не обратното.",
			"Солидно начало! Браво. Следващата стъпка е присъствието Ви да започне да носи измерими резултати — клиенти, запитвания, продажби.",
			"Впечатляващо — Вие сте пред повечето бизнеси във Вашия бранш. Сега е моментът да превърнете това предимство в система, която расте сама.",
		],
	},
	en: {
		introKicker: "You found us 👋",
		introTitle: ["Let’s explore ", "your brand"],
		introSub: "8 quick levels · under 2 minutes. Answer and get an instant score of your online presence — we’ll prepare a personal analysis for you.",
		start: "Start", level: "Level", next: "Next", skip: "Skip",
		send: "Send", sending: "Sending…",
		otherPh: "Describe briefly…", urlPh: "Link to website or profile (optional)",
		q1: { t: "What’s your business called?", s: "Every good story starts here.", ph: "Business name" },
		q2: { t: "What industry are you in?", s: "Pick the closest one.", o: [["🍽️", "Restaurant / Food"], ["🛠️", "Services"], ["🛍️", "Retail"], ["💆", "Health / Beauty"], ["🏭", "Manufacturing"], ["✨", "Other"]] as Opt[] },
		q3: { t: "Where can we find you online?", s: "Select all that apply.", o: [["🌐", "Website"], ["📘", "Facebook"], ["📸", "Instagram"], ["📍", "Google Business"], ["🎵", "TikTok"], ["🚀", "Nowhere yet"]] as Opt[] },
		q4: { t: "How do customers find you now?", s: "Honestly — there’s no wrong answer.", o: [["🗣️", "Word of mouth"], ["📱", "Social media"], ["🔎", "Google search"], ["📢", "Ads"], ["🤷", "They struggle to find me"]] as Opt[] },
		q5: { t: "What’s your main goal?", s: "What do you want to achieve?", o: [["📈", "More customers"], ["⭐", "Brand awareness"], ["🛒", "Online sales"], ["💻", "New / better website"], ["🤖", "Process automation"]] as Opt[] },
		q6: { t: "Your biggest online challenge?", s: "A few words are enough.", ph: "E.g. “I post but see no results…”" },
		q7: { t: "Monthly marketing budget?", s: "A rough idea — helps us suggest a realistic plan.", o: [["🌱", "Up to €150"], ["🌿", "€150 – 300"], ["🌳", "€300 – 600"], ["🚀", "Over €600"], ["🤔", "Not sure yet"]] as Opt[] },
		q8: { t: "How can we reach you?", s: "We’ll get back with your analysis — no spam, promise.", name: "Your name", phone: "Phone", email: "Email" },
		errName: "Please enter a name and a phone or email.",
		errSend: "Something went wrong. Please try again.",
		doneKicker: "Mission complete ✅",
		doneTitle: ["Your ", "Brand Score"],
		scoreCap: "out of 100",
		badge: "We’ll contact you within 24 hours",
		doneSub: "Your answers are in. Our team will prepare a personal analysis and ideas for your brand.",
		verdicts: [
			"There’s room to grow — and that’s the good news: the steepest growth curve is ahead of you. The first right steps bring the most visible results.",
			"You have a foundation to build on. With a clearer direction and consistency, your online presence can start working for you.",
			"A solid start! The next step is turning your presence into measurable results — customers, inquiries, sales.",
			"Impressive — you’re ahead of most businesses in your industry. Now is the time to turn that edge into a system that grows on its own.",
		],
	},
} as const;

// ── Малки UI парчета ─────────────────────────────────────────────────────────
const inputCls =
	"w-full bg-dark-surface border border-white/[.07] rounded-[10px] px-[18px] py-4 text-white text-base font-medium outline-none transition-colors focus:border-brand-orange-l placeholder:text-white/25";

const btnCls =
	"cursor-pointer rounded-md px-8 py-[17px] font-display text-xs font-bold uppercase tracking-[2px] text-white bg-[linear-gradient(135deg,#e8450a,#f26522)] shadow-[0_4px_20px_rgba(232,69,10,.3)] transition active:scale-[.97] disabled:opacity-35 disabled:cursor-default";

function OptBtn({ emoji, label, selected, onClick }: { emoji: string; label: string; selected: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`opt-pop flex w-full items-center gap-3.5 rounded-[10px] border px-[18px] py-4 text-left text-[15px] font-medium transition active:scale-[.98] ${
				selected
					? "border-brand-orange-l bg-brand-orange/10 text-white"
					: "border-white/[.07] bg-dark-surface text-white/80 hover:border-brand-orange-l/50"
			}`}
		>
			<span className="text-xl shrink-0">{emoji}</span>
			{label}
		</button>
	);
}

function Confetti() {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		const ctx = cv.getContext("2d");
		if (!ctx) return;
		cv.width = window.innerWidth;
		cv.height = window.innerHeight;
		const colors = ["#c0300a", "#e8450a", "#f26522", "#f59c1a", "#ffffff"];
		const P = Array.from({ length: 110 }, () => ({
			x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
			w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
			v: 2 + Math.random() * 3.2, r: Math.random() * Math.PI,
			vr: (Math.random() - 0.5) * 0.22,
			c: colors[(Math.random() * colors.length) | 0],
			sway: Math.random() * 2 * Math.PI,
		}));
		let frames = 0;
		let raf = 0;
		const loop = () => {
			ctx.clearRect(0, 0, cv.width, cv.height);
			for (const p of P) {
				p.y += p.v; p.x += Math.sin((p.sway += 0.04)) * 1.2; p.r += p.vr;
				ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
				ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
			}
			if (++frames < 340) raf = requestAnimationFrame(loop);
			else ctx.clearRect(0, 0, cv.width, cv.height);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);
	return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-40" />;
}

// ── Страницата ───────────────────────────────────────────────────────────────
export default function HelloPage() {
	const [lang, setLang] = useState<Lang>("bg");
	const [step, setStep] = useState(0);
	const [xp, setXp] = useState(0);
	const [a, setA] = useState<Answers>(EMPTY);
	const [toastKey, setToastKey] = useState(0);
	const [sending, setSending] = useState(false);
	const [err, setErr] = useState("");
	const hpRef = useRef<HTMLInputElement>(null);
	const t = T[lang];

	useEffect(() => { window.scrollTo(0, 0); }, [step]);

	const advance = useCallback(() => {
		setXp((x) => x + XP_PER);
		setToastKey((k) => k + 1);
		setStep((s) => s + 1);
	}, []);

	const set = (patch: Partial<Answers>) => setA((prev) => ({ ...prev, ...patch }));

	// ── Brand Score ──
	const score = (() => {
		let s = 22;
		const none = a.presence.length === 1 && (a.presence[0] === "Нямам все още" || a.presence[0] === "Nowhere yet");
		if (!none) s += Math.min(a.presence.length, 5) * 9;
		if (a.presenceUrl) s += 6;
		if (/Google|Реклами|Ads/.test(a.discovery)) s += 12;
		else if (/Социални|Social/.test(a.discovery)) s += 8;
		else if (/Препоръки|Word/.test(a.discovery)) s += 5;
		if (/над|Over|300/.test(a.budget)) s += 8;
		return Math.max(15, Math.min(94, s));
	})();

	async function submit() {
		if (!a.contactName || (!a.phone && !a.email)) { setErr(t.errName); return; }
		setErr(""); setSending(true);
		try {
			const r = await fetch(API, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...a, lang, score, xp: xp + XP_PER,
					website: hpRef.current?.value || "", // honeypot
					meta: { ua: navigator.userAgent, ref: document.referrer, ts: new Date().toISOString() },
				}),
			});
			if (!r.ok) throw new Error();
			advance();
		} catch {
			setErr(t.errSend);
		} finally {
			setSending(false);
		}
	}

	// ── Екрани ──
	const single = (q: { t: string; s: string; o: Opt[] }, key: keyof Answers, allowOther = false) => {
		const isOtherSel = allowOther && a[key] === q.o[q.o.length - 1][1];
		return (
			<>
				<h2 className="font-display text-[clamp(22px,6vw,30px)] font-black leading-[1.1] tracking-[-.5px] mb-2">{q.t}</h2>
				<p className="text-white/50 text-[15px] leading-relaxed mb-6">{q.s}</p>
				<div className="flex flex-col gap-2.5">
					{q.o.map(([emoji, label], i) => (
						<OptBtn
							key={label}
							emoji={emoji}
							label={label}
							selected={a[key] === label}
							onClick={() => {
								set({ [key]: label } as Partial<Answers>);
								const isOther = allowOther && i === q.o.length - 1;
								if (!isOther) setTimeout(advance, 320);
							}}
						/>
					))}
				</div>
				{isOtherSel && (
					<div className="mt-2.5 flex flex-col gap-4">
						<input
							className={inputCls}
							placeholder={t.otherPh}
							value={a.industryOther}
							onChange={(e) => set({ industryOther: e.target.value })}
							onKeyDown={(e) => e.key === "Enter" && advance()}
						/>
						<div><button type="button" className={btnCls} onClick={advance}>{t.next} →</button></div>
					</div>
				)}
			</>
		);
	};

	const screens: Record<number, React.ReactNode> = {
		0: (
			<>
				<div className="font-display text-[11px] font-bold uppercase tracking-[3px] text-brand-orange-l mb-3.5">{t.introKicker}</div>
				<h1 className="font-display text-[clamp(30px,8vw,44px)] font-black uppercase leading-[1.02] tracking-[-1px] mb-4">
					{t.introTitle[0]}
					<span className="bg-brand-grad-text bg-clip-text text-transparent">{t.introTitle[1]}</span>
				</h1>
				<p className="text-white/50 text-[15px] leading-relaxed mb-7">{t.introSub}</p>
				<button type="button" className={`${btnCls} w-full py-5 text-[13px]`} onClick={() => setStep(1)}>
					{t.start} →
				</button>
			</>
		),
		1: (
			<>
				<h2 className="font-display text-[clamp(22px,6vw,30px)] font-black leading-[1.1] tracking-[-.5px] mb-2">{t.q1.t}</h2>
				<p className="text-white/50 text-[15px] leading-relaxed mb-6">{t.q1.s}</p>
				<input
					className={inputCls}
					placeholder={t.q1.ph}
					autoComplete="organization"
					value={a.name}
					onChange={(e) => set({ name: e.target.value })}
					onKeyDown={(e) => e.key === "Enter" && a.name.trim() && advance()}
				/>
				<div className="mt-6">
					<button type="button" className={btnCls} disabled={!a.name.trim()} onClick={advance}>{t.next} →</button>
				</div>
			</>
		),
		2: single(t.q2, "industry", true),
		3: (
			<>
				<h2 className="font-display text-[clamp(22px,6vw,30px)] font-black leading-[1.1] tracking-[-.5px] mb-2">{t.q3.t}</h2>
				<p className="text-white/50 text-[15px] leading-relaxed mb-6">{t.q3.s}</p>
				<div className="flex flex-col gap-2.5">
					{t.q3.o.map(([emoji, label], i) => {
						const noneLabel = t.q3.o[t.q3.o.length - 1][1];
						const isNone = i === t.q3.o.length - 1;
						return (
							<OptBtn
								key={label}
								emoji={emoji}
								label={label}
								selected={a.presence.includes(label)}
								onClick={() => {
									if (isNone) { set({ presence: [label] }); return; }
									const base = a.presence.filter((p) => p !== noneLabel);
									set({
										presence: base.includes(label) ? base.filter((p) => p !== label) : [...base, label],
									});
								}}
							/>
						);
					})}
				</div>
				<input
					className={`${inputCls} mt-2.5`}
					placeholder={t.urlPh}
					inputMode="url"
					value={a.presenceUrl}
					onChange={(e) => set({ presenceUrl: e.target.value })}
				/>
				<div className="mt-6">
					<button type="button" className={btnCls} onClick={advance}>{t.next} →</button>
				</div>
			</>
		),
		4: single(t.q4, "discovery"),
		5: single(t.q5, "goal"),
		6: (
			<>
				<h2 className="font-display text-[clamp(22px,6vw,30px)] font-black leading-[1.1] tracking-[-.5px] mb-2">{t.q6.t}</h2>
				<p className="text-white/50 text-[15px] leading-relaxed mb-6">{t.q6.s}</p>
				<textarea
					className={`${inputCls} min-h-[110px] resize-y`}
					placeholder={t.q6.ph}
					value={a.challenge}
					onChange={(e) => set({ challenge: e.target.value })}
				/>
				<div className="mt-6 flex items-center gap-2.5">
					<button type="button" className={btnCls} onClick={advance}>{t.next} →</button>
					<button
						type="button"
						className="cursor-pointer px-2.5 py-[17px] font-display text-xs font-semibold uppercase tracking-[1px] text-white/50 hover:text-white/80 transition-colors"
						onClick={() => { set({ challenge: "" }); advance(); }}
					>
						{t.skip}
					</button>
				</div>
			</>
		),
		7: single(t.q7, "budget"),
		8: (
			<>
				<h2 className="font-display text-[clamp(22px,6vw,30px)] font-black leading-[1.1] tracking-[-.5px] mb-2">{t.q8.t}</h2>
				<p className="text-white/50 text-[15px] leading-relaxed mb-6">{t.q8.s}</p>
				{(
					[
						{ label: t.q8.name, key: "contactName", type: "text", ac: "name", ph: "" },
						{ label: t.q8.phone, key: "phone", type: "tel", ac: "tel", ph: "+359 …" },
						{ label: t.q8.email, key: "email", type: "email", ac: "email", ph: "name@email.com" },
					] as const
				).map((f) => (
					<div key={f.key} className="mb-3">
						<label className="block font-display text-[10px] font-bold uppercase tracking-[2px] text-white/50 mb-2">{f.label}</label>
						<input
							className={inputCls}
							type={f.type}
							autoComplete={f.ac}
							placeholder={f.ph}
							value={a[f.key]}
							onChange={(e) => set({ [f.key]: e.target.value } as Partial<Answers>)}
						/>
					</div>
				))}
				<input ref={hpRef} type="text" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] opacity-0" aria-hidden />
				{err && <div className="text-[#ff6b4a] text-[13px] mt-2.5">{err}</div>}
				<div className="mt-6">
					<button type="button" className={`${btnCls} w-full py-5 text-[13px]`} disabled={sending} onClick={submit}>
						{sending ? t.sending : `${t.send} 🚀`}
					</button>
				</div>
			</>
		),
		9: <DoneScreen t={t} score={score} />,
	};

	const hudVisible = step >= 1 && step <= TOTAL;

	return (
		<main className="relative mx-auto flex min-h-dvh max-w-[560px] flex-col px-5 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
			<div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(232,69,10,.12),transparent_60%)]" />

			{/* Top bar */}
			<div className="relative flex items-center justify-between gap-3 mb-2">
				<div className="font-display text-[15px] font-black uppercase tracking-[2px]">
					DIGITAL <span className="bg-brand-grad-text bg-clip-text text-transparent">EFFECT</span>
				</div>
				<div className="flex overflow-hidden rounded-[20px] border border-white/[.07]">
					{(["bg", "en"] as Lang[]).map((l) => (
						<button
							key={l}
							type="button"
							onClick={() => setLang(l)}
							className={`px-3 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[1px] transition ${
								lang === l ? "bg-[linear-gradient(135deg,#e8450a,#f26522)] text-white" : "text-white/50"
							}`}
						>
							{l}
						</button>
					))}
				</div>
			</div>

			{/* HUD */}
			{hudVisible && (
				<div className="relative mt-3.5 mb-1.5 flex items-center gap-3.5">
					<div className="whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[2px] text-white/50">
						{t.level} <b className="text-white">{step}</b>/{TOTAL}
					</div>
					<div className="h-2 flex-1 overflow-hidden rounded-lg border border-white/[.07] bg-dark-surface">
						<i
							className="block h-full rounded-lg bg-brand-grad transition-[width] duration-500"
							style={{ width: `${((step - 1) / TOTAL) * 100}%` }}
						/>
					</div>
					<div className="min-w-[64px] whitespace-nowrap text-right font-display text-[13px] font-black bg-brand-grad-text bg-clip-text text-transparent">
						{xp} XP
					</div>
				</div>
			)}

			{/* XP toast */}
			{toastKey > 0 && (
				<div key={toastKey} className="hello-toast pointer-events-none fixed left-1/2 top-[18%] z-50 font-display text-[22px] font-black bg-brand-grad-text bg-clip-text text-transparent">
					+{XP_PER} XP
				</div>
			)}

			{/* Stage — my-auto центрира при място и деградира при overflow */}
			<div className="relative flex min-h-0 flex-1 flex-col">
				<div key={step} className="hello-screen my-auto py-3.5">{screens[step]}</div>
			</div>

			{step === 9 && <Confetti />}

			<div className="relative pt-3.5 pb-1.5 text-center text-[11px] text-white/25">
				<a href="https://digitaleffect.bg" className="text-white/50 no-underline">digitaleffect.bg</a>
			</div>

			<style>{`
				@keyframes helloSlideIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
				.hello-screen{animation:helloSlideIn .45s cubic-bezier(.22,1,.36,1) both}
				@keyframes helloToast{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}25%{opacity:1;transform:translate(-50%,0) scale(1.1)}60%{opacity:1}100%{opacity:0;transform:translate(-50%,-26px)}}
				.hello-toast{animation:helloToast 1s ease both;transform:translateX(-50%)}
				@keyframes helloDot{0%,100%{box-shadow:0 0 0 0 rgba(242,101,34,.5)}50%{box-shadow:0 0 0 7px rgba(242,101,34,0)}}
				.hello-dot{animation:helloDot 1.6s infinite}
			`}</style>
		</main>
	);
}

// ── Финален екран ────────────────────────────────────────────────────────────
function DoneScreen({ t, score }: { t: (typeof T)["bg"] | (typeof T)["en"]; score: number }) {
	const C = 2 * Math.PI * 85; // ≈534
	const [off, setOff] = useState(C);
	const [num, setNum] = useState(0);

	useEffect(() => {
		const raf = requestAnimationFrame(() => setOff(C - (C * score) / 100));
		let n = 0;
		const iv = setInterval(() => {
			n = Math.min(score, n + Math.ceil(score / 45));
			setNum(n);
			if (n >= score) clearInterval(iv);
		}, 30);
		return () => { cancelAnimationFrame(raf); clearInterval(iv); };
	}, [C, score]);

	const verdict = t.verdicts[score < 40 ? 0 : score < 58 ? 1 : score < 76 ? 2 : 3];

	return (
		<div className="text-center">
			<div className="font-display text-[11px] font-bold uppercase tracking-[3px] text-brand-orange-l mb-3.5">{t.doneKicker}</div>
			<h2 className="font-display text-[clamp(26px,7vw,36px)] font-black leading-[1.1] tracking-[-.5px]">
				{t.doneTitle[0]}
				<span className="bg-brand-grad-text bg-clip-text text-transparent">{t.doneTitle[1]}</span>
			</h2>

			<div className="relative mx-auto my-6 h-[190px] w-[190px]">
				<svg viewBox="0 0 190 190" className="h-full w-full -rotate-90">
					<defs>
						<linearGradient id="helloMg" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stopColor="#c0300a" />
							<stop offset=".5" stopColor="#e8450a" />
							<stop offset="1" stopColor="#f59c1a" />
						</linearGradient>
					</defs>
					<circle cx="95" cy="95" r="85" fill="none" stroke="#111214" strokeWidth="12" />
					<circle
						cx="95" cy="95" r="85" fill="none" stroke="url(#helloMg)" strokeWidth="12" strokeLinecap="round"
						strokeDasharray={C} strokeDashoffset={off}
						style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)" }}
					/>
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<div className="font-display text-[46px] font-black leading-none bg-brand-grad-text bg-clip-text text-transparent">{num}</div>
					<div className="mt-1.5 font-display text-[10px] font-bold uppercase tracking-[2px] text-white/50">{t.scoreCap}</div>
				</div>
			</div>

			<div className="rounded-[10px] border border-white/[.07] border-l-[3px] border-l-brand-orange-l bg-dark-surface p-[18px] text-left text-sm leading-[1.65] text-white/80">
				{verdict}
			</div>
			<p className="text-white/50 text-[15px] leading-relaxed mt-[18px]">{t.doneSub}</p>
			<div className="mt-[22px] inline-flex items-center gap-2.5 rounded-[30px] border border-brand-orange-l/40 px-5 py-[13px] font-display text-xs font-bold uppercase tracking-[1.5px]">
				<span className="hello-dot h-2 w-2 rounded-full bg-brand-orange-l" />
				{t.badge}
			</div>
		</div>
	);
}
