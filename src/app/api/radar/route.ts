import { NextResponse } from "next/server";
import { proxy, limited, ipOf, str } from "@/lib/deos-proxy";

// POST /api/radar {city, niche, business?} | {token, business?} → тийзър от de-os.
// Скан отнема 30–90 сек при нов град+ниша (кешираните са мигновени).
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
	const ip = ipOf(req);
	if (limited("radar", ip, 6, 60 * 60 * 1000)) return NextResponse.json({ error: "Твърде много търсения. Опитайте след час." }, { status: 429 });
	let body: Record<string, unknown> = {};
	try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
	if (str(body.website)) return NextResponse.json({ error: "Bad request" }, { status: 400 }); // honeypot
	const token = str(body.token, 40);
	return proxy("/api/radar", {
		method: "POST",
		ip,
		body: token ? { token, business: str(body.business, 120) } : { city: str(body.city, 40), niche: str(body.niche, 60), business: str(body.business, 120) },
	}, 110000);
}
