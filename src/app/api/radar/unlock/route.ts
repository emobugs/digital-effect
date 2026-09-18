import { NextResponse } from "next/server";
import { proxy, limited, ipOf, str } from "@/lib/deos-proxy";

// POST /api/radar/unlock {token, email, name?, phone?, business?} → пълният списък.
export const runtime = "nodejs";

export async function POST(req: Request) {
	const ip = ipOf(req);
	if (limited("radar-unlock", ip, 10, 60 * 60 * 1000)) return NextResponse.json({ error: "Твърде много опити." }, { status: 429 });
	let body: Record<string, unknown> = {};
	try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
	if (str(body.website)) return NextResponse.json({ ok: true }); // honeypot
	const email = str(body.email, 120);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Невалиден имейл" }, { status: 400 });
	return proxy("/api/radar/unlock", {
		method: "POST",
		ip,
		body: { token: str(body.token, 40), email, name: str(body.name, 80), phone: str(body.phone, 30), business: str(body.business, 120) },
	}, 15000);
}
