import { NextResponse } from "next/server";
import { Resend } from "resend";
import { profile, type Answers, type Behaviour, type Profile } from "@/lib/lead-scoring";

// ── /api/hello — Клиентомат: приема анкетата, смята профила НА СЪРВЪРА,
//    праща имейл с вердикта и препраща към de-os (панел + Telegram).
//    Профилът НИКОГА не се връща към браузъра.
export const runtime = "nodejs";

const FROM = "Digital Effect <zapitvane@digitaleffect.bg>";
// Env се чете при всяка заявка (не при import), за да не остане „запечен“ стар адрес
const notifyTo = () => process.env.HELLO_NOTIFY_EMAIL?.trim() || "contacts@digitaleffect.bg";
const deosUrl = () => process.env.DEOS_HELLO_URL?.trim() || "https://deos.digitaleffect.bg/api/hello";

// Лек rate limit — 10 заявки / 10 мин на IP (per процес; стига за форма)
const hits = new Map<string, number[]>();
function limited(ip: string) {
	const now = Date.now();
	const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
	arr.push(now);
	hits.set(ip, arr);
	return arr.length > 10;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const str = (v: unknown, max = 2000) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
	try {
		const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
		if (!body) return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });

		// Honeypot — ботовете попълват скритото поле → тих „успех“
		if (str(body.website)) return NextResponse.json({ ok: true });

		const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "?";
		if (limited(ip)) return NextResponse.json({ error: "Твърде много заявки." }, { status: 429 });

		const contactName = str(body.contactName, 120);
		const phone = str(body.phone, 40);
		const email = str(body.email, 160);
		if (!contactName || (!phone && !email))
			return NextResponse.json({ error: "Липсва контакт." }, { status: 400 });
		if (email && !isEmail(email))
			return NextResponse.json({ error: "Невалиден имейл." }, { status: 400 });

		// Само познатите полета, всяко ограничено по дължина
		const KEYS = ["name", "industry", "industryOther", "presence", "presenceUrl", "discovery", "leadsNow",
			"age", "team", "worked", "workedWhat", "spend", "spendResult", "goal", "cost", "clientValue",
			"capacity", "decider", "timeline", "budget"] as const;
		const answers: Answers = {};
		for (const k of KEYS) {
			const v = body[k];
			answers[k] = Array.isArray(v) ? v.map((x) => str(x, 80)).slice(0, 10) : str(v);
		}
		// Имена/линкове по канал (Стъпка 2) — само стрингове, ограничени
		const rawLinks = typeof body.presenceLinks === "object" && body.presenceLinks ? (body.presenceLinks as Record<string, unknown>) : {};
		const presenceLinks: Record<string, string> = {};
		for (const [k, v] of Object.entries(rawLinks).slice(0, 10)) {
			const val = str(v, 120);
			if (val) presenceLinks[str(k, 40)] = val;
		}
		answers.presenceLinks = presenceLinks;
		if (!answers.presenceUrl) answers.presenceUrl = Object.entries(presenceLinks).map(([k, v]) => `${k}: ${v}`).join(" · ");

		const behaviour: Behaviour = typeof body.behaviour === "object" && body.behaviour ? (body.behaviour as Behaviour) : {};
		const lang = body.lang === "en" ? "en" : "bg";
		const meta = { ...(typeof body.meta === "object" && body.meta ? body.meta : {}), ip };

		const p = profile(answers, behaviour);
		const lead: Lead = { ...answers, contactName, phone, email, lang, behaviour, meta };

		console.log(`[hello] ${p.play.key}/${p.priority.key} → mail:${process.env.RESEND_API_KEY ? notifyTo() : "OFF (няма RESEND_API_KEY)"} · deos:${deosUrl()}`);

		// 1) de-os първо (панел + Telegram), с един повторен опит — при рестарт на VPS-а
		//    първата заявка често пада. 2) Имейлът носи резултата, за да се вижда без логове.
		const deos = await forwardToDeos(lead, p);
		if (!deos.ok) console.error("[hello] de-os:", deos.error);
		if (process.env.RESEND_API_KEY) {
			try { await sendMail(lead, p, deos); } catch (e) { console.error("[hello] mail:", e); }
		}

		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error("[hello] POST:", e);
		return NextResponse.json({ error: "Възникна грешка." }, { status: 500 });
	}
}

/* ── имейл с вътрешния профил (само за нас) ────────────────────────────── */
type Lead = Answers & { contactName: string; phone: string; email: string; lang: string; behaviour: Behaviour; meta: Record<string, unknown> };
const s_ = (v: unknown) => (typeof v === "string" ? v : "");
const bar = (n: number) => "█".repeat(Math.round((n || 0) / 10)).padEnd(10, "░");
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function summary(s: Lead, p: Profile) {
	const F = p.flags;
	const mins = s.behaviour.totalMs ? (s.behaviour.totalMs / 60000).toFixed(1) : "—";
	return [
		`Ново попълване — ${s_(s.name) || s.contactName}`,
		``,
		`▸ ${p.play.label}: ${p.play.headline}`,
		`  ${p.play.move}`,
		``,
		`Приоритет: ${p.priority.label}`,
		``,
		`Платежоспособност  ${bar(p.axes.capacity)} ${p.axes.capacity}`,
		`Вяра в ефекта      ${bar(p.axes.belief)} ${p.axes.belief}`,
		`Готовност          ${bar(p.axes.intent)} ${p.axes.intent}`,
		`Съвместимост       ${bar(p.axes.fit)} ${p.axes.fit}`,
		``,
		F.red.length ? `⚠ Внимание:\n${F.red.map((x) => `  · ${x}`).join("\n")}` : "",
		F.green.length ? `✓ В твоя полза:\n${F.green.map((x) => `  · ${x}`).join("\n")}` : "",
		``,
		`Бранш: ${s_(s.industry) || "—"}${s_(s.industryOther) ? ` (${s_(s.industryOther)})` : ""}`,
		`Възраст: ${s_(s.age) || "—"} · Екип: ${s_(s.team) || "—"}`,
		`Онлайн: ${(Array.isArray(s.presence) ? s.presence : []).join(", ") || "—"}`,
		...Object.entries((s.presenceLinks as Record<string, string>) || {}).map(([k, v]) => `  · ${k}: ${v}`),
		`Намират ги: ${s_(s.discovery) || "—"} · От интернет: ${s_(s.leadsNow) || "—"}`,
		`Агенция: ${s_(s.worked) || "—"}${s_(s.workedWhat) ? ` → ${s_(s.workedWhat)}` : ""}`,
		`Реклама досега: ${s_(s.spend) || "—"}${s_(s.spendResult) ? ` → ${s_(s.spendResult)}` : ""}`,
		`Бюджет: ${s_(s.budget) || "—"} · Решава: ${s_(s.decider) || "—"} · Старт: ${s_(s.timeline) || "—"}`,
		`Стойност на клиент: ${s_(s.clientValue) || "—"} · Капацитет: ${s_(s.capacity) || "—"}`,
		``,
		`Цел: ${s_(s.goal) || "—"}`,
		`Цена на бездействието: ${s_(s.cost) || "— (пропуснато)"}`,
		``,
		`Попълвал: ${mins} мин · връщания: ${s.behaviour.revisits ?? "—"} · език: ${s.lang}`,
		`Контакт: ${s.contactName} · ${s.phone || "—"} · ${s.email || "—"}`,
		`Панел: https://deos.digitaleffect.bg/hello`,
	].filter((l) => l !== "").join("\n");
}

type Forward = { ok: boolean; id?: number; error?: string };

async function sendMail(s: Lead, p: Profile, deos: Forward) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	const text = summary(s, p) + "\n" + (deos.ok
		? `de-os: ✓ записан${deos.id ? ` (#${deos.id})` : ""} — виж панела`
		: `de-os: ⚠ НЕ Е ЗАПИСАН (${deos.error}) — попълването е само в този имейл`);
	const { error } = await resend.emails.send({
		from: FROM,
		to: notifyTo(),
		replyTo: s.email || undefined,
		subject: `Запитване от сайта — ${s_(s.name) || s.contactName} (${p.play.label})`,
		text,
		html: `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;color:#111;white-space:pre-wrap">${esc(text)}</pre>`,
	});
	if (error) throw new Error(`Resend: ${JSON.stringify(error)}`);
}

/* ── препращане към de-os (панел /hello + Telegram) — 2 опита ─────────────── */
async function forwardToDeos(s: Lead, p: Profile): Promise<Forward> {
	// challenge = cost за съвместимост със старата схема; score/profile — за новата
	const payload = JSON.stringify({ ...s, challenge: s.cost, score: p.score, profile: p, website: "" });
	let lastErr = "";
	for (let attempt = 1; attempt <= 2; attempt++) {
		const ctrl = new AbortController();
		const t = setTimeout(() => ctrl.abort(), 10000);
		try {
			const r = await fetch(deosUrl(), {
				method: "POST",
				headers: { "Content-Type": "application/json", Origin: "https://digitaleffect.bg" },
				body: payload,
				signal: ctrl.signal,
			});
			if (r.ok) {
				const j = (await r.json().catch(() => ({}))) as { id?: number };
				return { ok: true, id: j.id };
			}
			lastErr = `HTTP ${r.status}${r.status >= 500 ? " (сървърна грешка в de-os — виж pm2 logs)" : ""}`;
		} catch (e) {
			lastErr = e instanceof Error ? (e.name === "AbortError" ? "timeout 10s" : e.message) : String(e);
		} finally {
			clearTimeout(t);
		}
		if (attempt === 1) await new Promise((res) => setTimeout(res, 3000));
	}
	return { ok: false, error: lastErr };
}
