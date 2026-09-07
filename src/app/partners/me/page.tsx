"use client";

// ── /partners/me — кабинетът на партньора ───────────────────────────────────
// Вход с личния линк от имейла (?k=<token>); после сесията е httpOnly cookie,
// сложен от /api/partners/me — нищо тайно не стои в localStorage. Кодът и
// телефонът служат само за „изпрати ми линка наново“. Показва само неговото:
// лидове, сделки (без суми на клиента), начисления, плащания, ниво.

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, Card, Kicker, H2, Note, INPUT, BTN, BTN_GHOST, cx } from "../ui";
import { normalizeCode } from "@/lib/partner-ref";
import { useRouter } from "next/navigation";

type Cabinet = {
	name: string; code: string; status: string; pay_method: "cash" | "credit"; is_client: boolean; link: string; qr: string | null;
	tier: { activeClients: number; rate: number; nextTier: { min: number; rate: number; need: number } | null };
	tiers: { min: number; rate: number }[]; level2_rate: number; min_payout: number; credit_bonus: number;
	leads: { business_name: string; status: string; source: string; created_at: string }[];
	deals: { client_name: string; kind: string; status: string; first_paid_at: string; months: number; monthly_value: number; rate: number; commission: number }[];
	monthly_estimate: number;
	accruals: { period: string; kind: string; amount: number; client_name: string | null; paid: boolean }[];
	payouts: { amount: number; method: string; paid_at: string }[];
	totals: { earned: number; paid: number; unpaid: number };
	subPartners: { name: string; clients: number; override_total: number }[];
};

const pct = (r: number) => `${Math.round(r * 1000) / 10} %`;
const eur = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("bg-BG")} €`;
const dt = (s: string) => (s ? String(s).slice(0, 10) : "—");
const LEAD = { lead: "Попълнил анкетата", contacted: "Свързахме се", client: "Клиент", lost: "Не се брои" } as const;
const DEAL = { active: "Активен", paused: "Пауза", ended: "Приключен", expired: "Изтекъл срок" } as const;
const KIND = { direct: "клиент", override: "партньор", project: "проект" } as const;

export default function PartnerCabinetPage() {
	const router = useRouter();
	const [code, setCode] = useState("");
	const [phone, setPhone] = useState("");
	const [busy, setBusy] = useState(true);
	const [err, setErr] = useState("");
	const [sent, setSent] = useState(false);
	const [cab, setCab] = useState<Cabinet | null>(null);

	async function load(token: string) {
		setBusy(true); setErr("");
		try {
			const r = await fetch("/api/partners/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(token ? { token } : {}) });
			if (r.status === 404) { if (token) setErr("Линкът не е валиден или е сменен. Поискайте нов по-долу."); return; }
			if (r.status === 429) throw new Error("Твърде много опити. Опитайте след няколко минути.");
			if (!r.ok) throw new Error("Нещо се обърка. Опитайте пак.");
			setCab((await r.json()) as Cabinet);
		} catch (e) { setErr(e instanceof Error ? e.message : "Грешка"); } finally { setBusy(false); }
	}

	useEffect(() => {
		// ?k=<token> от имейла → вход; иначе опит с cookie-то от предишен вход.
		let token = "";
		try {
			token = new URLSearchParams(window.location.search).get("k")?.toLowerCase() || "";
			if (token) window.history.replaceState(null, "", "/partners/me"); // махаме тайната от адреса/историята
		} catch { /* */ }
		// eslint-disable-next-line react-hooks/set-state-in-effect -- вход при mount; load сетва state след fetch
		void load(token);
	}, []);

	async function resend() {
		const nc = normalizeCode(code);
		if (!nc || phone.replace(/\D/g, "").length < 9) { setErr("Въведете код и телефон."); return; }
		setBusy(true); setErr("");
		try {
			await fetch("/api/partners/me", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: nc, phone, resend: true }) });
			setSent(true);
		} catch { setErr("Нещо се обърка. Опитайте пак."); } finally { setBusy(false); }
	}

	async function setPay(method: "cash" | "credit") {
		if (!cab) return;
		try {
			const r = await fetch("/api/partners/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pay_method: method }) });
			if (r.ok) setCab({ ...cab, pay_method: method });
			else setErr(((await r.json().catch(() => ({}))) as { error?: string }).error || "Не може да се смени.");
		} catch { /* игнорираме */ }
	}

	async function logout() {
		try { await fetch("/api/partners/me", { method: "DELETE" }); } catch { /* */ }
		setCab(null); setCode(""); setPhone(""); router.refresh();
	}

	if (!cab) {
		return (
			<Shell>
				<Card>
					<Kicker>Кабинет на партньора</Kicker>
					{busy && !sent ? <Note>Зареждаме…</Note> : sent ? (
						<>
							<H2>Ако данните съвпадат, линкът е в пощата Ви.</H2>
							<Note>Отворете имейла от partners@digitaleffect.bg и натиснете линка за кабинета. Проверете и папка „Спам“.</Note>
						</>
					) : (
						<>
							<H2>Кабинетът се отваря от личния Ви линк.</H2>
							<Note>Линкът е в имейла, който получихте при регистрация/одобрение. Ако не го намирате — въведете кода и телефона си и ще Ви го пратим отново.</Note>
							<div className="grid sm:grid-cols-2 gap-3 mt-5">
								<input className={cx(INPUT, "font-mono uppercase")} placeholder="DE-IVAN-7K3Q" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoComplete="off" />
								<input className={INPUT} placeholder="Телефон" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" onKeyDown={(e) => e.key === "Enter" && resend()} />
							</div>
							{err && <div className="mt-3 text-sm text-red-400">{err}</div>}
							<div className="flex flex-wrap gap-3 mt-5">
								<button type="button" className={BTN} disabled={busy} onClick={resend}>Изпрати ми линка</button>
								<Link href="/partners" className={BTN_GHOST}>Нямам код</Link>
							</div>
						</>
					)}
				</Card>
			</Shell>
		);
	}

	const next = cab.tier.nextTier;
	return (
		<Shell wide>
			<Card>
				<div className="flex items-start justify-between gap-3 flex-wrap">
					<div>
						<Kicker>Кабинет</Kicker>
						<H2>{cab.name}</H2>
						<div className="text-sm text-gray-400">Код <span className="font-mono text-gray-100">{cab.code}</span> · {cab.status === "active" ? <span className="text-emerald-400">активен</span> : cab.status === "paused" ? <span className="text-blue-300">на пауза</span> : cab.status}</div>
					</div>
					<button type="button" className={BTN_GHOST} onClick={logout}>Излез</button>
				</div>
				<div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
					{[["Ниво", pct(cab.tier.rate)], ["Активни клиенти", String(cab.tier.activeClients)], ["≈ На месец", eur(cab.monthly_estimate || 0)], ["Начислено", eur(cab.totals.earned)], ["За изплащане", eur(cab.totals.unpaid)]].map(([l, v]) => (
						<div key={l} className="rounded-xl bg-black/30 border border-white/10 p-3">
							<div className="text-[11px] uppercase tracking-[.14em] text-gray-500">{l}</div>
							<div className="font-display font-black text-xl mt-0.5">{v}</div>
						</div>
					))}
				</div>
				{next && <div className="mt-3 text-sm text-brand-orange-l">Още {next.need} {next.need === 1 ? "клиент" : "клиента"} до {pct(next.rate)} — и то за всичките Ви клиенти.</div>}
				{cab.totals.unpaid > 0 && cab.totals.unpaid < cab.min_payout && <div className="mt-1 text-xs text-gray-500">Изплащаме при натрупани {eur(cab.min_payout)} — сумата се прехвърля към следващия месец.</div>}
				<div className="mt-5 rounded-xl bg-black/40 border border-white/10 px-4 py-3 font-mono text-sm break-all">{cab.link}</div>
				<div className="flex flex-wrap gap-3 mt-3">
					<button type="button" className={BTN} onClick={async () => { try { await navigator.clipboard.writeText(cab.link); } catch { /* */ } }}>Копирай линка</button>
					{cab.qr && <details className="w-full"><summary className="cursor-pointer text-sm text-gray-400">Покажи QR</summary><div className="mt-3 rounded-xl bg-white p-3 w-40 h-40 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: cab.qr }} /></details>}
				</div>
			</Card>

			<Card>
				<Kicker>Доведени бизнеси ({cab.leads.length})</Kicker>
				{cab.leads.length === 0 && <Note>Още няма попълвания през Вашия линк. Споделете го — всичко попълнено се появява тук.</Note>}
				<div className="divide-y divide-white/[.06]">
					{cab.leads.map((l, i) => (
						<div key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
							<span className="text-gray-100 truncate">{l.business_name || "Бизнес"}</span>
							<span className={cx("text-xs flex-shrink-0", l.status === "client" ? "text-emerald-400" : l.status === "lost" ? "text-gray-600" : "text-gray-400")}>{LEAD[l.status as keyof typeof LEAD] || l.status} · {dt(l.created_at)}</span>
						</div>
					))}
				</div>
			</Card>

			{cab.deals.length > 0 && (
				<Card>
					<Kicker>Клиенти ({cab.deals.length})</Kicker>
					<div className="divide-y divide-white/[.06]">
						{cab.deals.map((d, i) => (
							<div key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm flex-wrap">
								<span className="text-gray-100 truncate min-w-0">{d.client_name} <span className="text-gray-500">· {d.kind === "project" ? `проект ${eur(d.monthly_value)}` : `${eur(d.monthly_value)}/мес, ${d.months} мес.`}</span></span>
								<span className="text-xs text-gray-400 flex-shrink-0">{DEAL[d.status as keyof typeof DEAL] || d.status} · от {dt(d.first_paid_at)}</span>
								<span className="text-sm font-semibold text-brand-orange-l flex-shrink-0 tabular-nums">{pct(d.rate)} → {eur(d.commission)}{d.kind === "project" ? "" : "/мес"}</span>
							</div>
						))}
					</div>
					<div className="text-xs text-gray-500 mt-3">Процентът е текущото Ви ниво и се преизчислява всеки месец; при следващ клиент расте за всички сделки.</div>
				</Card>
			)}

			{cab.subPartners.length > 0 && (
				<Card>
					<Kicker>Доведени партньори ({cab.subPartners.length})</Kicker>
					<Note>Получавате {pct(cab.level2_rate)} от клиентите на партньорите, които сте довели.</Note>
					<div className="divide-y divide-white/[.06] mt-2">
						{cab.subPartners.map((s, i) => (
							<div key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
								<span className="text-gray-100">{s.name} <span className="text-gray-500">· {s.clients} активни клиента</span></span>
								<span className="text-xs text-gray-400">{eur(s.override_total)} начислени</span>
							</div>
						))}
					</div>
				</Card>
			)}

			<Card>
				<Kicker>Начисления и плащания</Kicker>
				{cab.accruals.length === 0 && <Note>Първото начисление идва в началото на месеца след първото плащане на Ваш клиент.</Note>}
				<div className="divide-y divide-white/[.06]">
					{cab.accruals.map((a, i) => (
						<div key={i} className="flex items-center gap-3 py-2 text-sm">
							<span className="font-mono text-gray-500 w-16 flex-shrink-0">{a.period}</span>
							<span className="text-gray-200 flex-1 truncate">{a.client_name || "—"} <span className="text-gray-500">· {KIND[a.kind as keyof typeof KIND] || a.kind}</span></span>
							<span className="font-semibold tabular-nums">{eur(a.amount)}</span>
							<span className={cx("text-xs w-16 text-right", a.paid ? "text-emerald-400" : "text-gray-500")}>{a.paid ? "платено" : "чака"}</span>
						</div>
					))}
				</div>
				{cab.payouts.length > 0 && (
					<div className="mt-4 space-y-1">
						{cab.payouts.map((p, i) => <div key={i} className="text-xs text-emerald-300/80">Изплатено {eur(p.amount)} · {p.method === "credit" ? "кредит срещу услуга" : "банков превод"} · {dt(p.paid_at)}</div>)}
					</div>
				)}
			</Card>

			<Card>
				<Kicker>Начин на изплащане</Kicker>
				<div className="flex flex-wrap gap-2">
					{([["cash", "Банков превод"], ["credit", `Кредит срещу услуга (+${pct(cab.credit_bonus)})`]] as const).filter(([v]) => v === "cash" || cab.is_client).map(([v, l]) => (
						<button key={v} type="button" onClick={() => setPay(v)} className={cx("rounded-full px-3 py-1.5 text-sm border transition", cab.pay_method === v ? "border-brand-orange-l/50 bg-brand-orange-l/[0.08] text-gray-100" : "border-white/10 text-gray-400")}>{l}</button>
					))}
				</div>
				{err && <div className="mt-2 text-sm text-red-400">{err}</div>}
				<Note>Банковите данни ни пращате на partners@digitaleffect.bg при първото изплащане — не ги събираме през сайта.</Note>
			</Card>
		</Shell>
	);
}
