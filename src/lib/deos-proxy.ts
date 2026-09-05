// ── Proxy към de-os за публичните партньорски endpoint-и ────────────────────
// Браузърът никога не говори директно с de-os: сайтът добавя споделената
// тайна (DEOS_HELLO_SECRET = HELLO_SECRET в de-os) и препраща. Същият модел
// като /api/hello. Env се чете при всяка заявка.
import { NextResponse } from "next/server";

const base = () => (process.env.DEOS_PARTNERS_URL?.trim() || "https://deos.digitaleffect.bg/api/partners").replace(/\/$/, "");
const secret = () => process.env.DEOS_HELLO_SECRET?.trim() || "";

// Лек per-process rate limit — първата стена е тук, втората е в de-os.
const buckets = new Map<string, Map<string, number[]>>();
export function limited(bucket: string, ip: string, max: number, windowMs: number): boolean {
	const now = Date.now();
	const m = buckets.get(bucket) ?? new Map<string, number[]>();
	buckets.set(bucket, m);
	const arr = (m.get(ip) ?? []).filter((t) => now - t < windowMs);
	arr.push(now);
	m.delete(ip); m.set(ip, arr); // най-скорошният — накрая
	if (m.size > 5000) { // пази паметта при бот-вълна: маха 1/5 от най-старите, не всичко
		let n = 1000;
		for (const k of m.keys()) { if (n-- <= 0) break; m.delete(k); }
	}
	return arr.length > max;
}

/**
 * IP на браузъра. Клиентът може сам да прати X-Forwarded-For — proxy-то на
 * хостинга ДОБАВЯ своя запис накрая, затова взимаме последния hop (сложен от
 * доверения proxy), или x-real-ip ако хостингът го дава.
 */
export const ipOf = (req: Request) => {
	const real = req.headers.get("x-real-ip")?.trim();
	if (real) return real;
	const hops = (req.headers.get("x-forwarded-for") || "").split(",").map((s) => s.trim()).filter(Boolean);
	return hops.at(-1) || "?";
};

export async function proxy(path: string, init: { method: "GET" | "POST" | "PATCH"; body?: unknown; ip?: string }, timeoutMs = 10000) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const r = await fetch(`${base()}${path}`, {
			method: init.method,
			headers: {
				"Content-Type": "application/json",
				Origin: "https://digitaleffect.bg",
				...(secret() ? { "X-Hello-Secret": secret() } : {}),
				...(init.ip ? { "X-Forwarded-For": init.ip } : {}),
			},
			body: init.body === undefined ? undefined : JSON.stringify(init.body),
			signal: ctrl.signal,
			cache: "no-store",
		});
		const data = await r.json().catch(() => ({}));
		return NextResponse.json(data, { status: r.status, headers: { "Cache-Control": "no-store" } });
	} catch (e) {
		const msg = e instanceof Error && e.name === "AbortError" ? "timeout" : "unreachable";
		console.error(`[partners-proxy] ${init.method} ${path}: ${msg}`);
		return NextResponse.json({ error: "Услугата е временно недостъпна." }, { status: 503 });
	} finally {
		clearTimeout(t);
	}
}

export const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
