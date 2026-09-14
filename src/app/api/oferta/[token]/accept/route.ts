// ── /api/oferta/[token]/accept — приемане на офертата (браузър → сайт → de-os) ──
// Добавя тайната, IP-то и User-Agent-а на клиента и препраща към de-os, който
// прави сметката и договора. Отговорът се връща 1:1.
import { NextResponse } from "next/server";
import { deosApi } from "@/lib/services";
import { ipOf, limited } from "@/lib/deos-proxy";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return NextResponse.json({ error: "Невалиден линк." }, { status: 404 });
	const ip = ipOf(req);
	if (limited("oferta-accept", ip, 10, 60 * 60 * 1000)) return NextResponse.json({ error: "Твърде много опити. Опитайте по-късно." }, { status: 429 });
	const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
	const secret = process.env.DEOS_HELLO_SECRET?.trim() || "";
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), 25000); // генерирането на PDF отнема секунда-две
	try {
		const r = await fetch(`${deosApi()}/oferta/${encodeURIComponent(token)}/accept`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: "https://digitaleffect.bg", ...(secret ? { "X-Hello-Secret": secret } : {}) },
			body: JSON.stringify({ selection: body.selection, company: body.company, acceptedBy: body.acceptedBy, agree: body.agree === true, ip, ua: req.headers.get("user-agent") || "" }),
			signal: ctrl.signal,
			cache: "no-store",
		});
		const data = await r.json().catch(() => ({}));
		return NextResponse.json(data, { status: r.status, headers: { "Cache-Control": "no-store" } });
	} catch (e) {
		console.error("[oferta/accept]", e instanceof Error ? e.message : e);
		return NextResponse.json({ error: "Услугата е временно недостъпна. Опитайте след минута или ни пишете на contacts@digitaleffect.bg." }, { status: 503 });
	} finally {
		clearTimeout(t);
	}
}
