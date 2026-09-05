import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { proxy, limited, ipOf, str } from "@/lib/deos-proxy";
import { normalizeCode } from "@/lib/partner-ref";

// Кабинетът на партньора. Тайната е token-ът от имейла (48 hex). След първия
// успешен вход го пазим в httpOnly cookie — не в localStorage/sessionStorage,
// за да не го вижда JavaScript при XSS.
//   POST  {token}                 → кабинет + cookie
//   POST  {}                      → кабинет от cookie
//   POST  {code, phone, resend}   → {ok:true} винаги (имейл ако съвпада)
//   PATCH {pay_method}            → смяна (token от cookie)
//   DELETE                        → изход
export const runtime = "nodejs";

const COOKIE = "de_partner";
const TOKEN_RE = /^[a-f0-9]{48}$/;
const MAX_AGE = 30 * 24 * 3600;

async function tokenFrom(body: Record<string, unknown> | null) {
	const fromBody = str(body?.token, 64).toLowerCase();
	if (TOKEN_RE.test(fromBody)) return { token: fromBody, fresh: true };
	const fromCookie = (await cookies()).get(COOKIE)?.value?.toLowerCase() || "";
	return TOKEN_RE.test(fromCookie) ? { token: fromCookie, fresh: false } : null;
}

function withCookie(res: NextResponse, token: string | null) {
	if (token) res.cookies.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/partners", maxAge: MAX_AGE });
	else res.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/partners", maxAge: 0 });
	return res;
}

export async function POST(req: Request) {
	const ip = ipOf(req);
	if (limited("me", ip, 10, 10 * 60 * 1000)) return NextResponse.json({ error: "Твърде много опити." }, { status: 429 });
	const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

	if (body?.resend) {
		const code = normalizeCode(str(body.code, 20));
		const phone = str(body.phone, 30);
		if (code && phone.replace(/\D/g, "").length >= 9) await proxy("/me", { method: "POST", ip, body: { code, phone, resend: true } });
		return NextResponse.json({ ok: true });
	}

	const t = await tokenFrom(body);
	if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
	const r = await proxy("/me", { method: "POST", ip, body: { token: t.token } });
	if (r.status === 200) return withCookie(r, t.token);
	if (r.status === 404 && !t.fresh) return withCookie(r, null); // изтекъл/сменен token → чистим cookie-то
	return r;
}

export async function PATCH(req: Request) {
	const ip = ipOf(req);
	if (limited("me", ip, 10, 10 * 60 * 1000)) return NextResponse.json({ error: "Твърде много опити." }, { status: 429 });
	const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
	const t = await tokenFrom(null);
	if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
	const pay_method = body?.pay_method === "cash" || body?.pay_method === "credit" ? body.pay_method : null;
	if (!pay_method) return NextResponse.json({ error: "Bad pay_method" }, { status: 400 });
	return proxy("/me", { method: "PATCH", ip, body: { token: t.token, pay_method } });
}

export async function DELETE() {
	return withCookie(NextResponse.json({ ok: true }), null);
}
